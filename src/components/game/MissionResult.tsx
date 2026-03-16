import { motion } from "framer-motion";
import { useGame } from "@/game/GameContext";
import { MissionTracker } from "./MissionTracker";

export function MissionResultScreen() {
  const { state, dispatch } = useGame();
  const lastResult = state.missionResults[state.missionResults.length - 1];
  if (!lastResult) return null;

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center">
      <div className="flex-shrink-0 px-6 pt-8">
        <MissionTracker />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-label"
        >
          MISSION {lastResult.questIndex + 1} RESULT
        </motion.p>

        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`text-display text-5xl ${lastResult.success ? "text-loyal" : "text-minion"}`}
          style={{
            textShadow: lastResult.success
              ? "0 0 40px hsl(var(--loyal) / 0.5)"
              : "0 0 40px hsl(var(--minion) / 0.5)",
          }}
        >
          {lastResult.success ? "SUCCESS" : "FAILED"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-status"
        >
          {lastResult.fails} FAIL CARD{lastResult.fails !== 1 ? "S" : ""} PLAYED
        </motion.p>
      </div>

      <div className="flex-shrink-0 p-6 w-full">
        <button
          onClick={() => dispatch({ type: "SET_PHASE", phase: "proposal" })}
          className="btn-primary w-full"
        >
          NEXT MISSION
        </button>
      </div>
    </div>
  );
}
