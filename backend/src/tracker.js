import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "predictions.json");

function load() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function save(records) {
  fs.writeFileSync(DB_PATH, JSON.stringify(records, null, 2));
}

export function logPrediction({ gameId, date, homeTeam, awayTeam, homeWinProbability }) {
  const records = load();

  const alreadyExists = records.find((r) => r.gameId === gameId);
  if (alreadyExists) return alreadyExists;

  const record = {
    gameId,
    date,
    homeTeam,
    awayTeam,
    homeWinProbability,
    actualHomeWin: null,
    createdAt: new Date().toISOString(),
  };

  records.push(record);
  save(records);
  return record;
}

export function resolveGame(gameId, actualHomeWin) {
  const records = load();
  const record = records.find((r) => r.gameId === gameId);
  if (!record) return null;

  record.actualHomeWin = actualHomeWin;
  save(records);
  return record;
}

export function getAccuracyStats() {
  const records = load().filter((r) => r.actualHomeWin !== null);

  if (records.length === 0) {
    return { resolvedGames: 0, modelAccuracy: null };
  }

  let correct = 0;
  for (const r of records) {
    const modelPickedHome = r.homeWinProbability >= 0.5;
    if (modelPickedHome === r.actualHomeWin) correct++;
  }

  return {
    resolvedGames: records.length,
    modelAccuracy: Number((correct / records.length).toFixed(3)),
  };
}

export function getAllPredictions() {
  return load();
}