import React from "react";
import type { Game } from "../data/game";

interface Props {
  games: Game[];
  onSelect: (game: Game) => void;
}

const GameList: React.FC<Props> = ({ games, onSelect }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {games.map((game) => (
      <div
        key={game.id}
        className="bg-white p-4 rounded-lg shadow hover:shadow-xl cursor-pointer transition"
        onClick={() => onSelect(game)}
      >
        <h3 className="text-lg font-semibold">{game.title}</h3>
        <p className="text-xs text-gray-500 mt-1">
          by {game.authorUrl ? (
            <a
              href={game.authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {game.author}
            </a>
          ) : (
            game.author
          )}
        </p>
        <p className="text-sm text-gray-600 mt-1">{game.description}</p>
      </div>
    ))}
  </div>
);

export default GameList;
