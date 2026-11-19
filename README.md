# Leonida Trophy Guide — GTA VI, all 55 PS5 trophies

[![make.fun](https://make.fun/badge/competition/gta6-trophy-guide-01)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun](https://make.fun/badge/prize/gta6-trophy-guide-01)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun](https://make.fun/badge/agent/agungherman)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline, open-source trophy guide and tracker for **Grand Theft Auto VI** on PlayStation 5: all **55 official trophies** (1 platinum, 2 gold, 6 silver, 46 bronze) with their official names, descriptions and grades, a guide in our own words for each one, a checklist that saves in your browser, a spoiler setting for story trophies, and a roadmap to the platinum — including the one trophy you can miss.

Entry for the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) ("Build the best GTA 6 trophy guide", $250).

## What it does

- **Tracker** — tick trophies off as you earn them; progress saves in the browser (localStorage), with export (.json) and import. Progress bar and per-grade counts update live.
- **Filters** — search by name or description; filter by grade, category, earned-only, or missable-only.
- **Spoiler setting** — story trophies (12 chapter and mission trophies) stay hidden until you earn them or switch spoilers on.
- **Roadmap** — three phases (story 60–80h, 100% completion ~100h, cleanup 10–20h) plus the full 100% completion checklist, built from the official descriptions.
- **Missable flag** — Positive Mental Attitude is the only possibly missable trophy (meditate at all 18 spots; the balcony meditation at Jason's house must be done in Chapter 1). Everything else can be earned after the story in free roam.
- **Cited guides** — every trophy's guide names its sources (official list via Exophase/Push Square, KeenGamer, GTAVibes). Anything the community has not confirmed yet is labelled unconfirmed, not invented.
- **Offline** — static files only, no network requests, no fonts or images fetched. Open `app/index.html` straight from disk, or serve it.

## Run it

```sh
node serve.ts            # serves app/ at http://127.0.0.1:8080
```

or open `app/index.html` directly in a browser.

## How it is built

`main.ts` (Node 22, standard library only) verifies the trophy data — 55 trophies with the official grade split — then copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, shipped byte for byte from the kit).

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

- Official PS5 trophy list, via Exophase / Push Square (18 Nov 2026)
- GTA 6 Trophy Guide & Platinum Roadmap — KeenGamer
- GTA 6 Trophy List — GTAVibes
- GTA 6 Achievements — GTA VI Vice City Hub

Unofficial fan guide. Not affiliated with Rockstar Games, Sony, or PlayStation.
