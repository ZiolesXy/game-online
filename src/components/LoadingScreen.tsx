export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center motion-safe:animate-slide-up">
        <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
          <div className="spinner mx-auto mb-4"></div>
          <h3 className="text-2xl font-bold mb-4">Fun Zone</h3>
          <p className="text-gray-400">Memuat pengalaman gaming terbaik...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full motion-safe:animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full motion-safe:animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full motion-safe:animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
