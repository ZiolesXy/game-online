import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export function useNavigation() {
  const navigate = useNavigate();

  const navigateToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const navigateToGame = useCallback((gameId: string) => {
    navigate(`/game/${gameId}`);
  }, [navigate]);

  const navigateToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const navigateToAdmin = useCallback((section?: string) => {
    navigate(`/admin${section ? `/${section}` : ''}`);
  }, [navigate]);

  const navigateToAuth = useCallback((mode?: string) => {
    navigate(`/auth${mode ? `/${mode}` : ''}`);
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    navigateToHome,
    navigateToGame,
    navigateToDashboard,
    navigateToAdmin,
    navigateToAuth,
    goBack,
    navigate
  };
}
