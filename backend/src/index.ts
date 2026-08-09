import { app } from './app'

// Render (and most hosts) inject PORT; fall back to 3001 for local dev.
const port = Number(process.env.PORT) || 3001
app.listen(port, () => console.log(`Backend running on port ${port}`))