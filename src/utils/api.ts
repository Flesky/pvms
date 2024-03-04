import ky from 'ky'
import { notifications } from '@mantine/notifications'
import { getUser } from './auth.ts'

const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  retry: {
    limit: 2,
    methods: ['get'],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getUser()?.access_token
        request.headers.set('Authorization', `Bearer ${token}`)
      },
    ],
    beforeError: [
      async (error) => {
        const response = await error.response.json()
        console.log(response)
        notifications.show({ message: response.message })
      },
    ],
  },
})

export default api
