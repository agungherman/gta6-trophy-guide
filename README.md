# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/agungherman/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/agungherman/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Entry for the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01): an offline guide and tracker for all 55 official GTA VI PlayStation 5 trophies (1 platinum, 2 gold, 6 silver, 46 bronze), with a per-trophy guide in plain words, a five-stage roadmap to the platinum, and a checklist that saves in your browser.

## Run it

```sh
node serve.ts            # serves app/ at http://127.0.0.1:8080 (add --port <n> to change the port)
```

No install step: serve.ts uses the Node standard library only (Node 22 or later), so there is nothing to `npm install`. Or open `app/index.html` directly in a browser. Preview mode: open `app/index.html?demo=1` to see the tracker with 12 trophies already ticked (the view in the first screenshot).

## How it is built

- `app/data/trophies.json` holds the official 55 trophies (list dated 2026-11-18). Every trophy carries a kind (story, activity, collectible or completion), a roadmap stage (1–5), a guide written in plain words, and a named source. Four trophies are labelled unconfirmed where the community has not pinned the details down yet — the tracker shows them with an "unconfirmed" tag so you know not to trust them blindly.
- `app/index.html`, `app/style.css` and `app/app.js` are the tracker. It is a single-page app with no build step and no network requests: a localStorage checklist, search plus filters by kind, grade and earned state, a spoiler toggle that hides unearned story trophies (on by default), a five-stage roadmap view, a missables view, and export/import of your progress as JSON. Query parameters shape the first view: `?demo=1` seeds 12 earned trophies for a preview, `?view=roadmap` or `?view=missables` opens that tab, and `?trophy=<id>` opens one trophy's guide.
- `main.ts` is the entrypoint. Before handing anything in it checks the trophy list and reports every problem at once, naming the failing trophy by id and name: the 55-trophy count, the 1/2/6/46 grade split, duplicate ids or names, blank guides, descriptions or sources, stages outside 1–5, and exactly one missable. Then it copies `app/` and `screenshots/` to the output and writes `dossier.json` with the vendored make.fun library.
- Only one trophy can be missed: Positive Mental Attitude (meditate at all 18 spots). The guide warns you to do each spot as you find it, because the Chapter 1 spot may not come back. The missables view lists it on its own so it is impossible to overlook.

## Sources

Trophy list: the official 55 (kit starter, 2026-11-18). Guides cross-checked against Exophase, PSNProfiles, PowerPyx, KeenGamer and HappyGamer; each trophy names its source in `app/data/trophies.json`.
