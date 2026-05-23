// README block injector. Replaces content between markers with rendered status.

const START = '<!--GARRY:START-->';
const END = '<!--GARRY:END-->';

export function injectBlock(readmeContent, block) {
  const startIdx = readmeContent.indexOf(START);
  const endIdx = readmeContent.indexOf(END);
  const newBlock = `${START}\n${block}\n${END}`;
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    return readmeContent.trimEnd() + '\n\n' + newBlock + '\n';
  }
  return readmeContent.slice(0, startIdx) + newBlock + readmeContent.slice(endIdx + END.length);
}

export function statusBlock(state, { repo, svgPath = 'garry.svg' } = {}) {
  // We bypass Issue Forms entirely — using pre-filled regular Issue URLs cuts
  // the interaction down to ONE click ("Submit new issue") instead of two.
  // The interact workflow parses the title prefix `[garry/<action>]` anyway.
  const issuesBase = repo ? `https://github.com/${repo}/issues/new` : '#';
  const v = encodeURIComponent(state.lastAction?.ts || state.lastTick || Date.now());
  const ts = new Date(state.lastAction?.ts || state.lastTick).toISOString().replace('T', ' ').slice(0, 16);
  const last = state.lastAction || { action: 'born', user: null };
  const lastLine = last.user
    ? `**${escapeMd(last.user)}** ${verbFor(last.action)} Garry · \`${ts} UTC\``
    : `Garry awoke · \`${ts} UTC\``;

  const actionUrl = (action, niceLabel) =>
    `${issuesBase}?title=${encodeURIComponent(`[garry/${action}] ${niceLabel}`)}&body=${encodeURIComponent('Auto-submit to interact with Garry. Just press **Submit new issue** — no need to fill anything.')}&labels=${encodeURIComponent('garry,' + action)}`;

  const btn = (action, emoji, label) =>
    `<a href="${actionUrl(action, label)}" title="${label} Garry"><img alt="${label}" src="https://img.shields.io/badge/${encodeURIComponent(emoji)}-${encodeURIComponent(label)}-${BTN_COLOR[action]}?style=flat-square&labelColor=1f1814" height="22"/></a>`;

  // IMPORTANT: keep this block flush-left. Any leading spaces inside the
  // <table> would trigger Markdown's 4-space-indent code block rule and
  // GitHub would render the HTML as plain text.
  return [
    '<details><summary>🐈 <b>Deixa um petisco para o Garry</b></summary>',
    '',
    '<div align="center">',
    '',
    `<a href="${actionUrl('treat', 'petisco')}" title="deixa um petisco pro Garry"><img alt="Garry" src="${svgPath}?v=${v}" width="280"/></a>`,
    '',
    `<sub>${lastLine}</sub>`,
    '',
    `${btn('treat', '🍪', 'petisco')} ${btn('pet', '🤚', 'cafuné')} ${btn('feed', '🍣', 'almoço')} ${btn('play', '🧶', 'brincar')} ${btn('sleep', '💤', 'soneca')}`,
    '',
    '</div>',
    '',
    '</details>',
  ].join('\n');
}

// Per-action colors for the shields.io action buttons.
const BTN_COLOR = {
  pet: 'ff7eb4',
  feed: 'f59a3a',
  play: 'b78bff',
  treat: 'ffd84a',
  sleep: '7fc7ea',
};

function verbFor(action) {
  return {
    pet: 'petted',
    feed: 'fed',
    play: 'played with',
    sleep: 'tucked in',
    treat: 'gave a treat to',
    born: 'met',
  }[action] || action;
}

function escapeMd(s) {
  return String(s).replace(/[\[\]_*`]/g, c => '\\' + c);
}
