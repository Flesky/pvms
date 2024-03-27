import ky from 'ky'
import { notifications } from '@mantine/notifications'
import { getUser } from './oidc.ts'

const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  retry: 0,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getUser()?.access_token
        request.headers.set('Authorization', `Bearer ${token}`)
        // request.headers.set('Authorization', `q`)
      },
    ],
    beforeError: [
      async (error) => {
        const clone = error.response.clone()
        const response = await clone.json()
        console.log(response)
        notifications.show({ message: response.message })
        return error
      },
    ],
  },
})

export default api
