import { createApp, h } from 'vue';
import { AuthProvider } from '@zitadel/vue-auth';

import App from './App.vue';
import { router } from './router';

createApp({
  render: () =>
    h(
      AuthProvider,
      {
        authority: import.meta.env.VITE_ZITADEL_DOMAIN,
        client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID,
        redirect_uri: import.meta.env.VITE_ZITADEL_CALLBACK_URL,
        post_logout_redirect_uri: import.meta.env.VITE_ZITADEL_POST_LOGOUT_URL,
        onSigninCallback: () =>
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          ),
      },
      () => h(App),
    ),
})
  .use(router)
  .mount('#app');
