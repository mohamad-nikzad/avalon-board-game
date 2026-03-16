import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/game/GameContext";
import { Player, GAME_CONFIGS } from "@/game/types";
import { X, Plus } from "lucide-react";

export function SetupScreen() {
  const { state, dispatch } = useGame();
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", "", "", ""]);
  const [inputValue, setInputValue] = useState("");
  const [showRoles, setShowRoles] = useState(false);

  const validNames = playerNames.filter(n => n.trim().length > 0);
  const canStart = validNames.length >= 5 && validNames.length <= 10;
  const config = GAME_CONFIGS[validNames.length];

  const addPlayer = () => {
    if (inputValue.trim() && playerNames.length < 10) {
      setPlayerNames([...playerNames.slice(0, -1).filter(n => n.trim()), inputValue.trim(), ""]);
      setInputValue("");
    }
  };

  const removePlayer = (index: number) => {
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  const handleStart = () => {
    const players: Player[] = validNames.map((name, i) => ({
      id: `player-${i}`,
      name,
    }));
    dispatch({ type: "SET_PLAYERS", players });
    dispatch({ type: "START_GAME" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPlayer();
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-label mb-2">AVALON</p>
          <h1 className="text-display text-3xl">ASSEMBLE<br />YOUR TABLE</h1>
        </motion.div>
      </div>

      {/* Player List */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <AnimatePresence>
          {playerNames.map((name, i) => {
            if (!name.trim()) return null;
            return (
              <motion.div
                key={`${name}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between py-3 border-b border-glass-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-label w-6">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-foreground font-medium">{name}</span>
                </div>
                <button onClick={() => removePlayer(i)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Input */}
        {validNames.length < 10 && (
          <div className="flex items-center gap-2 py-3 border-b border-glass-border">
            <span className="text-label w-6">{String(validNames.length + 1).padStart(2, "0")}</span>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter name..."
              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground/50 outline-none font-medium"
              autoFocus
            />
            <button
              onClick={addPlayer}
              disabled={!inputValue.trim()}
              className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Config info */}
        {config && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 glass-panel p-4"
          >
            <p className="text-label mb-2">CONFIGURATION</p>
            <p className="text-sm text-muted-foreground">
              <span className="text-loyal">{config.good} LOYAL</span>
              {" · "}
              <span className="text-minion">{config.evil} EVIL</span>
            </p>
          </motion.div>
        )}

        {/* Role toggles */}
        {canStart && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <button
              onClick={() => setShowRoles(!showRoles)}
              className="text-label hover:text-foreground transition-colors"
            >
              {showRoles ? "HIDE" : "SHOW"} SPECIAL ROLES ▾
            </button>
            <AnimatePresence>
              {showRoles && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-3 space-y-2"
                >
                  {[
                    { key: "useMerlin" as const, label: "MERLIN + ASSASSIN", desc: "Core roles. Recommended." },
                    { key: "usePercival" as const, label: "PERCIVAL", desc: "Knows Merlin's identity." },
                    { key: "useMorgana" as const, label: "MORGANA", desc: "Appears as Merlin to Percival." },
                    { key: "useMordred" as const, label: "MORDRED", desc: "Hidden from Merlin. (7+ players)" },
                    { key: "useOberon" as const, label: "OBERON", desc: "Evil lone wolf. (10 players)" },
                  ].map(({ key, label, desc }) => {
                    const disabled =
                      (key === "useMordred" && validNames.length < 7) ||
                      (key === "useOberon" && validNames.length < 10);
                    return (
                      <button
                        key={key}
                        disabled={disabled}
                        onClick={() =>
                          dispatch({
                            type: "SET_SPECIAL_ROLES",
                            roles: { ...state.specialRoles, [key]: !state.specialRoles[key] },
                          })
                        }
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          state.specialRoles[key]
                            ? "border-loyal/40 bg-loyal/5"
                            : "border-glass-border bg-transparent"
                        } ${disabled ? "opacity-30 pointer-events-none" : ""}`}
                      >
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-6 border-t border-glass-border">
        <div className="flex items-center justify-between mb-4">
          <p className="text-label">{validNames.length} / 10 PLAYERS</p>
          {!canStart && validNames.length > 0 && (
            <p className="text-xs text-minion">MIN 5 PLAYERS</p>
          )}
        </div>
        <button onClick={handleStart} disabled={!canStart} className="btn-primary w-full">
          BEGIN GAME
        </button>
      </div>
    </div>
  );
}
