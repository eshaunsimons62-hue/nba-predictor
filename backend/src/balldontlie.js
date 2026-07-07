import axios from "axios";

const BASE_URL = "https://api.balldontlie.io/v1";

export async function getGamesForDate(dateISO) {
  const response = await axios.get(`${BASE_URL}/games`, {
    headers: {
      Authorization: process.env.BALLDONTLIE_API_KEY,
    },
    params: {
      dates: [dateISO],
    },
  });
  return response.data.data;
}

export async function getRecentGamesForTeam(teamId, count = 10) {
  const response = await axios.get(`${BASE_URL}/games`, {
    headers: {
      Authorization: process.env.BALLDONTLIE_API_KEY,
    },
    params: {
      team_ids: [teamId],
      per_page: count,
    },
  });

  return response.data.data.filter((g) => g.status === "Final");
}

export function annotateWithResult(games, teamId) {
  return games.map((g) => {
    const isHomeTeam = g.home_team.id === teamId;
    const teamScore = isHomeTeam ? g.home_team_score : g.visitor_team_score;
    const opponentScore = isHomeTeam ? g.visitor_team_score : g.home_team_score;
    return { won: teamScore > opponentScore };
  });
}