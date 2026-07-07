function winPercentage(games) {
  if (games.length === 0) return 0.5;
  const wins = games.filter((g) => g.won).length;
  return wins / games.length;
}

export function predictGame({ homeRecentGames, awayRecentGames }) {
  const homeForm = winPercentage(homeRecentGames);
  const awayForm = winPercentage(awayRecentGames);

  const homeCourtEdge = 0.06;
  const formDiff = homeForm - awayForm;

  const homeWinProbability = 0.5 + formDiff / 2 + homeCourtEdge;

  const clamped = Math.min(Math.max(homeWinProbability, 0.01), 0.99);

  return {
    homeWinProbability: Number(clamped.toFixed(3)),
    homeForm,
    awayForm,
  };
}