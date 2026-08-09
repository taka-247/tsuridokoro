import express from 'express'
import cors from 'cors'
import router from './routes'

// Comma-separated allowlist (e.g. the Cloudflare Pages origin) via ALLOWED_ORIGIN.
// Unset -> reflect any origin (fine for local dev); set it in production.
const allowedOrigin = process.env.ALLOWED_ORIGIN?.split(',')

export const app = express()
app.use(cors({ origin: allowedOrigin ?? true }))
app.use(express.json())
app.use('/api', router)