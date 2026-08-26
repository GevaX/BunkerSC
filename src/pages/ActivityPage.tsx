import { useState } from "react";
import { ActivityFeed } from "../components/ActivityFeed";
import { MemberDetailModal } from "../components/MemberDetailModal";
import { useAppData } from "../hooks/useAppData";
import type { LeaderboardEntry } from "../types";

export function ActivityPage() {
  const { leaderboard, transactions, openSubmitModal } = useAppData();
  const [selectedMember, setSelectedMember] = useState<LeaderboardEntry | null>(
    null,
  );

  const handleSelectMemberByName = (name: string) => {
    const member = leaderboard.find(
      (m) => m.name.toLowerCase() === name.toLowerCase(),
    );
    if (member) setSelectedMember(member);
  };

  return (
    <>
      <ActivityFeed
        transactions={transactions}
        onSelectMemberByName={handleSelectMemberByName}
      />
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
