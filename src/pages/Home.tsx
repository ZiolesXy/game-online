import { useState, useEffect } from "react";
import { games, GAME_CATEGORIES, type GameCategory } from "../data/game";
import GameCard from "../components/GameCard";

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
    <div className="min-h-screen">
      {/* Modern Header */}
      <div className="glass-card sticky top-0 z-40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center animate-slide-up">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-3xl mr-6 shadow-xl animate-glow">
                  <svg className="h-10 w-10 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-5xl font-black mb-2">
                  Game Center
                </h1>
                <p className="text-gray-400 text-lg font-medium">Koleksi Game Online Terbaik</p>
                <div className="flex items-center justify-center space-x-2 mt-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Live & Ready</span>
                </div>
              </div>
            </div>
            
            {/* Modern Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari game favorit kamu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-8 py-5 glass-card glass-hover rounded-3xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-xl transition-all duration-300 text-lg font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-8 flex items-center">
                    {searchTerm ? (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-gray-400 hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Category Filter */}
        <div className="mb-10 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="glass-card glass-hover rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-100 mb-6 text-center gradient-text">Filter Kategori</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {GAME_CATEGORIES.map((category, index) => {
                const isActive = selectedCategory === category;
                const categoryCount = category === "Semua" 
                  ? games.length 
                  : games.filter(game => game.category === category).length;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-gray-100 shadow-xl animate-glow'
                        : 'glass glass-hover text-gray-300 hover:text-gray-100 hover:shadow-lg'
                    }`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getCategoryIcon(category)}</span>
                      <span className="text-lg">{category}</span>
                      <span className={`text-sm px-3 py-1 rounded-full font-bold ${
                        isActive 
                          ? 'bg-white/20 text-gray-100' 
                          : 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-gray-300'
                      }`}>
                        {categoryCount}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modern Stats Card */}
        <div className="mb-12 animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="glass-card glass-hover rounded-3xl p-8 shadow-xl">
            <div className="flex flex-wrap justify-center gap-8 text-lg">
              <div className="flex items-center space-x-3 group">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse group-hover:scale-125 transition-transform duration-200"></div>
                <span className="text-gray-100 font-semibold">{filteredGames.length} Game Tersedia</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse group-hover:scale-125 transition-transform duration-200" style={{animationDelay: '0.5s'}}></div>
                <span className="text-gray-100 font-semibold">Gratis & Online</span>
              </div>
              {selectedCategory !== "Semua" && (
                <div className="flex items-center space-x-3 group animate-slide-left">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse group-hover:scale-125 transition-transform duration-200" style={{animationDelay: '1s'}}></div>
                  <span className="text-gray-100 font-semibold">Kategori: {selectedCategory}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Modern Games Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredGames.map((game, index) => (
              <div
                key={game.id}
                className={`transition-all duration-500 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } animate-slide-up`}
                style={{ transitionDelay: `${index * 100}ms`, animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <div className="glass-card glass-hover rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group overflow-hidden">
                  <GameCard game={game} onClick={onGameSelect} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Modern No Results */
          <div className="text-center py-20 animate-slide-up">
            <div className="glass-card glass-hover rounded-3xl p-16 shadow-xl max-w-3xl mx-auto">
              <div className="text-8xl mb-8 animate-float">🔍</div>
              <h3 className="text-4xl font-bold text-gray-100 mb-6">Game tidak ditemukan</h3>
              <p className="text-gray-300 mb-12 leading-relaxed text-xl">
                {searchTerm && selectedCategory !== "Semua" 
                  ? `Tidak ada game dengan kata kunci "${searchTerm}" di kategori ${selectedCategory}`
                  : searchTerm 
                  ? `Tidak ada game dengan kata kunci "${searchTerm}"`
                  : `Tidak ada game di kategori ${selectedCategory}`
                }
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-gray-100 px-8 py-4 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Hapus Pencarian</span>
                    </div>
                  </button>
                )}
                {selectedCategory !== "Semua" && (
                  <button
                    onClick={() => setSelectedCategory("Semua")}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-gray-100 px-8 py-4 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span>Lihat Semua Kategori</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
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
