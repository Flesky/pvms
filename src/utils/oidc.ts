// TODO: To use, wrap the root component with the AuthProvider and pass the config object as props.

import type { OidcClientSettings } from 'oidc-client-ts'
import type { AuthProviderProps } from 'react-oidc-context'
import { User } from 'oidc-client-ts'

const oidcClientConfig: OidcClientSettings = {
  authority: import.meta.env.VITE_AUTHORITY_URL,
  client_id: import.meta.env.VITE_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_BASE_URL,
  scope: 'openid email profile',
  prompt: 'login',
}

const config: AuthProviderProps = {
  ...oidcClientConfig,
}

function getUser() {
  const oidcStorage = sessionStorage.getItem(`oidc.user:${import.meta.env.VITE_AUTHORITY_URL}:${import.meta.env.VITE_CLIENT_ID}`)
  if (!oidcStorage)
    return null

  return User.fromStorageString(oidcStorage)
}

const changePasswordUrl = `${import.meta.env.VITE_AUTHORITY_URL}/protocol/openid-connect/auth?client_id=${import.meta.env.VITE_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_BASE_URL}&response_type=code&scope=openid&kc_action=UPDATE_PASSWORD`

export { config, getUser, changePasswordUrl }
