import React, { useState } from "react";
import Home from "./pages/Home";
import PlayGame from "./pages/PlayGame";
import type { Game } from "./data/game";

function App() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  return selectedGame ? (
    <PlayGame game={selectedGame} onBack={() => setSelectedGame(null)} />
  ) : (
    <Home onGameSelect={setSelectedGame} />
  );
}

export default App;
