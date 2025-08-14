import React, { useState, useEffect } from "react";
import { games, GAME_CATEGORIES, type GameCategory } from "../data/game";
import GameCard from "../components/GameCard";
import Layout from "../components/Layout";

const Home: React.FC<{ onGameSelect: (game: typeof games[0]) => void }> = ({
  onGameSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>("Semua");
  const [filteredGames, setFilteredGames] = useState(games);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    let filtered = games;
    
    // Filter by category
    if (selectedCategory !== "Semua") {
      filtered = filtered.filter(game => game.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredGames(filtered);
  }, [searchTerm, selectedCategory]);

  return (
    <Layout>
      {/* Hero Section */}
      <div className={`text-center mb-12 animate-slide-in ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-1000`}>
        <div className="relative inline-block">
          <h1 className="text-6xl md:text-7xl font-black mb-4 gradient-text animate-float">
            🎮 GAME CENTER
          </h1>
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 blur-2xl rounded-full animate-pulse-glow"></div>
        </div>
        
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Jelajahi koleksi game online terbaik dan nikmati pengalaman bermain yang tak terlupakan!
        </p>
        
        {/* Interactive Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur opacity-75 animate-pulse"></div>
          <div className="relative glass-effect rounded-full p-1">
            <div className="flex items-center">
              <div className="pl-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari game favorit kamu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-3 rounded-full focus:outline-none focus:none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="pr-4 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 text-center">Filter berdasarkan Kategori</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {GAME_CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              const categoryCount = category === "Semua" 
                ? games.length 
                : games.filter(game => game.category === category).length;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`relative overflow-hidden px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'glass-effect text-gray-300 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse"></div>
                  )}
                  
                  <div className="relative flex items-center space-x-2">
                    <span>{getCategoryIcon(category)}</span>
                    <span>{category}</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {categoryCount}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex justify-center space-x-8 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{filteredGames.length} Game Tersedia</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Gratis & Online</span>
          </div>
          {selectedCategory !== "Semua" && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Kategori: {selectedCategory}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredGames.map((game, index) => (
          <div
            key={game.id}
            className="animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <GameCard game={game} onClick={onGameSelect} />
          </div>
        ))}
      </div>
      
      {/* No Results */}
      {filteredGames.length === 0 && (searchTerm || selectedCategory !== "Semua") && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-300 mb-2">Game tidak ditemukan</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm && selectedCategory !== "Semua" 
              ? `Tidak ada game dengan kata kunci "${searchTerm}" di kategori ${selectedCategory}`
              : searchTerm 
              ? `Tidak ada game dengan kata kunci "${searchTerm}"`
              : `Tidak ada game di kategori ${selectedCategory}`
            }
          </p>
          <div className="flex justify-center space-x-4">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Hapus Pencarian
              </button>
            )}
            {selectedCategory !== "Semua" && (
              <button
                onClick={() => setSelectedCategory("Semua")}
                className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Lihat Semua Kategori
              </button>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

// Helper function to get category icons
const getCategoryIcon = (category: GameCategory): string => {
  const icons: Record<GameCategory, string> = {
    "Semua": "🎮",
    "Strategi": "🧠",
    "Aksi": "⚔️",
    "Horor": "👻",
    "Arcade": "🕹️",
    "Puzzle": "🧩"
  };
  return icons[category] || "🎮";
};

export default Home;
