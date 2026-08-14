import { Router } from 'express'
import aggregateRouter from './aggregate/aggregate'
import contactRouter from './contact/contact'

const router = Router()
router.use('/', aggregateRouter)
router.use('/', contactRouter)

router.get('/', (_req, res) => {
    console.dir('aaaaa')
  res.json({ status: 'ok' })
})

// Render health check target
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

export default router