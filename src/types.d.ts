interface Result extends Record<string, unknown> {
  id: number
  created_by: number
  created_at: string
  updated_at: string
}

interface GetResponse<T> {
  message: string
  return_code: string
  results: T
}

interface GetAllResponse<T> {
  message: string
  return_code: string
  results: Array<T>
}

export {
  Result,
  GetResponse,
  GetAllResponse,
}
