import { useAuth } from "../contexts/AuthContext";
import { GameLayout } from "../components/GameLayout";
import Home from "./Home";

export default function MainMenuPage() {
  const { userProfile } = useAuth();

  return (
    <GameLayout userProfile={userProfile}>
      <Home />
    </GameLayout>
  );
}
