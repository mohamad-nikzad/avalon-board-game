import React, { createContext, useContext, useReducer, useCallback } from "react";
import { GameState, GamePhase, Player, Role, GAME_CONFIGS, ROLE_INFO, MissionResult, VoteRecord } from "./types";

type GameAction =
  | { type: "SET_PLAYERS"; players: Player[] }
  | { type: "SET_SPECIAL_ROLES"; roles: GameState["specialRoles"] }
  | { type: "START_GAME" }
  | { type: "SET_PHASE"; phase: GamePhase }
  | { type: "NEXT_PASS" }
  | { type: "SET_PROPOSED_TEAM"; team: string[] }
  | { type: "CAST_VOTE"; playerId: string; approve: boolean }
  | { type: "RESOLVE_VOTES" }
  | { type: "CAST_MISSION"; playerId: string; success: boolean }
  | { type: "RESOLVE_MISSION" }
  | { type: "ASSASSINATE"; targetId: string }
  | { type: "RESET" };

const initialState: GameState = {
  phase: "setup",
  players: [],
  currentQuest: 0,
  currentLeader: 0,
  proposalCount: 0,
  proposedTeam: [],
  missionResults: [],
  voteRecords: [],
  currentVotes: {},
  currentMissionVotes: {},
  currentPassIndex: 0,
  specialRoles: {
    useMerlin: true,
    usePercival: false,
    useMorgana: false,
    useMordred: false,
    useOberon: false,
  },
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function assignRoles(players: Player[], specialRoles: GameState["specialRoles"]): Player[] {
  const config = GAME_CONFIGS[players.length];
  if (!config) return players;

  const roles: Role[] = [];

  // Evil roles
  if (specialRoles.useMerlin) {
    roles.push("assassin"); // Assassin always comes with Merlin
  } else {
    roles.push("minion");
  }
  if (specialRoles.useMorgana) roles.push("morgana");
  else if (config.evil > 1) roles.push("minion");
  if (specialRoles.useMordred && config.evil > 2) roles.push("mordred");
  else if (config.evil > 2) roles.push("minion");
  if (specialRoles.useOberon && config.evil > 3) roles.push("oberon");
  else if (config.evil > 3) roles.push("minion");

  // Fill remaining evil
  while (roles.filter(r => ROLE_INFO[r].alignment === "evil").length < config.evil) {
    roles.push("minion");
  }

  // Good roles
  if (specialRoles.useMerlin) roles.push("merlin");
  if (specialRoles.usePercival) roles.push("percival");
  while (roles.filter(r => ROLE_INFO[r].alignment === "good").length < config.good) {
    roles.push("loyal_servant");
  }

  const shuffled = shuffleArray(roles);
  return players.map((p, i) => ({
    ...p,
    role: shuffled[i],
    alignment: ROLE_INFO[shuffled[i]].alignment,
  }));
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_PLAYERS":
      return { ...state, players: action.players };

    case "SET_SPECIAL_ROLES":
      return { ...state, specialRoles: action.roles };

    case "START_GAME": {
      const players = assignRoles(state.players, state.specialRoles);
      const startLeader = Math.floor(Math.random() * players.length);
      return {
        ...state,
        players,
        phase: "night_pass",
        currentPassIndex: 0,
        currentLeader: startLeader,
        currentQuest: 0,
        proposalCount: 0,
        missionResults: [],
        voteRecords: [],
      };
    }

    case "SET_PHASE":
      // Reset currentPassIndex when entering pass phases
      const resetPass = ["mission_pass", "vote_pass", "night_pass", "proposal"].includes(action.phase);
      return { ...state, phase: action.phase, ...(resetPass && { currentPassIndex: 0 }) };

    case "NEXT_PASS": {
      const next = state.currentPassIndex + 1;
      if (state.phase === "night_pass" || state.phase === "night_reveal") {
        if (next >= state.players.length) {
          return { ...state, phase: "proposal", currentPassIndex: 0 };
        }
        return { ...state, phase: "night_pass", currentPassIndex: next };
      }
      if (state.phase === "vote_pass" || state.phase === "vote_cast") {
        if (next >= state.players.length) {
          // All votes in, resolve
          return resolveVotes({ ...state, currentPassIndex: next });
        }
        return { ...state, phase: "vote_pass", currentPassIndex: next };
      }
      if (state.phase === "mission_pass" || state.phase === "mission_cast") {
        const teamPlayerIds = state.proposedTeam;
        if (next >= teamPlayerIds.length) {
          return resolveMission({ ...state, currentPassIndex: next });
        }
        return { ...state, phase: "mission_pass", currentPassIndex: next };
      }
      return state;
    }

    case "SET_PROPOSED_TEAM":
      return { ...state, proposedTeam: action.team };

    case "CAST_VOTE":
      return {
        ...state,
        currentVotes: { ...state.currentVotes, [action.playerId]: action.approve },
        phase: "vote_cast",
      };

    case "RESOLVE_VOTES":
      return resolveVotes(state);

    case "CAST_MISSION":
      return {
        ...state,
        currentMissionVotes: { ...state.currentMissionVotes, [action.playerId]: action.success },
        phase: "mission_cast",
      };

    case "RESOLVE_MISSION":
      return resolveMission(state);

    case "ASSASSINATE": {
      const target = state.players.find(p => p.id === action.targetId);
      const winner = target?.role === "merlin" ? "evil" : "good";
      return { ...state, phase: "game_over", winner };
    }

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

function resolveVotes(state: GameState): GameState {
  const approves = Object.values(state.currentVotes).filter(Boolean).length;
  const passed = approves > state.players.length / 2;

  const voteRecord: VoteRecord = {
    questIndex: state.currentQuest,
    proposalNumber: state.proposalCount,
    leader: state.players[state.currentLeader].id,
    team: state.proposedTeam,
    votes: { ...state.currentVotes },
    passed,
  };

  if (passed) {
    return {
      ...state,
      phase: "vote_result",
      voteRecords: [...state.voteRecords, voteRecord],
      currentVotes: {},
    };
  }

  // Proposal rejected
  const newProposalCount = state.proposalCount + 1;
  if (newProposalCount >= 5) {
    // 5 rejected proposals = evil wins
    return {
      ...state,
      phase: "game_over",
      winner: "evil",
      voteRecords: [...state.voteRecords, voteRecord],
    };
  }

  const nextLeader = (state.currentLeader + 1) % state.players.length;
  return {
    ...state,
    phase: "vote_result",
    voteRecords: [...state.voteRecords, voteRecord],
    currentVotes: {},
    currentLeader: nextLeader,
    proposalCount: newProposalCount,
    proposedTeam: [],
  };
}

function resolveMission(state: GameState): GameState {
  const config = GAME_CONFIGS[state.players.length];
  const quest = config.quests[state.currentQuest];
  const fails = Object.values(state.currentMissionVotes).filter(v => !v).length;
  const success = quest.requiresTwoFails ? fails < 2 : fails === 0;

  const result: MissionResult = {
    questIndex: state.currentQuest,
    team: state.proposedTeam,
    fails,
    success,
  };

  const results = [...state.missionResults, result];
  const goodWins = results.filter(r => r.success).length;
  const evilWins = results.filter(r => !r.success).length;

  if (goodWins >= 3) {
    // Check if assassin phase needed (Merlin in play)
    const hasMerlin = state.players.some(p => p.role === "merlin");
    if (hasMerlin) {
      return {
        ...state,
        phase: "assassin_phase",
        missionResults: results,
        currentMissionVotes: {},
      };
    }
    return {
      ...state,
      phase: "game_over",
      winner: "good",
      missionResults: results,
      currentMissionVotes: {},
    };
  }

  if (evilWins >= 3) {
    return {
      ...state,
      phase: "game_over",
      winner: "evil",
      missionResults: results,
      currentMissionVotes: {},
    };
  }

  // Next quest
  const nextLeader = (state.currentLeader + 1) % state.players.length;
  return {
    ...state,
    phase: "mission_result",
    missionResults: results,
    currentMissionVotes: {},
    currentQuest: state.currentQuest + 1,
    currentLeader: nextLeader,
    proposalCount: 0,
    proposedTeam: [],
  };
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
