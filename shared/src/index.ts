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
  fish: z.string().min(1, '魚種を選んでください'),
  prefecture: z.string().min(1, '都道府県を選んでください'),
  city: z.string().min(1, '市町村を選んでください'),
  lookbackDays: z.union([z.literal(1), z.literal(3), z.literal(5), z.literal(7)]),
})

const pages = {
  home: ''
}

export const validation = {
    contactSchema: contactSchema,
    aggregateSchema: aggregateSchema,
} as const


export const Shared = {
  api: api,
  validation: validation,
  pages: pages,
  test: test,
} as const
