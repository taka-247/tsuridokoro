import axios from 'axios'
import type { AxiosInstance } from 'axios'

interface MyAxiosInstance extends AxiosInstance {
  isAxiosError: typeof axios.isAxiosError
}

// In production, VITE_API_BASE_URL points at the Render backend (baked in at build).
// In dev it's unset, so we fall back to '/' and let the Vite proxy forward /api.
const instance = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '/' })
;(instance as MyAxiosInstance).isAxiosError = axios.isAxiosError

const myAxios = instance as MyAxiosInstance

export default myAxios