import { GameProvider } from "@/game/GameContext";
import { GameBoard } from "@/components/game/GameBoard";

const Index = () => {
  return (
    <GameProvider>
      <GameBoard />
    </GameProvider>
  );
};

export default Index;
