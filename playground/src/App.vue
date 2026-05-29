<script setup lang="ts">
import { useAuth } from '@zitadel/vue-auth';

const auth = useAuth();
</script>

<template>
  <div class="app">
    <header class="nav">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/profile">Profile</RouterLink>
        <RouterLink to="/api-demo">API Demo</RouterLink>
      </nav>
      <div class="status">
        <span v-if="auth.isLoading">Loading…</span>
        <template v-else-if="auth.isAuthenticated">
          <span>{{ auth.user?.profile.name ?? auth.user?.profile.sub }}</span>
          <button type="button" @click="auth.signoutRedirect()">
            Sign out
          </button>
        </template>
        <button v-else type="button" @click="auth.signinRedirect()">
          Sign in
        </button>
      </div>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}
.nav nav a {
  margin-right: 1rem;
}
.status {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
main {
  padding: 1.5rem;
}
pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  overflow: auto;
}
</style>
