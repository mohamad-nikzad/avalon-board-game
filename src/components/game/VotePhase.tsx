import { useGame } from "@/game/GameContext";
import { PassDevice } from "./PassDevice";
import { MissionTracker } from "./MissionTracker";
import { motion } from "framer-motion";

export function VotePhase() {
  const { state, dispatch } = useGame();
  const currentPlayer = state.players[state.currentPassIndex];
  const leader = state.players[state.currentLeader];

  if (state.phase === "vote_pass") {
    return (
      <PassDevice
        playerName={currentPlayer.name}
        subtitle={`VOTE ON ${leader.name.toUpperCase()}'S PROPOSAL`}
        onConfirm={() => dispatch({ type: "SET_PHASE", phase: "vote_cast" })}
      />
    );
  }

  // vote_cast
  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="flex-shrink-0 px-6 pt-8 flex justify-center">
        <MissionTracker />
      </div>

      <div className="flex-shrink-0 px-6 pt-6 pb-4 text-center">
        <p className="text-label mb-1">{currentPlayer.name}</p>
        <h2 className="text-display text-xl">CAST YOUR VOTE</h2>
        <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
          {state.proposedTeam.map(id => {
            const p = state.players.find(pl => pl.id === id)!;
            return (
              <span key={id} className="text-xs font-mono tracking-wider uppercase px-2 py-1 border border-glass-border rounded">
                {p.name}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex gap-0">
        <motion.button
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => {
            dispatch({ type: "CAST_VOTE", playerId: currentPlayer.id, approve: true });
            dispatch({ type: "NEXT_PASS" });
          }}
          className="btn-approve rounded-none"
        >
          APPROVE
        </motion.button>
        <motion.button
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => {
            dispatch({ type: "CAST_VOTE", playerId: currentPlayer.id, approve: false });
            dispatch({ type: "NEXT_PASS" });
          }}
          className="btn-reject rounded-none"
        >
          REJECT
        </motion.button>
      </div>
    </div>
  );
}
