# FitTrack 健身記錄

A Progressive Web App (PWA) for tracking workouts, built with React + TypeScript + Vite.

## Features

- Log workouts by body part and exercise (30+ Cantonese-named exercises)
- View training history
- Track progress with line charts (weight/volume over time)
- Works offline — all data stored in localStorage
- Installable as a home-screen app (PWA)

## Tech Stack

- React 18 + TypeScript
- Vite + vite-plugin-pwa (service worker, offline support)
- Recharts (progress charts)
- Firebase
- Lucide React (icons)

## Development

```shell
npm install
npm run dev
```

## Build & Preview

```shell
npm run build
npx vite preview
```

After building, open DevTools → Application → Service Workers to confirm the service worker is registered.

---

## Future Roadmap — 健身日記 Mobile App

The next phase is a native mobile app called **健身日記**, planned for App Store and Google Play.

### Overview

| Item | Detail |
|---|---|
| Platform | Expo + TypeScript + SQLite |
| Storage | SQLite (fully offline) |
| Monetisation | RevenueCat — HK$38/月 or HK$228/年 |
| Target | 170 paying users (6-month goal) |

### 5 Main Screens

1. **主頁 (Home)** — dashboard, streaks, quick-start
2. **新訓練 (New Workout)** — log sets, rest timer, smart suggestions
3. **紀錄 (History)** — past workouts list
4. **進度 (Progress)** — line charts per exercise (weight & volume)
5. **動作庫 (Exercise Library)** — 30+ exercises, Cantonese names

### Core Pro Features

- **Smart progressive overload suggestions** — auto-recommend weight increases based on history (key paid differentiator)
- **Quick-redo / Last session import** — one tap to load previous session's weights
- **Personal Record (PR) detection** — celebration animation + haptic feedback
- **Rest timer** — countdown between sets with vibration prompt
- **Body metrics tracking** — weight, body fat %, waist measurements

### Monetisation

- Freemium model: free tier with basic logging; Pro unlocks charts, PR detection, smart suggestions, body metrics
- 3 paywall trigger points: after onboarding, after 3rd workout, when tapping a locked feature
- Onboarding flow: 3-page survey → paywall → app
- Push notifications: training reminders, streak alerts, weekly summary

### Business Model

| Plan | Price | Annual |
|---|---|---|
| Monthly | HK$38/月 | — |
| Yearly | — | HK$228/年 |
| 6-month target | 170 paying users | ~HK$38,760 ARR |

### 10-Week Development Timeline

| Week | Milestone |
|---|---|
| 1–2 | Project setup, SQLite schema, exercise library |
| 3–4 | Core workout logging UI (sets/reps/weight) |
| 5 | History screen + rest timer |
| 6 | Progress charts |
| 7 | Onboarding + paywall (RevenueCat) |
| 8 | Push notifications + PR detection |
| 9 | Body metrics tracking + smart suggestions |
| 10 | QA, App Store / Play Store submission |
