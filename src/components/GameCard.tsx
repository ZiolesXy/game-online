import React, { useState } from "react";
import type { Game } from "../data/game";

interface Props {
  game: Game;
  onClick: (game: Game) => void;
}

const GameCard: React.FC<Props> = ({ game, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className="group relative glass-effect rounded-2xl p-6 cursor-pointer hover-lift animate-scale-in overflow-hidden"
      onClick={() => onClick(game)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
      <div className="absolute inset-[1px] glass-effect rounded-2xl -z-10"></div>
      
      {/* Play Button Overlay */}
      <div className={`absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 animate-pulse-glow">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Game Thumbnail */}
      <div className="relative overflow-hidden rounded-xl mb-4">
        <img
          src={game.thumbnail}
          alt={game.title + ' thumbnail'}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/vite.svg';
          }}
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
          {game.category.toUpperCase()}
        </div>
      </div>
      
      {/* Game Info */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-white group-hover:gradient-text transition-all duration-300">
          {game.title}
        </h3>
        
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
          {game.description}
        </p>
        
        {/* Author Info */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
              {game.author.charAt(0)}
            </div>
            <span className="text-xs text-gray-400 truncate max-w-32">
              {game.author}
            </span>
          </div>
          
          {/* Play Button */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            MAIN
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
