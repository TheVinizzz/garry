# garry-worker

Tiny Cloudflare Worker that converts a one-click README link into a real
GitHub Issue creation. Solves the "you have to press Create" friction
inherent to plain pre-filled Issue URLs.

## Deploy

```bash
cd worker
npm install
npx wrangler login                              # one-time
npx wrangler deploy                             # creates garry-worker.<your>.workers.dev
npx wrangler secret put GITHUB_TOKEN            # paste a fine-grained PAT
```

The PAT needs **Issues: Read & Write** scoped to `<your>/garry` only. Generate
one at https://github.com/settings/personal-access-tokens.

Output of `wrangler deploy` shows your Worker URL. Set it as
`GARRY_WORKER_URL` in the Garry repo and re-render — the README block will
then use those one-click links.

```bash
GARRY_WORKER_URL=https://garry-worker.<your>.workers.dev \
  GARRY_REPO=<your>/garry \
  node src/cli.js render
```

## Endpoints

- `GET /` — health page
- `GET /act/<action>` — creates `[garry/<action>] <label>` issue, redirects to profile
- Optional query: `?from=<handle>` to attribute the action, `?redirect=<url>` to override post-action page

Valid actions: `pet · feed · play · treat · sleep`.
