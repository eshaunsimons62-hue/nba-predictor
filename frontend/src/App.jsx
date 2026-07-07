import { useState, useEffect } from "react";
import GameCard from "./components/GameCard";

function App() {
  const [selectedDate, setSelectedDate] = useState("2026-01-15");
  const [games, setGames] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGamesAndPredictions() {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/games?date=${selectedDate}`
      );
      const data = await response.json();
      setGames(data.games);

      const predictionMap = {};
      for (const game of data.games) {
        const predictRes = await fetch(
          `${import.meta.env.VITE_API_URL}/predict`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gameId: game.id,
              date: game.date,
              homeTeamId: game.home_team.id,
              awayTeamId: game.visitor_team.id,
            }),
          }
        );
        const predictData = await predictRes.json();
        predictionMap[game.id] = predictData.homeWinProbability;

        // Small delay between requests to avoid hitting balldontlie's
        // free-tier rate limit when a date has many games.
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setPredictions(predictionMap);
      setLoading(false);
    }

    fetchGamesAndPredictions();
  }, [selectedDate]);

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 20px" }}>
      <header className="app-header">
        <h1 className="app-title">Courtside</h1>
        <p className="app-subtitle">Model predictions vs. real NBA outcomes</p>
        <input
          type="date"
          className="date-picker"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </header>

      {loading && <p className="status-text">Loading games...</p>}

      {!loading && games.length === 0 && (
        <p className="status-text">No games scheduled for this date.</p>
      )}

      {!loading &&
        games.map((game) => (
          <GameCard
            key={game.id}
            homeTeam={game.home_team.full_name}
            awayTeam={game.visitor_team.full_name}
            homeWinProbability={predictions[game.id] ?? 0.5}
          />
        ))}
    </div>
  );
}

export default App;