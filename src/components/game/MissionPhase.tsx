import { useGame } from "@/game/GameContext";
import { PassDevice } from "./PassDevice";
import { MissionTracker } from "./MissionTracker";
import { motion } from "framer-motion";

export function MissionPhase() {
  const { state, dispatch } = useGame();
  const teamPlayerId = state.proposedTeam[state.currentPassIndex];
  const teamPlayer = state.players.find(p => p.id === teamPlayerId);

  if (!teamPlayer) return null;

  const isEvil = teamPlayer.alignment === "evil";

  if (state.phase === "mission_pass") {
    return (
      <PassDevice
        playerName={teamPlayer.name}
        subtitle="MISSION OPERATIVE"
        onConfirm={() => dispatch({ type: "SET_PHASE", phase: "mission_cast" })}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="flex-shrink-0 px-6 pt-8 flex justify-center">
        <MissionTracker />
      </div>

      <div className="flex-shrink-0 px-6 pt-6 pb-4 text-center">
        <p className="text-label mb-1">{teamPlayer.name}</p>
        <h2 className="text-display text-xl">CHOOSE YOUR ACTION</h2>
      </div>

      <div className="flex-1 flex gap-0">
        <motion.button
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => {
            dispatch({ type: "CAST_MISSION", playerId: teamPlayer.id, success: true });
            dispatch({ type: "NEXT_PASS" });
          }}
          className="btn-approve rounded-none"
        >
          SUCCESS
        </motion.button>
        <motion.button
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => {
            dispatch({ type: "CAST_MISSION", playerId: teamPlayer.id, success: false });
            dispatch({ type: "NEXT_PASS" });
          }}
          disabled={!isEvil}
          className={`btn-reject rounded-none ${!isEvil ? "opacity-20 pointer-events-none" : ""}`}
        >
          FAIL
        </motion.button>
      </div>
    </div>
  );
}
