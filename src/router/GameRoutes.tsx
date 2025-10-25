import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Home from "../pages/Home";
import GamePage from "../pages/GamePage";
import AdminPage from "../pages/AdminPage";
import { Dashboard } from "../components/Dashboard";
import { GameLayout } from "../components/GameLayout";

export function GameRoutes() {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  return (
    <Routes>
      {/* Home Route */}
      <Route 
        path="/" 
        element={
          <GameLayout userProfile={userProfile}>
            <Home />
          </GameLayout>
        } 
      />
      
      {/* Dashboard/Profile Route */}
      <Route 
        path="/dashboard" 
        element={
          <GameLayout userProfile={userProfile} showBackButton>
            <Dashboard />
          </GameLayout>
        } 
      />
      
      {/* Play Game Route */}
      <Route 
        path="/game/:gameId" 
        element={<GamePage />} 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin/*" 
        element={
          isAdmin ? (
            <GameLayout userProfile={userProfile} showBackButton>
              <AdminPage />
            </GameLayout>
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
