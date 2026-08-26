import { useState } from "react";
import { Leaderboard } from "../components/Leaderboard";
import { MemberDetailModal } from "../components/MemberDetailModal";
import { useAppData } from "../hooks/useAppData";
import type { LeaderboardEntry } from "../types";

export function LeaderboardPage() {
  const { leaderboard, transactions, openSubmitModal } = useAppData();
  const [selectedMember, setSelectedMember] = useState<LeaderboardEntry | null>(
    null,
  );

  return (
    <>
      <Leaderboard entries={leaderboard} onSelectMember={setSelectedMember} />

      <MemberDetailModal
        member={selectedMember}
        transactions={transactions}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        onOpenSubmitForMember={(id) => {
          setSelectedMember(null);
          openSubmitModal(id);
        }}
      />
    </>
  );
}
