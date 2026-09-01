# Codex handoff: California Garden / Royal Palms Shuttle Web App

## Goal
Build and continue a public, mobile-first shuttle timetable web app/PWA for California Garden (Palm Springs) and Royal Palms. It must require **no user login, no account, no registration, no authentication**. Anyone with the URL should be able to open it immediately.

The app is primarily a timetable viewer now. Later it may receive a GPS/ETA API, so keep the timetable/domain model clean and easy to extend.

## Important repo note
This GitHub repository (`kklen425/vite-react`) currently has an unrelated React fitness app in `src/App.tsx`. Do **not** destroy or overwrite that existing app unless explicitly asked. The current bus prototype was added as a static page under `public/california-garden-bus.html`.

Preferred implementation options, in order:
1. Build the bus app as a dedicated route/static sub-app inside this repo, isolated from the fitness tracker, OR
2. create a dedicated `bus-app/` Vite/React package if workspace structure allows, OR
3. if the user later creates a dedicated bus repository, move it there cleanly.

For this task, ensure the bus page has a stable public path such as `/bus` or `/california-garden-bus` and can be deployed by Vercel.

## Source of truth timetable data
Use `public/california-garden-bus-data.json` as the source of truth. It contains exact timetable data transcribed from the two official-looking posted timetable photos supplied by the user. Effective date on both photos: **1 Dec 2025**. Timezone: **Asia/Hong_Kong**.

Do NOT regenerate Fau Tsoi Street times by simply adding a fixed offset to Palm Springs. Read the exact values from the JSON. The earlier prototype made this mistake.

## Routes to support
### 1. Yuen Long Route & West-Rail Express
Stations:
- 加州花園 / Palm Springs
- 加州豪園 / Royal Palms
- 元朗阜財街 / Fau Tsoi Street
- 元朗西鐵站 / Yuen Long WR Station

Some trips are West-Rail Express. These must be visually marked. Express trips do not call at Fau Tsoi Street.

### 2. Sheung Shui Route
Stations:
- 加州花園 / Palm Springs
- 加州豪園 / Royal Palms
- 上水 / Sheung Shui

Exact Sheung Shui timetable from the second photo is already stored in `public/california-garden-bus-data.json`.

## UX requirements
Make it feel like a simple KMB/Citybus-style ETA app, but be explicit that current information is timetable-only.

Home screen should prioritize:
- current Hong Kong time
- route selector: `元朗線` / `上水線`
- station selector based on route
- very large `下一班` scheduled departure
- countdown in minutes until that scheduled time
- next 4–5 departures
- full-day timetable expandable/collapsible
- West-Rail Express badge/marking where relevant

Recommended labels:
- `下一班（表定）`
- `距離表定開車`
- warning: `目前並非即時 ETA。實際班次可能受交通、上一程延誤或調車影響。`

Do not claim countdown is actual live ETA.

## No-login requirement
There must be:
- no login page
- no OAuth
- no Firebase Auth
- no email/phone field
- no resident account
- no cookie gate needed for normal use

Use `localStorage` only for non-sensitive preferences such as last-selected route/station.

## PWA / iPhone installability
The site should be installable from iPhone Safari using Share -> Add to Home Screen.

Implement/verify:
- Web App Manifest
- `display: standalone`
- sensible `theme_color` and `background_color`
- Apple mobile web app meta tags
- Apple touch icon
- service worker/offline fallback for timetable data
- responsive safe-area handling on iPhone

No App Store account is required for this PWA version.

## Time handling requirements
- Always calculate timetable against `Asia/Hong_Kong`, even if device is physically overseas.
- Correctly handle trips after midnight, e.g. `00:00`, `00:10`, `00:13` as the next service-day departure rather than treating them as already passed in the same calendar day.
- Do not rely on the device timezone.
- Unit test edge cases around 23:30–00:15.

## Data structure
Load timetable data from `/california-garden-bus-data.json`, do not hardcode all times into React components.

Suggested domain types:
```ts
interface StationTimetable {
  nameZh: string;
  nameEn: string;
  times: string[];
  expressTimes: string[];
}

interface RouteTimetable {
  nameZh: string;
  nameEn: string;
  stations: Record<string, StationTimetable>;
  remarks: string[];
}
```

## Quality / tests
Before deployment:
- run build and lint
- test on mobile widths ~360, 390, 430 px
- verify all route/station selectors
- verify next departure at several fixed HK times using unit tests
- test midnight roll-over
- test offline reopen after first load
- ensure no console errors
- ensure accessibility: buttons have labels, adequate tap targets, contrast, semantic headings

## Future-ready GPS integration
Do not implement fake GPS now. Design a clean interface so a future provider can override scheduled estimates with real data.

Suggested abstraction:
```ts
type BusPrediction = {
  source: 'schedule' | 'live-gps' | 'predicted';
  scheduledTime: string;
  estimatedTime?: string;
  delayMinutes?: number;
  vehicleId?: string;
  updatedAt?: string;
};
```

For now all predictions are `source: 'schedule'`.

## Deployment
Target a public Vercel deployment with no authentication/protection. Verify the URL from an incognito browser/mobile device before declaring success.

The previous quick Vercel deployment had issues where only a test heading rendered, so do not assume deployment works just because a build says READY. Actually fetch/test the public URL and confirm the full UI is visible.

## User-visible language
Default UI language: Traditional Chinese / Cantonese-friendly phrasing, with English station names as secondary text.

## Current source files created for this bus project
- `public/california-garden-bus.html` — earlier standalone prototype
- `public/california-garden-bus-data.json` — current timetable source of truth
- `CODEX_BUS_HANDOFF.md` — this file

Start by inspecting those files and the existing Vite config. Then implement the clean bus route/sub-app without damaging the existing fitness tracker.
