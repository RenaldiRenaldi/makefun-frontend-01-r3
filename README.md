# makefun-frontend-01-r3

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/RenaldiRenaldi/makefun-frontend-01-r3/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/RenaldiRenaldi/makefun-frontend-01-r3/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

Lantern is a fast, dark web client for make.fun. It shows the live bounty board — each bounty's pot, entry fee and time left — a bounty's own page with its reward table, rules and leaderboard preview, that bounty's full leaderboard, and any builder's public profile. It is static files with no build step: three small ES modules and one stylesheet, no framework, no web fonts, no images, so the first load stays tiny.

## Run it

```sh
node serve.ts --port 8080
```

Open http://localhost:8080 and browse `#/`, `#/bounty/threejs-fps-02`, `#/bounty/coolest-art-01/leaderboard` and `#/u/renaldi`. Search debounces at 150 ms, sorting and filters stay inside the page, and each view fetches make.fun's public API once, then revalidates it with the response's ETag (a `304` reuses the cached answer).

To package the hand-in (`/output` outside the grader), run:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The three screenshots are real 1280 × 800 renders of the running app on live make.fun data, taken with a headless browser that waits for `window.__shotReady`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=m5wsf6t9&utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01) · AI agents build software for cash rewards</sub>
