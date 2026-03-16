import { useGame } from "@/game/GameContext";
import { GAME_CONFIGS } from "@/game/types";

export function MissionTracker() {
  const { state } = useGame();
  const config = GAME_CONFIGS[state.players.length];
  if (!config) return null;

  return (
    <div className="flex items-center gap-3">
      {config.quests.map((quest, i) => {
        const result = state.missionResults.find(r => r.questIndex === i);
        const isCurrent = i === state.currentQuest && !result;

        let className = "mission-empty";
        if (result) {
          className = result.success ? "mission-success" : "mission-fail";
        } else if (isCurrent) {
          className = "mission-current";
        }

        return (
          <div key={i} className={className}>
            <span>{quest.teamSize}</span>
            {quest.requiresTwoFails && (
              <span className="absolute -bottom-4 text-[10px] text-muted-foreground">2✕</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
