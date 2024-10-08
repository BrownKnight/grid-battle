import { Grid } from "../Models";

export type TimerBattleRoom = {
  roomId: string;

  gridId: string | undefined;

  grid: Grid | undefined;

  state: TimerBattleState;

  modifiedDateTime: string;

  roundNumber: number;

  roundStartedAt: string | undefined;

  players: TimerBattlePlayer[];
};

export type TimerBattleState = "WaitingToStart" | "InProgress" | "Finished";

export type TimerBattlePlayer = {
  name: string;
  scores: RoundScore[];
  isActive: boolean;
  isHost: boolean;
};

export type RoundScore = {
  time: number;
  matchCount: number;
  penalties: number;
};
