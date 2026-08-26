import { createContext, useContext } from "react";
import type { User, Transaction, LeaderboardEntry } from "../types";

export interface AppDataContextValue {
  users: User[];
  transactions: Transaction[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  reload: (silent?: boolean) => Promise<void>;
  isSubmitOpen: boolean;
  openSubmitModal: (id?: string) => void;
  closeSubmitModal: () => void;
  selectedMemberId: string | undefined;
  setSelectedMemberId: (id: string | undefined) => void;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);

export function useAppData() {
  const ctx = useContext(AppDataContext);

  if (!ctx) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }

  return ctx;
}
