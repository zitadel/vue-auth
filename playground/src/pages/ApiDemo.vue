<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@zitadel/vue-auth';

const auth = useAuth();
const result = ref<unknown>(null);
const error = ref<string | null>(null);
const loading = ref(false);

async function callUserinfo(): Promise<void> {
  error.value = null;
  result.value = null;
  const token = auth.value.user?.access_token;
  if (!token) {
    error.value = 'No access token — sign in first.';
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(
      `${import.meta.env.VITE_ZITADEL_DOMAIN}/oidc/v1/userinfo`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    result.value = await res.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section>
    <h1>API Demo</h1>
    <p>
      Calls the ZITADEL <code>/oidc/v1/userinfo</code> endpoint with the access
      token as a <code>Bearer</code> token.
    </p>
    <button type="button" :disabled="loading" @click="callUserinfo()">
      {{ loading ? 'Loading…' : 'Call userinfo' }}
    </button>
    <p v-if="error" role="alert">{{ error }}</p>
    <pre v-if="result">{{ result }}</pre>
  </section>
</template>
