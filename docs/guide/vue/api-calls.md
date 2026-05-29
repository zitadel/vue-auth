---
title: API Calls
group: Vue
---

# Calling an API

The signed-in user carries an `access_token`. Send it as a Bearer token
on the `Authorization` header of your API requests.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@zitadel/vue-auth';

const auth = useAuth();
const data = ref<unknown>(null);

async function load(): Promise<void> {
  const token = auth.value.user?.access_token;
  if (!token) {
    return;
  }
  const res = await fetch('https://api.example.com/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  data.value = await res.json();
}
</script>

<template>
  <button @click="load()">Load</button>
  <pre v-if="data">{{ data }}</pre>
</template>
```

## Hitting the userinfo endpoint

A common first call is the provider's own userinfo endpoint, derived from
your `authority`:

```ts
const res = await fetch(`${import.meta.env.VITE_ZITADEL_DOMAIN}/oidc/v1/userinfo`, {
  headers: { Authorization: `Bearer ${auth.value.user?.access_token}` },
});
```

## Token freshness

When silent renew is enabled, the `access_token` is refreshed in the
background and `auth.value.user` updates reactively. Always read the token
off `auth.value.user` at call time rather than caching it, so each request
uses the freshest token.
