import { useGame } from "@/game/GameContext";
import { SetupScreen } from "./SetupScreen";
import { NightPhase } from "./NightPhase";
import { ProposalPhase } from "./ProposalPhase";
import { VotePhase } from "./VotePhase";
import { VoteResult } from "./VoteResult";
import { MissionPhase } from "./MissionPhase";
import { MissionResultScreen } from "./MissionResult";
import { AssassinPhase } from "./AssassinPhase";
import { GameOver } from "./GameOver";
import { AnimatePresence } from "framer-motion";

export function GameBoard() {
  const { state } = useGame();

  return (
    <AnimatePresence mode="wait">
      {state.phase === "setup" && <SetupScreen key="setup" />}
      {(state.phase === "night_pass" || state.phase === "night_reveal") && (
        <NightPhase key="night" />
      )}
      {state.phase === "proposal" && <ProposalPhase key="proposal" />}
      {(state.phase === "vote_pass" || state.phase === "vote_cast") && (
        <VotePhase key="vote" />
      )}
      {state.phase === "vote_result" && <VoteResult key="vote_result" />}
      {(state.phase === "mission_pass" || state.phase === "mission_cast") && (
        <MissionPhase key="mission" />
      )}
      {state.phase === "mission_result" && <MissionResultScreen key="mission_result" />}
      {state.phase === "assassin_phase" && <AssassinPhase key="assassin" />}
      {state.phase === "game_over" && <GameOver key="game_over" />}
    </AnimatePresence>
  );
}
