export interface User {
  id: string;
  name: string;
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
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
}

export interface SubmitPointInput {
  recipient_id: string;
  sender: string;
  points: number;
  reason: string;
}
