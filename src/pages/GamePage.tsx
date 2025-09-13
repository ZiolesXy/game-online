import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { games } from "../data/game";
import PlayGame from "./PlayGame";
import type { Game } from "../data/game";

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    if (gameId) {
      const foundGame = games.find(g => g.id === gameId);
      if (foundGame) {
        setGame(foundGame);
      } else {
        // Game not found, redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [gameId, navigate]);

  const handleBack = () => {
    navigate('/');
  };

  const handleOpenDashboard = () => {
    navigate('/dashboard');
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat game...</p>
        </div>
      </div>
    );
  }

  return (
    <PlayGame 
      game={game} 
      onBack={handleBack}
      onOpenDashboard={handleOpenDashboard}
    />
  );
}
