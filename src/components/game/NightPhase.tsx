import { useGame } from "@/game/GameContext";
import { getRoleVisibility, ROLE_INFO } from "@/game/types";
import { PassDevice } from "./PassDevice";
import { HoldToReveal } from "./HoldToReveal";
import { MissionTracker } from "./MissionTracker";

export function NightPhase() {
  const { state, dispatch } = useGame();
  const currentPlayer = state.players[state.currentPassIndex];

  if (state.phase === "night_pass") {
    return (
      <PassDevice
        playerName={currentPlayer.name}
        subtitle="ROLE ASSIGNMENT"
        onConfirm={() => dispatch({ type: "SET_PHASE", phase: "night_reveal" })}
      />
    );
  }

  const role = currentPlayer.role!;
  const roleInfo = ROLE_INFO[role];
  const visiblePlayers = getRoleVisibility(currentPlayer, state.players);
  const isEvil = roleInfo.alignment === "evil";

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="flex-shrink-0 px-6 pt-8 flex justify-center">
        <MissionTracker />
      </div>

      <div className="flex-shrink-0 px-6 pt-4 text-center">
        <p className="text-label">{currentPlayer.name}</p>
      </div>

      <HoldToReveal onRevealed={() => dispatch({ type: "NEXT_PASS" })}>
        <div className="text-center">
          <p className="text-label mb-2">{isEvil ? "AGENT OF EVIL" : "SERVANT OF GOOD"}</p>
          <h2
            className={`text-display text-3xl ${isEvil ? "text-minion" : "text-loyal"}`}
          >
            {roleInfo.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">
            {roleInfo.description}
          </p>

          {visiblePlayers.length > 0 && (
            <div className="mt-6 glass-panel p-4">
              <p className="text-label mb-3">
                {role === "percival" ? "MERLIN CANDIDATES" : "KNOWN ALLIES"}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {visiblePlayers.map(p => (
                  <span
                    key={p.id}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                      role === "percival"
                        ? "border-loyal/30 text-loyal"
                        : "border-minion/30 text-minion"
                    }`}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </HoldToReveal>
    </div>
  );
}
