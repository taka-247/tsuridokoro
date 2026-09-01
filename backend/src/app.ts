import express from 'express'
import cors from 'cors'
import router from './routes'
import { config } from './config'

export const app = express()
app.use(cors({ origin: config.allowedOrigin ?? true }))
app.use(express.json())
app.use('/api', router)