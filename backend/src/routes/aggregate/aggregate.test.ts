import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../../app'
import { Shared } from '@app/shared'

describe(`POST ${Shared.api.aggregate.url}`, () => {
  it('returns 201 with a message', async () => {
    const res = await request(app)
      .post(Shared.api.aggregate.url)
      .send({
        fish: 'ブリ',
        prefecture: '静岡県',
        city: '伊東市',
        lookbackDays: '3',
      })
    expect(res.status).toBe(201)
    expect(res.body).toEqual({ message: Shared.api.aggregate.successMessage })
  })
})