import { Router } from 'express'
import aggregateRouter from './aggregate/aggregate'

const router = Router()
router.use('/', aggregateRouter)

router.get('/', (_req, res) => {
  res.json({ status: 'ok' })
})

// Render health check target
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

export default router