import axios from "axios";

const BASE_URL = "https://api.balldontlie.io/v1";

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const teamGamesCache = new Map();
const gamesCache = new Map();

function client() {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: process.env.BALLDONTLIE_API_KEY || "",
    },
  });
}

/**
 * Fetch games for a given date, cached briefly to avoid re-fetching
 * the same date repeatedly when multiple users load the app close
 * together in time.
 * @param {string} dateISO - format YYYY-MM-DD
 */
export async function getGamesForDate(dateISO) {
  const cached = gamesCache.get(dateISO);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const { data } = await client().get("/games", {
    params: { dates: [dateISO] },
  });

  gamesCache.set(dateISO, { data: data.data, timestamp: Date.now() });
  return data.data;
}

/**
 * Fetch a single game by its balldontlie game ID.
 */
export async function getGameById(gameId) {
  const { data } = await client().get(`/games/${gameId}`);
  return data.data;
}

/**
 * Fetch a team's last N completed games, cached in-memory for a
 * short window to reduce redundant calls to balldontlie's free-tier
 * API and avoid rate limiting when many predictions run back to back.
 */
export async function getRecentGamesForTeam(teamId, count = 10) {
  const cacheKey = `team-${teamId}-${count}`;
  const cached = teamGamesCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const response = await client().get("/games", {
    params: {
      team_ids: [teamId],
      per_page: count,
    },
  });

  const games = response.data.data.filter((g) => g.status === "Final");
  teamGamesCache.set(cacheKey, { data: games, timestamp: Date.now() });
  return games;
}

/**
 * Convert a team's raw game results into { won: true/false } flags,
 * relative to that specific team.
 */
export function annotateWithResult(games, teamId) {
  return games.map((g) => {
    const isHomeTeam = g.home_team.id === teamId;
    const teamScore = isHomeTeam ? g.home_team_score : g.visitor_team_score;
    const opponentScore = isHomeTeam ? g.visitor_team_score : g.home_team_score;
    return { won: teamScore > opponentScore };
  });
}