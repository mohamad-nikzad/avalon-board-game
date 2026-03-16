import { motion } from "framer-motion";
import { useGame } from "@/game/GameContext";
import { ROLE_INFO } from "@/game/types";
import { MissionTracker } from "./MissionTracker";

export function GameOver() {
  const { state, dispatch } = useGame();
  const isGoodWin = state.winner === "good";

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
          GAME OVER
        </motion.p>

        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`text-display text-4xl ${isGoodWin ? "text-loyal" : "text-minion"}`}
          style={{
            textShadow: isGoodWin
              ? "0 0 60px hsl(var(--loyal) / 0.5)"
              : "0 0 60px hsl(var(--minion) / 0.5)",
          }}
        >
          {isGoodWin ? "GOOD PREVAILS" : "EVIL TRIUMPHS"}
        </motion.h1>

        {/* Role reveal */}
        <div className="w-full max-w-xs space-y-1 mt-4">
          {state.players.map((player, i) => {
            const role = ROLE_INFO[player.role!];
            const isEvil = role.alignment === "evil";
            return (
              <motion.div
                key={player.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center justify-between py-2 px-3 rounded border border-glass-border"
              >
                <span className="text-sm font-medium">{player.name}</span>
                <span className={`text-xs font-mono tracking-wider ${isEvil ? "text-minion" : "text-loyal"}`}>
                  {role.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex-shrink-0 p-6 w-full">
        <button onClick={() => dispatch({ type: "RESET" })} className="btn-primary w-full">
          NEW GAME
        </button>
      </div>
    </div>
  );
}
