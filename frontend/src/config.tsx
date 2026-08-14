const config = {
  baseURL: import.meta.env.DEV
  ? 'http://localhost:3001'
  : import.meta.env.VITE_API_BASE_URL ?? '/'
}

export default config