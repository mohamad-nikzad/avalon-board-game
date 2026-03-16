import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/game/GameContext";
import { GAME_CONFIGS } from "@/game/types";
import { MissionTracker } from "./MissionTracker";
import { Check } from "lucide-react";

export function ProposalPhase() {
  const { state, dispatch } = useGame();
  const config = GAME_CONFIGS[state.players.length];
  const quest = config.quests[state.currentQuest];
  const leader = state.players[state.currentLeader];
  const [selected, setSelected] = useState<string[]>([]);

  const togglePlayer = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else if (selected.length < quest.teamSize) {
      setSelected([...selected, id]);
    }
  };

  const handlePropose = () => {
    dispatch({ type: "SET_PROPOSED_TEAM", team: selected });
    dispatch({ type: "SET_PHASE", phase: "vote_pass" });
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="flex-shrink-0 px-6 pt-8 flex justify-center">
        <MissionTracker />
      </div>

      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <p className="text-label mb-1">
          MISSION {state.currentQuest + 1} · PROPOSAL {state.proposalCount + 1}/5
        </p>
        <h1 className="text-display text-2xl">SELECT YOUR TEAM</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-label text-leader">LEADER:</span>
          <span className="text-sm font-semibold text-leader">{leader.name}</span>
        </div>
        <p className="text-status mt-1">
          {selected.length} / {quest.teamSize} SELECTED
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        {state.players.map((player, i) => {
          const isSelected = selected.includes(player.id);
          const isLeader = player.id === leader.id;
          return (
            <motion.button
              key={player.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => togglePlayer(player.id)}
              className={`w-full flex items-center justify-between py-4 px-4 mb-2 rounded-lg border transition-all ${
                isSelected
                  ? "border-loyal/40 bg-loyal/5"
                  : "border-glass-border bg-transparent hover:bg-glass-hover"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-label w-6">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-medium">{player.name}</span>
                {isLeader && (
                  <span className="text-[10px] tracking-widest uppercase text-leader font-mono">
                    LEADER
                  </span>
                )}
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-loyal/20 border border-loyal/40 flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-loyal" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex-shrink-0 p-6 border-t border-glass-border">
        <button
          onClick={handlePropose}
          disabled={selected.length !== quest.teamSize}
          className="btn-primary w-full"
        >
          PROPOSE TEAM
        </button>
      </div>
    </div>
  );
}
