const config = {
  // Dev: '' → axios sends relative /api/... which Vite proxies to :3001
  // (same-origin, so no CORS). Prod: absolute Render URL baked in at build.
  baseURL: import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL ?? '/'
}

export default config