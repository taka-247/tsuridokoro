import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app'
import { Shared } from '@app/shared'
import type { AggregateResult } from '@app/shared'

// Gemini 呼び出しはモックする（本物の API は叩かない）
vi.mock('./gemini', () => ({
  aggregateSearch: vi.fn(),
}))
import { aggregateSearch } from './aggregateSearch'

const validBody = {
  targetFish: 'ブリ',
  prefecture: '静岡県',
  city: '伊東市',
  lookbackDays: 3,
}

const sampleResult: AggregateResult = {
  meta: {
    targetFish: 'ブリ',
    prefecture: '静岡県',
    city: '伊東市',
    lookbackDays: 3,
    aggregatedAt: '2026-08-25T12:34:56+09:00',
    dataConfidence: 'medium',
    totalCatchCount: 12,
    spotCount: 2,
    sizeRange: '40〜60cm',
    sourceCount: 5,
  },
  spots: [
    {
      rank: 1,
      name: '宇佐美港',
      expectation: 5,
      expectationLabel: '期待大',
      location: { lat: null, lng: null, query: '宇佐美港' },
      totalCatchCount: 12,
      dailyCatchCounts: [{ date: '2026-08-25', count: 12 }],
      size: '40〜60cm',
      maxSize: '68cm',
      sources: [{ title: 'ANGLERSの釣果', url: 'https://example.com' }],
      notes: [],
    },
  ],
  otherSpots: ['富戸港'],
}

describe(`POST ${Shared.api.aggregate.url}`, () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 201 with the aggregated result', async () => {
    vi.mocked(aggregateSearch).mockResolvedValue(sampleResult)

    const res = await request(app).post(Shared.api.aggregate.url).send(validBody)

    expect(res.status).toBe(201)
    expect(res.body).toEqual(sampleResult)
    expect(aggregateSearch).toHaveBeenCalledWith(validBody)
  })

  it('returns 400 when the request body is invalid', async () => {
    const res = await request(app)
      .post(Shared.api.aggregate.url)
      .send({ ...validBody, city: '' })

    expect(res.status).toBe(400)
    expect(res.body.errorMessage).toBeTruthy()
    expect(aggregateSearch).not.toHaveBeenCalled()
  })

  it('returns 502 when aggregation throws', async () => {
    vi.mocked(aggregateSearch).mockRejectedValue(new Error('boom'))

    const res = await request(app).post(Shared.api.aggregate.url).send(validBody)

    expect(res.status).toBe(502)
    expect(res.body.errorMessage).toBeTruthy()
  })
})
