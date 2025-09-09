import { useState } from "react";
import type { Game } from "../data/game";

interface Props {
  game: Game;
  onClick: (game: Game) => void;
}

const GameCard: React.FC<Props> = ({ game, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className="group relative cursor-pointer overflow-hidden"
      onClick={() => onClick(game)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Modern Play Button Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-3xl flex items-center justify-center transition-opacity duration-150 z-10 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-5 shadow-md">
          <svg className="w-10 h-10 text-gray-100" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Modern Game Thumbnail */}
      <div className="relative overflow-hidden rounded-t-3xl">
        <img
          src={game.thumbnail}
          alt={game.title + ' thumbnail'}
          className="w-full h-56 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/vite.svg';
          }}
        />
        
        {/* Modern Category Badge */}
        <div className="absolute top-4 right-4 glass rounded-2xl px-4 py-2 shadow-md">
          <span className="text-gray-100 text-sm font-bold">{game.category}</span>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>
      
      {/* Modern Game Info */}
      <div className="p-8 space-y-4 rounded-b-3xl">
        <h3 className="text-2xl font-bold text-gray-100">
          {game.title}
        </h3>
        
        <p className="text-gray-300 text-base leading-relaxed line-clamp-2">
          {game.description}
        </p>
        
        {/* Modern Author Info */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-sm font-bold text-gray-100 shadow-md">
              {game.author.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-400 truncate max-w-32">
              {game.author}
            </span>
          </div>
          
          {/* Play button removed as requested */}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
