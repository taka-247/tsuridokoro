import { readFileSync } from 'fs'
import { join } from 'path'
import { GoogleGenAI } from '@google/genai'
import { Shared } from '@app/shared'
import type { AggregateInput, AggregateResult } from '@app/shared'
import { config } from '../../config'

const MODEL = 'gemini-3.6-flash'
const PROMPT_FILE = 'prompt.md'

// プロンプト定義ファイル。ビルド後も dist に同梱する（package.json の build で cp）。
const promptTemplate = readFileSync(join(__dirname, PROMPT_FILE), 'utf-8')

/** JST の ISO8601 文字列（例: 2026-08-25T12:34:56+09:00）を返す */
function nowJst(): string {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const p = (t: string) => parts.find((x) => x.type === t)!.value
  return `${p('year')}-${p('month')}-${p('day')}T${p('hour')}:${p('minute')}:${p('second')}+09:00`
}

/** JST の YYYY-MM-DD */
function jstDate(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000)
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(d)
}

function fill(text: string, key: string, value: string): string {
  return text.split(`{{${key}}}`).join(value)
}

function buildPrompt(input: AggregateInput): string {
  const today = jstDate(0)
  const startDate = jstDate(-(input.lookbackDays - 1))
  let out = promptTemplate
  out = fill(out, 'targetFish', input.targetFish)
  out = fill(out, 'prefecture', input.prefecture)
  out = fill(out, 'city', input.city)
  out = fill(out, 'lookbackDays', String(input.lookbackDays))
  out = fill(out, 'today', today)
  out = fill(out, 'startDate', startDate)
  return out
}

/** ```json ... ``` フェンスや前後の雑文を除去して JSON 本体を取り出す */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) return fenced[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1)
  return text.trim()
}

/**
 * Gemini（Google検索グラウンディング付き）で釣果を集計し、§9.2 の形に整形して返す。
 * パース失敗・スキーマ不一致は例外を投げる（ルート側で 502 に変換）。
 */
export async function aggregateSearch(input: AggregateInput): Promise<AggregateResult> {
  if (config.apiMode !== 'live') throw new Error('apiMode is wrong')
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(input),
    config: {
      tools: [{ googleSearch: {} }], // Google検索グラウンディング
    },
  })

  const text = response.text ?? ''
  if (!text) throw new Error('Gemini returned an empty response')

  let parsed: unknown
  try {
    parsed = JSON.parse(extractJson(text))
  } catch {
    throw new Error('Failed to parse Gemini JSON output')
  }

  // 決定的なメタ情報はサーバーが上書き（AIの取り違え・タイムスタンプを信頼しない）
  // TODO: for what?
  if (parsed && typeof parsed === 'object' && 'meta' in parsed) {
    const p = parsed as { meta: Record<string, unknown> }
    // TODO: revise so that input name shoule be hard-code
    p.meta = {
      ...p.meta,
      targetFish: input.targetFish,
      prefecture: input.prefecture,
      city: input.city,
      lookbackDays: input.lookbackDays,
      aggregatedAt: nowJst(),
    }
  }

  const result = Shared.validation.aggregateResultSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error(`Gemini output did not match schema: ${result.error.message}`)
  }
  return result.data
}
