import { motion } from "framer-motion";
import { useGame } from "@/game/GameContext";
import { MissionTracker } from "./MissionTracker";

export function VoteResult() {
  const { state, dispatch } = useGame();
  const lastVote = state.voteRecords[state.voteRecords.length - 1];
  if (!lastVote) return null;

  const approves = Object.entries(lastVote.votes).filter(([, v]) => v);
  const rejects = Object.entries(lastVote.votes).filter(([, v]) => !v);

  const handleContinue = () => {
    if (lastVote.passed) {
      // Start mission
      dispatch({ type: "SET_PHASE", phase: "mission_pass" });
    } else {
      // Back to proposal
      dispatch({ type: "SET_PHASE", phase: "proposal" });
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center">
      <div className="flex-shrink-0 px-6 pt-8">
        <MissionTracker />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-label"
        >
          VOTE RESULT
        </motion.p>
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`text-display text-4xl ${lastVote.passed ? "text-loyal" : "text-minion"}`}
        >
          {lastVote.passed ? "APPROVED" : "REJECTED"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-status"
        >
          {approves.length} APPROVE · {rejects.length} REJECT
        </motion.p>

        <div className="w-full max-w-xs space-y-1 mt-4">
          {Object.entries(lastVote.votes).map(([playerId, approved], i) => {
            const player = state.players.find(p => p.id === playerId);
            return (
              <motion.div
                key={playerId}
                initial={{ x: approved ? -30 : 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center justify-between py-2 px-3 rounded border border-glass-border"
              >
                <span className="text-sm font-medium">{player?.name}</span>
                <span className={`text-xs font-mono tracking-wider ${approved ? "text-loyal" : "text-minion"}`}>
                  {approved ? "APPROVE" : "REJECT"}
                </span>
              </motion.div>
            );
          })}
        </div>

        {!lastVote.passed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs text-muted-foreground mt-2"
          >
            PROPOSAL {state.proposalCount}/5 · {5 - state.proposalCount} REMAINING
          </motion.p>
        )}
      </div>

      <div className="flex-shrink-0 p-6 w-full">
        <button onClick={handleContinue} className="btn-primary w-full">
          {lastVote.passed ? "BEGIN MISSION" : "NEXT PROPOSAL"}
        </button>
      </div>
    </div>
  );
}
