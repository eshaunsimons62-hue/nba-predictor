# Courtside — NBA Win Probability Predictor

A full-stack app that predicts NBA game outcomes using a transparent,
explainable model, then tracks its accuracy against real results over time.

**Live app:** https://nba-predictor-frontend-ixla.onrender.com
**Backend API:** https://nba-predictor-i6ib.onrender.com

## What it does

- Fetches real NBA game data and team records from the balldontlie API
- Computes a home-team win probability using season form, recent form
  (last 10 games), and home-court advantage — all weighted transparently,
  not a black-box model
- Logs every prediction and, once games finish, compares the model's
  pick against the actual outcome
- Reports overall model accuracy across all tracked games

## Why a transparent model instead of ML

The goal was a model where every step is explainable — useful for
understanding *why* a prediction was made, not just what it was. The
formula weights season win %, recent form, and a flat home-court edge
(NBA teams historically win ~55-60% of home games).

## Tech stack

- **Frontend:** React (Vite), custom design system (no UI library)
- **Backend:** Node.js, Express
- **Data source:** balldontlie.io API
- **Deployment:** Render (both frontend static site and backend web service)

## Architecture

Frontend and backend are deployed and run independently, communicating
over HTTP. The backend persists prediction history to a JSON file so
accuracy stats survive restarts.

## Known limitations

- Runs on Render's free tier, which spins down after 15 minutes of
  inactivity — first request after idle time can take 30-60 seconds
- Relies on balldontlie's free-tier API, which rate-limits requests.
  Loading a date with many games can occasionally show a fallback 50%
  for some matchups if predictions are requested faster than the API
  allows. A future improvement would be a scheduled background job
  that pre-computes predictions rather than fetching them on-demand
  per page load.
- Season win % is currently derived from each team's last 10 games as
  a proxy, since the free API tier doesn't expose full-season standings

## Running locally

```bash
# Backend
cd backend
npm install
# add your balldontlie API key to a .env file (see .env.example)
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```