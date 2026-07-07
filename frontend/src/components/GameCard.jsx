function GameCard({ homeTeam, awayTeam, homeWinProbability }) {
  const homePercent = Math.round(homeWinProbability * 100);
  const awayPercent = 100 - homePercent;
  const modelFavorsHome = homeWinProbability >= 0.5;

  return (
    <div className="game-card">
      <div className="game-card-teams">
        <span className={modelFavorsHome ? "team-favored" : "team"}>
          {awayTeam}
        </span>
        <span className="team-at">@</span>
        <span className={modelFavorsHome ? "team" : "team-favored"}>
          {homeTeam}
        </span>
      </div>

      <div className="probability-bar">
        <div
          className="probability-fill-away"
          style={{ width: `${awayPercent}%` }}
        />
        <div
          className="probability-fill-home"
          style={{ width: `${homePercent}%` }}
        />
      </div>

      <div className="probability-labels">
        <span className="probability-number">{awayPercent}%</span>
        <span className="probability-number">{homePercent}%</span>
      </div>
    </div>
  );
}

export default GameCard;