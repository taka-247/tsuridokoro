import type { AggregateResult } from '@app/shared'

const RESULTS_KEY = 'tsuridokoro:results' // §9.4

/** 保存本体。expiresAt を過ぎた時点で丸ごと破棄する。 */
type ResultsStore = {
  /** 有効期限（epoch ms）= その週の日曜日 23:59:59.999 */
  expiresAt: number
  /** 新しい順の集計結果 */
  items: AggregateResult[]
}

/**
 * 引数の日付が属する週の「日曜日の終わり」を返す。
 * 週は月曜始まりとみなすため、日曜日当日はその日の 23:59:59.999 が期限になる。
 */
export function endOfWeekSunday(from: Date = new Date()): Date {
  const d = new Date(from)
  const daysUntilSunday = (7 - d.getDay()) % 7 // 日曜(0)なら当日
  d.setDate(d.getDate() + daysUntilSunday)
  d.setHours(23, 59, 59, 999)
  return d
}

function readStore(): ResultsStore | null {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(RESULTS_KEY)
  } catch {
    return null // プライベートモード等で localStorage が使えない
  }
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.items) || typeof parsed.expiresAt !== 'number') {
      clearResults()
      return null
    }
    if (Date.now() > parsed.expiresAt) {
      clearResults() // 週をまたいだので破棄
      return null
    }
    return parsed as ResultsStore
  } catch {
    clearResults()
    return null
  }
}

/** 保存済みの集計結果を新しい順で返す（期限切れなら空配列）。 */
export function loadResults(): AggregateResult[] {
  return readStore()?.items ?? []
}

/** index 番目の集計結果（既定は最新）。 */
export function loadResultAt(index = 0): AggregateResult | null {
  return loadResults()[index] ?? null
}

/** 集計結果を先頭に追加して保存する。期限はその週の日曜日まで。 */
export function saveResult(result: AggregateResult): void {
  const store: ResultsStore = {
    expiresAt: endOfWeekSunday().getTime(),
    items: [result, ...loadResults()],
  }
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(store))
  } catch {
    // 容量超過などは保存を諦める（画面表示は継続）
  }
}

/** 保存済みの集計結果をすべて削除する。 */
export function clearResults(): void {
  try {
    localStorage.removeItem(RESULTS_KEY)
  } catch {
    // noop
  }
}
