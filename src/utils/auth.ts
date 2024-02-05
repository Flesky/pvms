import { SignInType, createOidcAuth } from 'vue-oidc-client/vue3'

const auth = createOidcAuth('main',
  SignInType.Window,
  import.meta.env.VITE_BASE_URL,
  {
    authority: import.meta.env.VITE_AUTHORITY_URL,
    client_id: import.meta.env.VITE_CLIENT_ID,
    response_type: 'id_token',
    scope: 'openid email profile',

    prompt: 'login',
  },
)

export default auth
