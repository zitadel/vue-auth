---
title: Hosting
group: Advanced
---

# Hosting a Vue SPA

A `@zitadel/vue-auth` application is a static single-page app: `vite build`
emits plain HTML, JavaScript, and CSS that any static host can serve.
There is no server runtime and no secret to deploy.

## Build

```bash
npm run build
```

The output (by default `dist/`) is what you upload to your host or CDN.

## History fallback

The app uses `createWebHistory`, so routes like `/profile` and
`/auth/callback` are real client-side paths. A static host must rewrite
every unknown path to `index.html`, otherwise a hard refresh on a deep
link returns a 404.

Common configurations:

- **Netlify** — add a `public/_redirects` file:

  ```
  /*    /index.html   200
  ```

- **Vercel** — add a `vercel.json`:

  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

- **Nginx** — `try_files $uri /index.html;`

## Provider configuration

Whichever host you choose, register the deployed URLs in ZITADEL:

- **Redirect URI** — `https://your-app.example.com/auth/callback`
- **Post Logout Redirect URI** —
  `https://your-app.example.com/auth/logout/callback`

These must exactly match the `redirect_uri` and
`post_logout_redirect_uri` you pass to `AuthProvider`.
