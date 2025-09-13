import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthRoutes } from "./AuthRoutes";
import { GameRoutes } from "./GameRoutes";
import { LoadingScreen } from "../components/LoadingScreen";

export function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/auth/*" element={<AuthRoutes />} />
      
      {/* Protected Game Routes */}
      <Route 
        path="/*" 
        element={
          user ? <GameRoutes /> : <Navigate to="/auth" replace />
        } 
      />
    </Routes>
  );
}
