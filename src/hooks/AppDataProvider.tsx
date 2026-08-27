import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "../services/supabase";
import { AppDataContext } from "./useAppData";

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
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
    setSelectedMemberId(undefined);
  };

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    // Debounce cache invalidation to prevent spamming the DB during bulk updates
    let timeoutId: NodeJS.Timeout;
    const invalidateCache = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // This tells React Query the data is stale, prompting an automatic refetch
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      }, 500);
    };

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        invalidateCache,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        invalidateCache,
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
      clearTimeout(timeoutId);
    };
  }, [queryClient]);

  return (
    <AppDataContext.Provider
      value={{
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
