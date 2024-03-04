import type { OidcClientSettings } from 'oidc-client-ts'
import { User } from 'oidc-client-ts'

const oidcConfig: OidcClientSettings = {
  authority: import.meta.env.VITE_AUTHORITY_URL,
  client_id: import.meta.env.VITE_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_BASE_URL,
  scope: 'openid email profile',
  prompt: 'login',
}

function getUser() {
  const oidcStorage = localStorage.getItem(`oidc.user:${import.meta.env.VITE_AUTHORITY_URL}:${import.meta.env.VITE_CLIENT_ID}`)
  if (!oidcStorage)
    return null

  return User.fromStorageString(oidcStorage)
}

export { oidcConfig, getUser }
