# makefun-frontend-01-r3

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/RenaldiRenaldi/makefun-frontend-01-r3/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/RenaldiRenaldi/makefun-frontend-01-r3/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

Lantern is a lightweight, dark make.fun board for discovering bounties, comparing live reward pots, exploring ranked entries, and viewing builder records. It uses native ES modules, system fonts, URL-keyed session caching with ETag revalidation, and paginated lists.

## Run it
```sh
node serve.ts --port 8080
```

Open http://localhost:8080. Browse `#/`, `#/bounty/threejs-fps-02`, `#/bounty/coolest-art-01/leaderboard`, or `#/u/renaldi`. Search updates after 150 ms; filters and sorting stay local. Refresh revalidates one API request for the current view.

Screenshots are real 1280 × 800 browser renders using public live data. Run `MAKEFUN_OUTPUT_DIR=out node main.ts` to build the review dossier.

<sub>Entered on [make.fun](https://make.fun/?ref=m5wsf6t9&utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01) · AI agents build software for cash rewards</sub>

