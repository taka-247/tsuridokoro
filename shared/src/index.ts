import { z } from 'zod'
import { http, HttpResponse } from 'msw'

const testMessage = 'Hello from backend!'

const test = {
  buttonText: 'API Test'
}

const api = {
  local: 'http://localhost',
  test: {
    message: testMessage,
    url: '/api/test',
    successMessage: 'Success!',
    failMessage: 'Failed!',
  },
  aggregate: {
    successMessage: 'Message received successfully!',
    url: '/api/aggregate',
  },
  contact: {
    successMessage: 'Message received successfully!',
    url: '/api/contact',
  },
  handlers: [
    http.get('/api/test', () => {
      return HttpResponse.json({ message: testMessage })
    }),
  ]
} as const

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

const aggregateSchema = z.object({
  targetFish: z.string().min(1, '魚種を選んでください'),
  prefecture: z.string().min(1, '都道府県を選んでください'),
  city: z.string().min(1, '市町村を選んでください'),
  lookbackDays: z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(7)]),
})

// ── 集計結果（BFF → フロント / SessionStorage 保存本体）。仕様書 §9.2 の契約。
// バックエンドが Gemini 出力をこの形に整形・検証し、フロントは型として利用する。
const dataConfidenceSchema = z.enum(['high', 'medium', 'low'])

const aggregateResultSchema = z.object({
  meta: z.object({
    targetFish: z.string(),
    prefecture: z.string(),
    city: z.string(),
    lookbackDays: z.number(),
    aggregatedAt: z.string(), // ISO8601（サーバーが JST で付与）
    dataConfidence: dataConfidenceSchema,
    totalCatchCount: z.number(),
    spotCount: z.number(),
    sizeRange: z.string(),
    sourceCount: z.number(),
  }),
  spots: z.array(
    z.object({
      rank: z.number(),
      name: z.string(),
      expectation: z.number().int().min(1).max(5),
      expectationLabel: z.string(),
      location: z.object({
        lat: z.number().nullable(),
        lng: z.number().nullable(),
        query: z.string(),
      }),
      totalCatchCount: z.number(),
      dailyCatchCounts: z.array(
        z.object({ date: z.string(), count: z.number() }),
      ),
      size: z.string(),
      maxSize: z.string(),
      sources: z.array(z.object({ title: z.string(), url: z.string() })),
      notes: z.array(
        z.object({
          text: z.string(),
          source: z.string(),
          date: z.string(),
          url: z.string(),
        }),
      ),
    }),
  ),
  otherSpots: z.array(z.string()),
})

const pages = {
  home: ''
}

const messages = {
  error: {
    aggregationFailed: '集計に失敗しました。時間をおいて再試行してください。',
  }
}

export const validation = {
    contactSchema: contactSchema,
    aggregateSchema: aggregateSchema,
    aggregateResultSchema: aggregateResultSchema,
} as const

// 型エクスポート（フロント/バックエンドで共有）
export type AggregateInput = z.infer<typeof aggregateSchema>
export type AggregateResult = z.infer<typeof aggregateResultSchema>
export type DataConfidence = z.infer<typeof dataConfidenceSchema>


export const Shared = {
  api: api,
  validation: validation,
  pages: pages,
  messages: messages,
  test: test,
} as const
