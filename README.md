# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/agungherman/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/agungherman/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — an offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5: every trophy with its official name, description and grade, a guide in our own words that cites its sources, a checklist saved in the browser with export and import, filters by kind, a spoiler setting that hides story trophies until they are earned, a roadmap to the platinum, and the one missable trophy flagged.

## Run it

```sh
node serve.ts
```

Then open http://127.0.0.1:8080 in a desktop browser.

No install step: serve.ts uses the Node standard library only (Node 22 or later), so there is nothing to `npm install`. Or open `app/index.html` directly in a browser. Preview mode: open `app/index.html?demo=1` to see the tracker with 12 trophies already ticked (the view in the first screenshot).

## How it is built

- `app/index.html`, `app/style.css` and `app/app.js` — the guide itself: static files, no build step, no network at run time. The checklist saves progress in localStorage, exports it to a JSON file and imports it back, filters by kind (story, missable, collectibles, activities), and hides story trophies behind a spoiler setting until they are earned.
- `app/data/trophies.json` — the official 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with their official names, descriptions and grades, and a guide to each in our own words with its sources named.
- `main.ts` — the entrypoint (Node 22, standard library only): it verifies the 55 trophies and the grade split, copies `app/` and `screenshots/` to the output, and writes `dossier.json` with the kit's vendored library.
- `screenshots/` — 4 real renders of the guide running: the checklist, the roadmap, a trophy's guide open, and the missable trophy.
- `shots.json` — which view each screenshot was taken of.

## The guide at a glance

- **Roadmap:** four stages — do the one missable meditation in Chapter 1 first, play the story (60–80 hours), work the 100% completion checklist after the story, then clean up the strangers, collectibles and activities before the platinum.
- **Missables:** only one trophy can be missed — Positive Mental Attitude, because one meditation spot is at Jason's house in Chapter 1 and goes away when the chapter ends. Everything else can be finished in free-roam after the story.
- **Unconfirmed, labelled honestly:** Bad Luck, I Guess (no confirmed trigger yet), Fair Game (which exact animal unlocks it is still being checked), Positive Mental Attitude (whether the Chapter 1 meditation is required is unconfirmed) and Strangers & Freaks (more strands are still being discovered).
- **Sources:** the official trophy list on Exophase, PSNProfiles for PSN's counts, PowerPyx — GTA 6 Trophy Guide & Roadmap, KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap, and HappyGamer — GTA 6 Missables. Every guide names its sources; the official names and descriptions are shown as PlayStation publishes them.

---

<sub>Entered on [make.fun](https://make.fun/?ref=5wyg9qx0&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
