import { Shared } from '@app/shared'
import { Router } from 'express'

const aggregateRouter = Router()

aggregateRouter.post('/aggregate', (req, res) => {
  const result = Shared.validation.aggregateSchema.safeParse(req.body)

  if (!result.success) {
    const errorMessage = result.error.issues.map((issue: { message: string }) => issue.message).join(', ')
    res.status(400).json({ errorMessage: errorMessage })
    return
  }

  const { fish, prefecture, city, lookbackDays } = result.data

  // TODO: Gemini LLM Search
  console.log('Home form received:', { fish, prefecture, city, lookbackDays })
  const aggregated = 'aggregated'

  // Note: send email, save to DB, etc here.

  res.status(201).json({ data: aggregated })
})

export default aggregateRouter