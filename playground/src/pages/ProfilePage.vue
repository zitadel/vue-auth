<script setup lang="ts">
import { useAuth } from '@zitadel/vue-auth';

// This route is protected by the global `createAuthGuard()` registered in
// router.ts (it carries `meta.requiresAuth`). Anonymous visitors are
// redirected to sign in before they ever reach this component, so here we
// can assume an authenticated user.
const auth = useAuth();
</script>

<template>
  <section>
    <h1>Profile</h1>
    <p>The decoded claims from your ID token:</p>
    <pre>{{ auth.user?.profile }}</pre>
    <button type="button" @click="auth.signoutRedirect()">Sign out</button>
  </section>
</template>
