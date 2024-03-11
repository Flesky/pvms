/// <reference types="vite/client" />

type URL = string

interface ImportMetaEnv {
  readonly VITE_API_URL: URL

  readonly VITE_AUTHORITY_URL: string
  readonly VITE_BASE_URL: string
  readonly VITE_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
