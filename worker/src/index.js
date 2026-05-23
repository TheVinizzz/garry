// Garry proxy — Cloudflare Worker that converts a single click into a real
// GitHub Issue creation, so a README link can interact with Garry in one tap
// (skipping the GitHub "Create" button entirely).
//
// Routes:
//   GET  /              — health page
//   GET  /act/<action>  — create an issue [garry/<action>] and redirect to profile
//
// Bindings (set via wrangler.toml [vars] + `wrangler secret put`):
//   GITHUB_TOKEN   secret  fine-grained PAT with Issues: Read & Write on REPO
//   REPO           var     "<owner>/<name>"          (e.g. TheVinizzz/garry)
//   REDIRECT_AFTER var     where to send user after  (e.g. https://github.com/TheVinizzz)

const VALID_ACTIONS = new Set(['pet', 'feed', 'play', 'treat', 'sleep']);

const ACTION_LABEL = {
  pet: 'cafuné',
  feed: 'almoço',
  play: 'brincar',
  treat: 'petisco',
  sleep: 'soneca',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '') {
      return new Response(homePage(env), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (url.pathname.startsWith('/act/')) {
      return handleAct(url, env);
    }

    return new Response('not found', { status: 404 });
  },
};

async function handleAct(url, env) {
  const action = url.pathname.slice('/act/'.length).replace(/[^a-z]/g, '');
  if (!VALID_ACTIONS.has(action)) {
    return jsonError(400, `unknown action: ${action}`);
  }
  if (!env.GITHUB_TOKEN) return jsonError(500, 'GITHUB_TOKEN not configured');
  if (!env.REPO) return jsonError(500, 'REPO not configured');

  const label = ACTION_LABEL[action] || action;
  const from = (url.searchParams.get('from') || '').trim().slice(0, 32) || 'someone';

  const body = [
    `Auto-created by garry-worker — ${from} sent a \`${action}\` to Garry.`,
    '',
    `> This issue is processed by the \`interact\` workflow and then closed.`,
  ].join('\n');

  const issueRes = await fetch(`https://api.github.com/repos/${env.REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'garry-worker',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `[garry/${action}] ${label}`,
      body,
      labels: ['garry', action],
    }),
  });

  if (!issueRes.ok) {
    const text = await issueRes.text();
    console.log('github API error', issueRes.status, text);
    return jsonError(issueRes.status, `github API: ${text.slice(0, 300)}`);
  }

  const issue = await issueRes.json();
  const redirect = url.searchParams.get('redirect') || env.REDIRECT_AFTER || issue.html_url;
  return Response.redirect(redirect, 302);
}

function jsonError(status, msg) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function homePage(env) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>garry-worker</title>
<style>body{background:#0d0a08;color:#f6e4b2;font-family:ui-monospace,monospace;padding:32px;line-height:1.6}
a{color:#ffd84a} code{color:#9bd1ff}</style></head>
<body>
<h1>🐈 garry-worker</h1>
<p>Endpoints:</p>
<ul>
<li><code>GET /act/pet</code> · <code>/act/feed</code> · <code>/act/play</code> · <code>/act/treat</code> · <code>/act/sleep</code></li>
<li>Optional query: <code>?from=&lt;handle&gt;</code> · <code>?redirect=&lt;url&gt;</code></li>
</ul>
<p>Repo: <code>${env.REPO || '(not set)'}</code></p>
<p>Source: <a href="https://github.com/${env.REPO || 'TheVinizzz/garry'}/tree/main/worker">github</a></p>
</body></html>`;
}
