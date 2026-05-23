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
  const issuesBase = repo ? `https://github.com/${repo}/issues/new?template=` : '#';
  const v = encodeURIComponent(state.lastAction?.ts || state.lastTick || Date.now());
  const ts = new Date(state.lastAction?.ts || state.lastTick).toISOString().replace('T', ' ').slice(0, 16);
  const last = state.lastAction || { action: 'born', user: null };
  const lastLine = last.user
    ? `**${escapeMd(last.user)}** ${verbFor(last.action)} Garry · \`${ts} UTC\``
    : `Garry just woke up · \`${ts} UTC\``;

  const button = (action, emoji, label) => `
    <td align="center" width="92">
      <a href="${issuesBase}${action}.yml" title="${label}">
        <img alt="${label}" src="https://img.shields.io/badge/${encodeURIComponent(emoji)}-${encodeURIComponent(label)}-${BTN_COLOR[action]}?style=for-the-badge&labelColor=1f1814" height="44"/>
      </a>
    </td>`;

  return [
    '<div align="center">',
    '',
    '## 🍪 Deixa um petisco para o Garry',
    '',
    `<a href="${issuesBase}treat.yml" title="deixa um petisco pro Garry">`,
    `  <img alt="Garry — clica em mim!" src="${svgPath}?v=${v}" width="460"/>`,
    '</a>',
    '',
    `_${lastLine}_`,
    '',
    '<table><tr>',
    button('treat', '🍪', 'petisco'),
    button('pet', '🤚', 'cafuné'),
    button('feed', '🍣', 'almoço'),
    button('play', '🧶', 'brincar'),
    button('sleep', '💤', 'soneca'),
    '</tr></table>',
    '',
    '</div>',
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
