import type { Page } from '@playwright/test'
import { Shared } from '@app/shared'
import type { AggregateResult } from '@app/shared'

// Same URL as src/hooks/useRegions.ts. Mocked so tests don't depend on the network.
export const REGIONS_URL = 'https://geolonia.github.io/japanese-addresses/api/ja.json'

export const regions = {
  静岡県: ['伊東市', '熱海市'],
  東京都: ['千代田区', '八丈町'],
}

// Parsed with the shared schema so the fixture breaks loudly if the API contract changes.
export const aggregateResult: AggregateResult = Shared.validation.aggregateResultSchema.parse({
  meta: {
    targetFish: 'ブリ',
    prefecture: '静岡県',
    city: '伊東市',
    lookbackDays: 3,
    aggregatedAt: '2026-08-01T12:34:56+09:00',
    dataConfidence: 'medium',
    totalCatchCount: 28,
    spotCount: 3,
    sizeRange: '40〜60cm',
    sourceCount: 12,
  },
  spots: [
    {
      rank: 1,
      name: '宇佐美港',
      expectation: 5,
      expectationLabel: '期待大',
      location: { lat: 34.9876, lng: 139.1234, query: '宇佐美港' },
      totalCatchCount: 18,
      dailyCatchCounts: [
        { date: '2026-07-30', count: 5 },
        { date: '2026-07-31', count: 6 },
        { date: '2026-08-01', count: 7 },
      ],
      size: '40〜60cm',
      maxSize: '68cm',
      sources: [{ title: '釣具店ブログ', url: 'https://example.com/a' }],
      notes: [{ text: '朝マズメにナブラ', source: '釣具店ブログ', date: '2026-07-31', url: 'https://example.com/a' }],
    },
    {
      rank: 2,
      name: '伊東港',
      expectation: 3,
      expectationLabel: '期待中',
      location: { lat: null, lng: null, query: '伊東港' },
      totalCatchCount: 10,
      dailyCatchCounts: [
        { date: '2026-07-30', count: 2 },
        { date: '2026-07-31', count: 0 },
        { date: '2026-08-01', count: 8 },
      ],
      size: '40〜50cm',
      maxSize: '55cm',
      sources: [],
      notes: [],
    },
  ],
  otherSpots: ['八幡野港', '富戸港'],
})

/** Mock the external regions API (always) and /api/aggregate (when a handler is given). */
export async function mockApis(
  page: Page,
  aggregate?: { status: number; body: unknown },
) {
  await page.route(REGIONS_URL, (route) => route.fulfill({ json: regions }))
  if (aggregate) {
    await page.route('**/api/aggregate', (route) =>
      route.fulfill({ status: aggregate.status, json: aggregate.body }),
    )
  }
}
