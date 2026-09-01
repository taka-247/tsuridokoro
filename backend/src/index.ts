import 'dotenv/config'
import { app } from './app'
import { config } from './config'

// Render (and most hosts) inject PORT; fall back to 3001 for local dev.
app.listen(config.port, () => console.log(`Backend running on port ${config.port}`))