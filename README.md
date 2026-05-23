<!--GARRY:START-->
<details><summary>🐈 <b>Deixa um petisco para o Garry</b></summary>

<div align="center">

<a href="https://github.com/TheVinizzz/garry/issues/new?title=%5Bgarry%2Ftreat%5D%20petisco&body=Auto-submit%20to%20interact%20with%20Garry.%20Just%20press%20**Submit%20new%20issue**%20%E2%80%94%20no%20need%20to%20fill%20anything.&labels=garry%2Ctreat" title="deixa um petisco pro Garry"><img alt="Garry" src="garry.svg?v=2026-05-23T06%3A04%3A23.605Z" width="280"/></a>

<sub>**TheVinizzz** gave a treat to Garry · `2026-05-23 06:04 UTC`</sub>

<a href="https://github.com/TheVinizzz/garry/issues/new?title=%5Bgarry%2Ftreat%5D%20petisco&body=Auto-submit%20to%20interact%20with%20Garry.%20Just%20press%20**Submit%20new%20issue**%20%E2%80%94%20no%20need%20to%20fill%20anything.&labels=garry%2Ctreat" title="petisco Garry"><img alt="petisco" src="https://img.shields.io/badge/%F0%9F%8D%AA-petisco-ffd84a?style=flat-square&labelColor=1f1814" height="22"/></a> <a href="https://github.com/TheVinizzz/garry/issues/new?title=%5Bgarry%2Fpet%5D%20cafun%C3%A9&body=Auto-submit%20to%20interact%20with%20Garry.%20Just%20press%20**Submit%20new%20issue**%20%E2%80%94%20no%20need%20to%20fill%20anything.&labels=garry%2Cpet" title="cafuné Garry"><img alt="cafuné" src="https://img.shields.io/badge/%F0%9F%A4%9A-cafun%C3%A9-ff7eb4?style=flat-square&labelColor=1f1814" height="22"/></a> <a href="https://github.com/TheVinizzz/garry/issues/new?title=%5Bgarry%2Ffeed%5D%20almo%C3%A7o&body=Auto-submit%20to%20interact%20with%20Garry.%20Just%20press%20**Submit%20new%20issue**%20%E2%80%94%20no%20need%20to%20fill%20anything.&labels=garry%2Cfeed" title="almoço Garry"><img alt="almoço" src="https://img.shields.io/badge/%F0%9F%8D%A3-almo%C3%A7o-f59a3a?style=flat-square&labelColor=1f1814" height="22"/></a> <a href="https://github.com/TheVinizzz/garry/issues/new?title=%5Bgarry%2Fplay%5D%20brincar&body=Auto-submit%20to%20interact%20with%20Garry.%20Just%20press%20**Submit%20new%20issue**%20%E2%80%94%20no%20need%20to%20fill%20anything.&labels=garry%2Cplay" title="brincar Garry"><img alt="brincar" src="https://img.shields.io/badge/%F0%9F%A7%B6-brincar-b78bff?style=flat-square&labelColor=1f1814" height="22"/></a> <a href="https://github.com/TheVinizzz/garry/issues/new?title=%5Bgarry%2Fsleep%5D%20soneca&body=Auto-submit%20to%20interact%20with%20Garry.%20Just%20press%20**Submit%20new%20issue**%20%E2%80%94%20no%20need%20to%20fill%20anything.&labels=garry%2Csleep" title="soneca Garry"><img alt="soneca" src="https://img.shields.io/badge/%F0%9F%92%A4-soneca-7fc7ea?style=flat-square&labelColor=1f1814" height="22"/></a>

</div>

</details>
<!--GARRY:END-->

---

<details>
<summary><b>about Garry</b> — how this works</summary>

<br/>

Garry is a chonky kawaii-anime cat that lives in this README. He breathes,
sways, hops, and reacts to GitHub Issues. His stats tick down over time and
his mood updates based on how he feels.

- Click Garry (or any button) to open a pre-filled Issue Form.
- Submitting fires the `interact` workflow, which mutates state, re-renders
  the SVG, and commits the update.
- A cron workflow ticks every 30 minutes to decay his stats.
- Everything runs on GitHub Actions — no external server, no JavaScript.

### Run it locally

```bash
npm run play       # fluid playtest server, no reloads (http://localhost:3737)
npm run render     # re-render garry.svg from state.json
npm run tick       # apply 30-min decay
npm run act -- pet alice   # simulate alice petting Garry
npm run gen        # regenerate AI mood frames (OpenAI gpt-image)
npm test           # engine tests
```

### Adopt Garry on your own profile

1. Fork this repo into a repo named **exactly** after your GitHub username
   (that's what turns it into the profile README).
2. `Settings → Actions → General → Workflow permissions → Read and write`.
3. Keep these markers in your `README.md`:
   ```html
   <!--GARRY:START-->
   <!--GARRY:END-->
   ```
4. Push. The first scheduled tick populates the block.

### File layout

```
src/
  ai-gen.js       OpenAI gpt-image client (transparent sprites)
  illustration.js vector fallback paths
  render.js       layered SVG: bg + animated Garry + game HUD
  engine.js       state, decay, action effects, mood resolution
  readme.js       README block injector
  cli.js          command entrypoint
bin/
  generate.js     CLI to regen AI frames
  playtest.js     local HTTP server with fluid SMIL animations
assets/
  concept.png        canonical character reference
  frames/<mood>.png  HD transparent sprites
  frames-opt/<mood>.webp  compressed for SVG embedding
state.json     persisted state
garry.svg      rendered card
```

</details>
