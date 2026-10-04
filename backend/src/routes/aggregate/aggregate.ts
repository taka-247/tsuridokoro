import { Shared } from '@app/shared'
import { Router } from 'express'
import { config } from '../../config'
import { aggregateSearch } from './aggregateSearch'
import { aggregateSearchMock } from './aggregateSearchMock'

const aggregateRouter = Router()

aggregateRouter.post('/aggregate', async (req, res) => {
  const result = Shared.validation.aggregateSchema.safeParse(req.body)

  if (!result.success) {
    const errorMessage = result.error.issues.map((issue: { message: string }) => issue.message).join(', ')
    res.status(400).json({ errorMessage })
    return
  }

  try {
    const aggregated = config.apiMode === 'live' ? await aggregateSearch(result.data) : await aggregateSearchMock(result.data)
    res.status(201).json(aggregated)
  } catch (err) {
    console.error('Aggregation failed:', err)
    res.status(502).json({ errorMessage: Shared.messages.error.aggregationFailed })
  }
})

export default aggregateRouter
