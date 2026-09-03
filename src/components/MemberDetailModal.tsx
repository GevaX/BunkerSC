import React from "react";
import {
  X,
  Clock,
  FileText,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { LeaderboardEntry, Transaction } from "../types";
import { formatDate } from "../services/utils";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { ProgramBadge } from "./ui/ProgramBadge";

interface MemberDetailModalProps {
  member: LeaderboardEntry | null;
  transactions: Transaction[];
  isOpen: boolean;
  onClose: () => void;
  onOpenSubmitForMember: (memberId: string) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  transactions,
  isOpen,
  onClose,
  onOpenSubmitForMember,
}) => {
  useEscapeKey(onClose);
  if (!isOpen || !member) return null;

  const memberTransactions = transactions.filter(
    (t) => t.recipient_id === member.id,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[88vh] flex flex-col bg-zinc-900 border border-zinc-700/60 rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-lg font-black text-emerald-400">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-zinc-100">
                  {member.name}
                </h2>
                <ProgramBadge program={member.program} size="md" />
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                  Rank #{member.rank}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Stats Ribbon */}
        <div className="grid grid-cols-2 gap-2 px-6 py-3 bg-zinc-950/30 border-b border-zinc-800/80 text-center">
          <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-medium">
              Total Score
            </span>
            <div
              className={`text-lg font-black font-mono ${
                member.score > 0
                  ? "text-emerald-400"
                  : member.score < 0
                    ? "text-rose-400"
                    : "text-zinc-300"
              }`}
            >
              {member.score.toLocaleString("en-US")}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-medium">
              Approved Actions
            </span>
            <div className="text-lg font-black font-mono text-zinc-200">
              {memberTransactions.length}
            </div>
          </div>
        </div>

        {/* Scrollable History */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Credit Record &amp; Transaction History</span>
            </h3>

            {memberTransactions.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm bg-zinc-950/40 rounded-xl border border-zinc-800/50">
                No recorded point transactions for this member yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {memberTransactions.map((tx) => {
                  const awardedPoints = tx.awarded_points ?? tx.points;
                  const isPos = awardedPoints >= 0;
                  const wasModified =
                    tx.awarded_points && tx.awarded_points !== tx.points;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg border ${
                            isPos
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {isPos ? (
                            <ArrowUp className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-zinc-200">
                            {tx.reason}
                          </p>
                          <div className="flex items-center space-x-2 text-[11px] text-zinc-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(tx.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-sm font-bold font-mono px-2.5 py-1 rounded-lg border shrink-0 ${
                          isPos
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                        }`}
                      >
                        {wasModified && (
                          <span className="mr-1 text-zinc-500 line-through">
                            {isPos ? `+${tx.points}` : tx.points}
                          </span>
                        )}
                        {isPos ? `+${awardedPoints}` : awardedPoints}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/50">
          <button
            onClick={() => {
              onClose();
              onOpenSubmitForMember(member.id);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
          >
            <span>Submit a point request for {member.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
