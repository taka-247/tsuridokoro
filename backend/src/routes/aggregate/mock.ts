import { Shared } from '@app/shared'
import type { AggregateInput, AggregateResult } from '@app/shared'
import { config } from '../../config'
import { delay } from '../../util'

/**
 * Gemini（Google検索グラウンディング付き）で釣果を集計し、§9.2 の形に整形して返す。
 * パース失敗・スキーマ不一致は例外を投げる（ルート側で 502 に変換）。
 */
export async function aggregateMockSearch(input: AggregateInput): Promise<AggregateResult> {
  if (config.apiMode !== 'mock') throw new Error('apiMode is wrong')
  if (!config.apiKey) throw new Error('GEMINI_API_KEY is not set')

  // 課金を発生させずにUIを開発するための固定ダミー結果（§9.2 の形）。
  // meta の入力系フィールドはユーザー入力を反映し、分析部分は作り物。
  const mock: AggregateResult = {
    meta: {
      targetFish: input.targetFish,
      prefecture: input.prefecture,
      city: input.city,
      lookbackDays: input.lookbackDays,
      aggregatedAt: '2026-08-25T12:34:56+09:00',
      dataConfidence: 'medium',
      totalCatchCount: 21,
      spotCount: 2,
      sizeRange: '40〜60cm',
      sourceCount: 7,
    },
    spots: [
      {
        rank: 1,
        name: '宇佐美港',
        expectation: 5,
        expectationLabel: '期待大',
        location: { lat: 34.9876, lng: 139.1234, query: '宇佐美港' },
        totalCatchCount: 12,
        dailyCatchCounts: [
          { date: '2026-08-23', count: 3 },
          { date: '2026-08-24', count: 5 },
          { date: '2026-08-25', count: 4 },
        ],
        size: '40〜60cm',
        maxSize: '68cm',
        sources: [{ title: 'ダミー釣果ブログ', url: 'https://example.com/mock-1' }],
        notes: [
          {
            text: '朝マズメにナブラが出て青物が連発（ダミーコメント）',
            source: 'ダミー釣具店ブログ',
            date: '2026-08-24',
            url: 'https://example.com/mock-note-1',
          },
        ],
      },
      {
        rank: 2,
        name: '伊東港',
        expectation: 3,
        expectationLabel: '期待中',
        location: { lat: 34.9667, lng: 139.1, query: '伊東港' },
        totalCatchCount: 9,
        dailyCatchCounts: [
          { date: '2026-08-23', count: 2 },
          { date: '2026-08-24', count: 3 },
          { date: '2026-08-25', count: 4 },
        ],
        size: '35〜50cm',
        maxSize: '55cm',
        sources: [{ title: 'ダミーANGLERSの釣果', url: 'https://example.com/mock-2' }],
        notes: [],
      },
    ],
    otherSpots: ['富戸港', '八幡野港', '赤沢港'],
  }

  console.dir('mock')
  console.dir(mock)

  const result = Shared.validation.aggregateResultSchema.safeParse(mock)
  if (!result.success) {
    throw new Error(`Gemini output did not match schema: ${result.error.message}`)
  }

  console.dir('result.data')
  console.dir(result.data)

  // to show loading screen
  await delay(1000)

  return result.data
}
