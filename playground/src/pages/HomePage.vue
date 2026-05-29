<script setup lang="ts">
import { useAuth } from '@zitadel/vue-auth';

const auth = useAuth();
</script>

<template>
  <section>
    <h1>Vue Auth with ZITADEL</h1>
    <p>
      A browser-only Single Page Application secured with the OpenID Connect
      Authorization Code Flow with PKCE, powered by
      <code>@zitadel/vue-auth</code>.
    </p>

    <p v-if="auth.isLoading">Checking your session…</p>
    <p v-else-if="auth.error" role="alert">
      Authentication error: {{ auth.error.message }}
    </p>
    <p v-else-if="auth.isAuthenticated">
      You are signed in as
      <strong>{{ auth.user?.profile.name ?? auth.user?.profile.sub }}</strong
      >. Head to the <RouterLink to="/profile">profile page</RouterLink>.
    </p>
    <template v-else>
      <p>You are not signed in.</p>
      <button type="button" @click="auth.signinRedirect()">
        Sign in with ZITADEL
      </button>
    </template>
  </section>
</template>
