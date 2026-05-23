#!/usr/bin/env node
// Generate Garry frames via OpenAI gpt-image API.
//
// Usage:
//   OPENAI_API_KEY=sk-... node bin/generate.js              # generate all 8 moods
//   OPENAI_API_KEY=sk-... node bin/generate.js base         # only concept
//   OPENAI_API_KEY=sk-... node bin/generate.js mood happy   # one mood
//   OPENAI_API_KEY=sk-... node bin/generate.js all --force  # regen even if files exist

import { generateBase, generateMood, generateAll } from '../src/ai-gen.js';

const [, , cmd, arg] = process.argv;
const force = process.argv.includes('--force');

async function main() {
  switch (cmd) {
    case 'base':
      await generateBase({ overwrite: force });
      break;
    case 'mood':
      if (!arg || arg.startsWith('--')) throw new Error('mood requires <name>');
      await generateMood(arg, { overwrite: force });
      break;
    case 'all':
    case undefined:
      await generateAll({ overwrite: force });
      break;
    default:
      console.error('usage: generate.js [base | mood <name> | all] [--force]');
      process.exit(1);
  }
}

main().catch(e => {
  console.error(`[generate] ${e.message}`);
  process.exit(1);
});
