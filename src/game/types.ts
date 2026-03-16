export type Role =
  | "merlin"
  | "percival"
  | "loyal_servant"
  | "assassin"
  | "morgana"
  | "mordred"
  | "oberon"
  | "minion";

export type Alignment = "good" | "evil";

export interface Player {
  id: string;
  name: string;
  role?: Role;
  alignment?: Alignment;
}

export type GamePhase =
  | "setup"
  | "night_pass"
  | "night_reveal"
  | "proposal"
  | "vote_pass"
  | "vote_cast"
  | "vote_result"
  | "mission_pass"
  | "mission_cast"
  | "mission_result"
  | "assassin_phase"
  | "game_over";

export interface MissionResult {
  questIndex: number;
  team: string[];
  fails: number;
  success: boolean;
}

export interface VoteRecord {
  questIndex: number;
  proposalNumber: number;
  leader: string;
  team: string[];
  votes: Record<string, boolean>; // playerId -> approve
  passed: boolean;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentQuest: number;
  currentLeader: number;
  proposalCount: number;
  proposedTeam: string[];
  missionResults: MissionResult[];
  voteRecords: VoteRecord[];
  currentVotes: Record<string, boolean>;
  currentMissionVotes: Record<string, boolean>; // true = success
  currentPassIndex: number; // which player is being passed to
  winner?: Alignment;
  specialRoles: {
    useMerlin: boolean;
    usePercival: boolean;
    useMorgana: boolean;
    useMordred: boolean;
    useOberon: boolean;
  };
}

// Game config based on player count
export interface QuestConfig {
  teamSize: number;
  requiresTwoFails: boolean;
}

export const GAME_CONFIGS: Record<number, { good: number; evil: number; quests: QuestConfig[] }> = {
  5: {
    good: 3, evil: 2,
    quests: [
      { teamSize: 2, requiresTwoFails: false },
      { teamSize: 3, requiresTwoFails: false },
      { teamSize: 2, requiresTwoFails: false },
      { teamSize: 3, requiresTwoFails: false },
      { teamSize: 3, requiresTwoFails: false },
    ],
  },
  6: {
    good: 4, evil: 2,
    quests: [
      { teamSize: 2, requiresTwoFails: false },
      { teamSize: 3, requiresTwoFails: false },
      { teamSize: 4, requiresTwoFails: false },
      { teamSize: 3, requiresTwoFails: false },
      { teamSize: 4, requiresTwoFails: false },
    ],
  },
  7: {
    good: 4, evil: 3,
    quests: [
      { teamSize: 2, requiresTwoFails: false },
      { teamSize: 3, requiresTwoFails: false },
      { teamSize: 3, requiresTwoFails: false },
      { teamSize: 4, requiresTwoFails: true },
      { teamSize: 4, requiresTwoFails: false },
    ],
  },
  8: {
    good: 5, evil: 3,
    quests: [
      { teamSize: 3, requiresTwoFails: false },
      { teamSize: 4, requiresTwoFails: false },
      { teamSize: 4, requiresTwoFails: false },
      { teamSize: 5, requiresTwoFails: true },
      { teamSize: 5, requiresTwoFails: false },
    ],
  },
  9: {
    good: 6, evil: 3,
    quests: [
      { teamSize: 3, requiresTwoFails: false },
      { teamSize: 4, requiresTwoFails: false },
      { teamSize: 4, requiresTwoFails: false },
      { teamSize: 5, requiresTwoFails: true },
      { teamSize: 5, requiresTwoFails: false },
    ],
  },
  10: {
    good: 6, evil: 4,
    quests: [
      { teamSize: 3, requiresTwoFails: false },
      { teamSize: 4, requiresTwoFails: false },
      { teamSize: 4, requiresTwoFails: false },
      { teamSize: 5, requiresTwoFails: true },
      { teamSize: 5, requiresTwoFails: false },
    ],
  },
};

export const ROLE_INFO: Record<Role, { name: string; alignment: Alignment; description: string }> = {
  merlin: { name: "MERLIN", alignment: "good", description: "Knows all evil players (except Mordred). Must stay hidden from the Assassin." },
  percival: { name: "PERCIVAL", alignment: "good", description: "Knows Merlin (and Morgana, if in play). Must protect Merlin's identity." },
  loyal_servant: { name: "LOYAL SERVANT", alignment: "good", description: "A loyal servant of Arthur. No special knowledge." },
  assassin: { name: "ASSASSIN", alignment: "evil", description: "If Good wins 3 quests, may attempt to assassinate Merlin for a final victory." },
  morgana: { name: "MORGANA", alignment: "evil", description: "Appears as Merlin to Percival. Sow confusion." },
  mordred: { name: "MORDRED", alignment: "evil", description: "Unknown to Merlin. The hidden blade." },
  oberon: { name: "OBERON", alignment: "evil", description: "Evil, but unknown to other evil players. A lone wolf." },
  minion: { name: "MINION OF MORDRED", alignment: "evil", description: "A servant of evil. Knows fellow evil players." },
};

export function getRoleVisibility(player: Player, allPlayers: Player[]): Player[] {
  if (!player.role) return [];

  switch (player.role) {
    case "merlin":
      // Sees all evil except Mordred
      return allPlayers.filter(
        p => p.id !== player.id && p.alignment === "evil" && p.role !== "mordred"
      );
    case "percival":
      // Sees Merlin and Morgana (can't tell which is which)
      return allPlayers.filter(
        p => p.id !== player.id && (p.role === "merlin" || p.role === "morgana")
      );
    case "assassin":
    case "morgana":
    case "minion":
      // Sees other evil (except Oberon)
      return allPlayers.filter(
        p => p.id !== player.id && p.alignment === "evil" && p.role !== "oberon"
      );
    case "mordred":
      // Sees other evil (except Oberon)
      return allPlayers.filter(
        p => p.id !== player.id && p.alignment === "evil" && p.role !== "oberon"
      );
    case "oberon":
      // Sees nobody
      return [];
    default:
      return [];
  }
}
