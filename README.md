<!--GARRY:START-->
<div align="center">

## 🍪 Deixa um petisco para o Garry

<a href="https://github.com/TheVinizzz/garry/issues/new?template=treat.yml" title="deixa um petisco pro Garry">
  <img alt="Garry — clica em mim!" src="garry.svg?v=2026-05-23T05%3A58%3A37.868Z" width="460"/>
</a>

_**you** played with Garry · `2026-05-23 05:58 UTC`_

<table><tr>

    <td align="center" width="92">
      <a href="https://github.com/TheVinizzz/garry/issues/new?template=treat.yml" title="petisco">
        <img alt="petisco" src="https://img.shields.io/badge/%F0%9F%8D%AA-petisco-ffd84a?style=for-the-badge&labelColor=1f1814" height="44"/>
      </a>
    </td>

    <td align="center" width="92">
      <a href="https://github.com/TheVinizzz/garry/issues/new?template=pet.yml" title="cafuné">
        <img alt="cafuné" src="https://img.shields.io/badge/%F0%9F%A4%9A-cafun%C3%A9-ff7eb4?style=for-the-badge&labelColor=1f1814" height="44"/>
      </a>
    </td>

    <td align="center" width="92">
      <a href="https://github.com/TheVinizzz/garry/issues/new?template=feed.yml" title="almoço">
        <img alt="almoço" src="https://img.shields.io/badge/%F0%9F%8D%A3-almo%C3%A7o-f59a3a?style=for-the-badge&labelColor=1f1814" height="44"/>
      </a>
    </td>

    <td align="center" width="92">
      <a href="https://github.com/TheVinizzz/garry/issues/new?template=play.yml" title="brincar">
        <img alt="brincar" src="https://img.shields.io/badge/%F0%9F%A7%B6-brincar-b78bff?style=for-the-badge&labelColor=1f1814" height="44"/>
      </a>
    </td>

    <td align="center" width="92">
      <a href="https://github.com/TheVinizzz/garry/issues/new?template=sleep.yml" title="soneca">
        <img alt="soneca" src="https://img.shields.io/badge/%F0%9F%92%A4-soneca-7fc7ea?style=for-the-badge&labelColor=1f1814" height="44"/>
      </a>
    </td>
</tr></table>

</div>
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
