export type Grid = {
  id: string;
  name: string;
  source: GridSource;
  createdDateTime: string;
  createdBy: string;
  categories: Category[];
};

export type GridSource = "NYT" | "Custom" | "Test" | "AI";

export type Category = {
  name: string;
  answers: string[];
};

export type Leaderboard = {
  leaderboardId: string;
  name: string;
};

export type LeaderboardEntry = {
  gridId: string;
  userId: string;
  username: string;
  // milliseconds
  totalTime: number;
  penalties: number;
  createdDateTime: string;
};

export type User = {
  userId: string;
  username: string;
};
