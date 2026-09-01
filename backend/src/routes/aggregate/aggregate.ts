import { Shared } from '@app/shared'
import { Router } from 'express'
import { aggregateSearch } from './gemini'
import { config } from '../../config'
import { aggregateMockSearch } from './mock'

const aggregateRouter = Router()

aggregateRouter.post('/aggregate', async (req, res) => {
  const result = Shared.validation.aggregateSchema.safeParse(req.body)

  if (!result.success) {
    const errorMessage = result.error.issues.map((issue: { message: string }) => issue.message).join(', ')
    res.status(400).json({ errorMessage })
    return
  }

  try {
    const aggregated = config.apiMode === 'live' ? await aggregateSearch(result.data) : await aggregateMockSearch(result.data)
    console.dir('aggregated')
    console.dir(aggregated)
    res.status(201).json(aggregated)
  } catch (err) {
    console.error('Aggregation failed:', err)
    res.status(502).json({ errorMessage: '集計に失敗しました。時間をおいて再試行してください。' })
  }
})

export default aggregateRouter
