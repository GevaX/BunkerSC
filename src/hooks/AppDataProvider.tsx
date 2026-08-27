import { useState, useEffect, useCallback } from "react";
import {
  fetchUsers,
  fetchTransactions,
  fetchLeaderboard,
} from "../services/api";
import { supabase, isSupabaseConfigured } from "../services/supabase";
import { AppDataContext } from "./useAppData";
import type { User, Transaction, LeaderboardEntry } from "../types";

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(
    undefined,
  );

  const openSubmitModal = (userId?: string) => {
    if (userId) setSelectedMemberId(userId);
    setIsSubmitOpen(true);
  };

  const closeSubmitModal = () => {
    setIsSubmitOpen(false);
    setSelectedMemberId(undefined); // reset on close
  };

  const reload = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);

    try {
      const [u, t, l] = await Promise.all([
        fetchUsers(),
        fetchTransactions(),
        fetchLeaderboard(),
      ]);

      setUsers(u);
      setTransactions(t);
      setLeaderboard(l);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      const channel = supabase
        .channel("schema-db-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "transactions",
          },
          () => reload(true),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "users",
          },
          () => reload(true),
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    } catch (err) {
      console.warn("Realtime channel setup failed:", err);
    }
  }, [reload]);

  return (
    <AppDataContext.Provider
      value={{
        users,
        transactions,
        leaderboard,
        isLoading,
        reload,
        isSubmitOpen,
        openSubmitModal,
        closeSubmitModal,
        selectedMemberId,
        setSelectedMemberId,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
