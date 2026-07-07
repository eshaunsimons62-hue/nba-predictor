import { useState, useEffect } from "react";
import GameCard from "./components/GameCard";

function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      const response = await fetch("http://localhost:4000/games?date=2026-01-15");
      const data = await response.json();
      setGames(data.games);
      setLoading(false);
    }

    fetchGames();
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "42px" }}>
        Courtside
      </h1>

      {loading && <p>Loading games...</p>}

      {!loading && games.length === 0 && <p>No games found for this date.</p>}

      {games.map((game) => (
        <div key={game.id}>
          {game.home_team.full_name} vs {game.visitor_team.full_name}
        </div>
      ))}
    </div>
  );
}

export default App;