import { SignInType, createOidcAuth } from 'vue-oidc-client/vue3'

const auth = createOidcAuth('main',
  SignInType.Window,
  import.meta.env.VITE_BASE_URL,
  {
    authority: 'https://id.smsglobal.net/realms/master/',
    client_id: 'kc-test',
    response_type: 'id_token',
    scope: 'openid email profile',

    prompt: 'login',
  },
)

export default auth
