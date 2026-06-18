import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { PrivateRoute } from "./routes/PrivateRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import { Dashboard } from "./components/Dashboard";
import MainMenuPage from "./pages/MainMenuPage";
import { GameLayout } from "./components/GameLayout";
import GamePage from "./pages/GamePage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user, userProfile } = useAuth();
  const isAdmin = userProfile?.role === "admin";

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/home" replace /> : <LandingPage />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<PrivateRoute><MainMenuPage /></PrivateRoute>} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <GameLayout userProfile={userProfile} showBackButton>
              <Dashboard />
            </GameLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/game/:gameId"
        element={
          <PrivateRoute>
            <GamePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <PrivateRoute>
            {isAdmin ? (
              <GameLayout userProfile={userProfile} showBackButton>
                <AdminPage />
              </GameLayout>
            ) : (
              <Navigate to="/home" replace />
            )}
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
