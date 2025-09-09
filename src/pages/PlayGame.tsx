import React, { useRef, useState, useEffect } from "react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { FriendsModal } from "../components/FriendsModal";
import { ChatModal } from "../components/ChatModal";
import { ProfileMenu } from "../components/ProfileMenu";
import type { Game } from "../data/game";
import type { ConversationWithUser } from "../lib/supabase";

const PlayGame: React.FC<{ game: Game; onBack: () => void; onOpenDashboard?: () => void }> = ({
  game,
  onBack,
  onOpenDashboard,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithUser | null>(null);

  const onFullscreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    }
  };
  
  const onReload = () => {
    setIsLoading(true);
    iframeRef.current?.contentWindow?.location.reload();
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleStartChat = (conversation: ConversationWithUser) => {
    setSelectedConversation(conversation);
    setShowFriendsModal(false);
    setShowChatModal(true);
  };

  const handleCloseFriendsModal = () => {
    setShowFriendsModal(false);
  };

  const handleCloseChatModal = () => {
    setShowChatModal(false);
    setSelectedConversation(null);
  };

  const handleNavigateToProfile = () => {
    // Open the same Dashboard/Profile view as the top-right button in App
    onOpenDashboard?.();
  };

  const handleNavigateToDashboard = () => {
    // Navigate to dashboard - you can implement routing here
    onBack(); // For now, use the existing back function
  };

  // Icons for buttons
  const BackIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );

  const ReloadIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  const FullscreenIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  );

  return (
    <Layout>
      {/* Header Section */}
      <div className="animate-slide-in mb-8">
        {/* Navigation & Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-xl font-bold">
                🎮
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-100">{game.title}</h1>
                <p className="text-gray-400 text-sm">
                  by {game.authorUrl ? (
                    <a
                      href={game.authorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {game.author}
                    </a>
                  ) : (
                    game.author
                  )}
                </p>
              </div>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">{game.description}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={onBack} 
              variant="secondary" 
              size="md"
              icon={<BackIcon />}
            >
              Kembali
            </Button>
            <Button 
              onClick={onReload} 
              variant="accent" 
              size="md"
              icon={<ReloadIcon />}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Reload'}
            </Button>
            <Button 
              onClick={onFullscreen} 
              variant="primary" 
              size="md"
              icon={<FullscreenIcon />}
            >
              Fullscreen
            </Button>
          </div>
        </div>
        
        {/* Game Stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="glass-effect px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-300">Online</span>
          </div>
          <div className="glass-effect px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-300">Gratis</span>
          </div>
          <div className="glass-effect px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-gray-300">Browser Game</span>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className="relative animate-scale-in">
        <div className="glass-effect rounded-3xl p-4 shadow-2xl">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-4 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white font-semibold">Memuat game...</p>
                <p className="text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
              </div>
            </div>
          )}
          
          {/* Game Frame */}
          <div className="relative overflow-hidden rounded-2xl bg-black">
            <iframe
              ref={iframeRef}
              src={game.file}
              title={game.title}
              className="w-full h-[700px] border-0"
              onLoad={handleIframeLoad}
              allow="fullscreen; autoplay; encrypted-media"
            />
            
            {/* Fullscreen Indicator */}
            {isFullscreen && (
              <div className="absolute top-4 right-4 glass-effect px-3 py-1 rounded-full text-sm font-semibold text-white">
                Mode Fullscreen
              </div>
            )}
          </div>
        </div>
        
        {/* Game Controls Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            💡 <strong>Tips:</strong> Gunakan tombol Fullscreen untuk pengalaman bermain yang lebih immersive
          </p>
        </div>

        {/* Friends Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowFriendsModal(true)}
            className="glass-effect px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-100">Friends</h3>
                <p className="text-sm text-gray-400">Chat with your friends</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      <FriendsModal
        isOpen={showFriendsModal}
        onClose={handleCloseFriendsModal}
        onStartChat={handleStartChat}
      />

      <ChatModal
        isOpen={showChatModal}
        onClose={handleCloseChatModal}
        conversation={selectedConversation}
      />

      {/* Profile Menu - Bottom Right Corner */}
      <ProfileMenu
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToDashboard={handleNavigateToDashboard}
      />
    </Layout>
  );
};

export default PlayGame;
