import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/game/GameContext";
import { MissionTracker } from "./MissionTracker";

export function AssassinPhase() {
  const { state, dispatch } = useGame();
  const [target, setTarget] = useState<string | null>(null);
  const assassin = state.players.find(p => p.role === "assassin");
  const goodPlayers = state.players.filter(p => p.alignment === "good");

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="flex-shrink-0 px-6 pt-8 flex justify-center">
        <MissionTracker />
      </div>

      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <p className="text-label text-minion mb-1">FINAL GAMBIT</p>
        <h1 className="text-display text-2xl">IDENTIFY MERLIN</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Good has won 3 missions. {assassin?.name} (Assassin) may now attempt to identify Merlin.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        {goodPlayers.map((player, i) => (
          <motion.button
            key={player.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setTarget(player.id)}
            className={`w-full flex items-center justify-between py-4 px-4 mb-2 rounded-lg border transition-all ${
              target === player.id
                ? "border-minion/40 bg-minion/5"
                : "border-glass-border bg-transparent"
            }`}
          >
            <span className="font-medium">{player.name}</span>
            {target === player.id && (
              <span className="text-xs font-mono text-minion tracking-wider">TARGET</span>
            )}
          </motion.button>
        ))}
      </div>

      <div className="flex-shrink-0 p-6 border-t border-glass-border">
        <button
          onClick={() => target && dispatch({ type: "ASSASSINATE", targetId: target })}
          disabled={!target}
          className="btn-primary w-full bg-minion text-foreground"
        >
          ASSASSINATE
        </button>
      </div>
    </div>
  );
}
