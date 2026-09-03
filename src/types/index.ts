export type Program = "FLL" | "FRC";

export interface User {
  id: string;
  name: string;
  program: Program;
}

export type TransactionStatus = "pending" | "approved" | "rejected";

export interface Transaction {
  id: string;
  recipient_id: string;
  sender: string;
  points: number;
  awarded_points?: number;
  reason: string;
  status: TransactionStatus;
  created_at: string;
  // Denormalized/joined field for UI convenience
  recipient_name?: string;
  recipient_program?: Program;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  program: Program;
  score: number;
  rank: number;
}

export interface SubmitPointInput {
  recipient_id: string;
  sender: string;
  points: number;
  reason: string;
}
