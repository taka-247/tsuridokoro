import axios from 'axios'
import type { AxiosInstance } from 'axios'
import config from '../config'

interface MyAxiosInstance extends AxiosInstance {
  isAxiosError: typeof axios.isAxiosError
}

// Local dev → the local backend. Production → the deployed backend via
// VITE_API_BASE_URL (baked in at build). import.meta.env.DEV is a static
// boolean Vite inlines, so the unused branch is dropped from the prod bundle.

const instance = axios.create({ baseURL: config.baseURL })
;(instance as MyAxiosInstance).isAxiosError = axios.isAxiosError

const myAxios = instance as MyAxiosInstance

export default myAxios