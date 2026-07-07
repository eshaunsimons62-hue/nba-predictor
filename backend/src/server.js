import "dotenv/config";
import express from "express";
import { getGamesForDate, getRecentGamesForTeam, annotateWithResult } from "./balldontlie.js";
import { predictGame } from "./model.js";
import { logPrediction, resolveGame, getAccuracyStats, getAllPredictions } from "./tracker.js";

const app = express();
app.use(express.json());
const PORT = 4000;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.get("/games", async (req, res) => {
  try {
    const date = req.query.date || "2026-01-15";
    const games = await getGamesForDate(date);
    res.json({ date, games });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/predict", async (req, res) => {
  try {
    const { homeTeamId, awayTeamId } = req.body;

    const homeRawGames = await getRecentGamesForTeam(homeTeamId, 10);
    const awayRawGames = await getRecentGamesForTeam(awayTeamId, 10);

    const homeRecentGames = annotateWithResult(homeRawGames, homeTeamId);
    const awayRecentGames = annotateWithResult(awayRawGames, awayTeamId);

   const result = predictGame({ homeRecentGames, awayRecentGames });

    const record = logPrediction({
      gameId: req.body.gameId,
      date: req.body.date,
      homeTeam: req.body.homeTeamId,
      awayTeam: req.body.awayTeamId,
      homeWinProbability: result.homeWinProbability,
    });

    res.json({ ...result, record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/resolve", (req, res) => {
  const { gameId, actualHomeWin } = req.body;
  const record = resolveGame(gameId, actualHomeWin);
  if (!record) return res.status(404).json({ error: "Prediction not found" });
  res.json({ record });
});

app.get("/accuracy", (req, res) => {
  res.json(getAccuracyStats());
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
