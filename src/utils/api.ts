import ky from 'ky'
import { getUser } from './oidc.ts'

export interface Error {
  error_field: string
  error_code: string
  error_message: string
}

export interface ErrorResult {
  message: string
  errors: Error[]
}
export function transformErrors(errors: Error[]) {
  return errors.reduce((acc, error) => {
    if (!acc[error.error_field])
      acc[error.error_field] = []

    acc[error.error_field].push(error.error_message)
    return acc
  }, {} as Record<string, string[]>)
}

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
    // beforeError: [
    //   async (error) => {
    //     const response = await error.response?.json() as ErrorResult
    //
    //     const transformedErrors = response.errors.reduce((acc, error) => {
    //       if (!acc[error.error_field])
    //         acc[error.error_field] = []
    //
    //       acc[error.error_field].push(error.error_message)
    //       return acc
    //     }, {} as Record<string, string[]>)
    //
    //     return { message: response.message, errors: transformedErrors }
    //   },
    // ],
  },
})

// export async function defaultApiError(error: HTTPError) {
//   const clone = error.response.clone()
//   const response = await clone.json()
//   notifications.show({ message: response.message })
//   return response
// }

export default api
