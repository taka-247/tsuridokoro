export const config = {
    port: Number(process.env.PORT) || 3001,
    apiKey: process.env.GEMINI_API_KEY || '',
    apiMode: process.env.GEMINI_API_MODE || '',
    // Comma-separated allowlist (e.g. the Cloudflare Pages origin) via ALLOWED_ORIGIN.
    // Unset -> reflect any origin (fine for local dev); set it in production.
    allowedOrigin: process.env.ALLOWED_ORIGIN?.split(',')
}