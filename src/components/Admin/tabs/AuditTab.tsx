import React, { useState } from "react";
import { Search, Check, X } from "lucide-react";
import type { Transaction } from "../../../types";
import { formatDate } from "../../../services/utils";

type HistoryFilter = "all" | "approved" | "rejected" | "pending";

interface AuditLogTabProps {
  transactions: Transaction[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const AuditLogTab: React.FC<AuditLogTabProps> = ({
  transactions,
  onApprove,
  onReject,
}) => {
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [historySearch, setHistorySearch] = useState("");

  const filteredHistory = transactions.filter((t) => {
    if (historyFilter !== "all" && t.status !== historyFilter) return false;
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      return (
        (t.recipient_name || "").toLowerCase().includes(q) ||
        t.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            placeholder="Search history by member or reason..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 w-64"
          />
        </div>

        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setHistoryFilter("all")}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              historyFilter === "all"
                ? "bg-zinc-800 text-zinc-100 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setHistoryFilter("approved")}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              historyFilter === "approved"
                ? "bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-800/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setHistoryFilter("pending")}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              historyFilter === "pending"
                ? "bg-amber-950/60 text-amber-300 font-bold border border-amber-800/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setHistoryFilter("rejected")}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              historyFilter === "rejected"
                ? "bg-rose-950/60 text-rose-300 font-bold border border-rose-800/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredHistory.map((tx) => {
          const awardedPoints = tx.awarded_points ?? tx.points;
          const isPos = awardedPoints >= 0;
          const wasModified =
            tx.awarded_points != null && tx.awarded_points !== tx.points;
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`font-mono font-bold px-2 py-1 rounded-lg border ${
                    isPos
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {wasModified && (
                    <span className="mr-1 text-zinc-500 line-through">
                      {isPos ? `+${tx.points}` : tx.points}
                    </span>
                  )}
                  {isPos ? `+${awardedPoints}` : awardedPoints}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-zinc-100">
                      {tx.recipient_name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded border ${
                        tx.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : tx.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-zinc-400 truncate mt-0.5 max-w-md">
                    {tx.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-zinc-500 text-[11px] hidden sm:inline">
                  {formatDate(tx.created_at)}
                </span>

                {tx.status !== "approved" && (
                  <button
                    onClick={() => onApprove(tx.id)}
                    title="Set status to Approved"
                    className="p-1 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}

                {tx.status !== "rejected" && (
                  <button
                    onClick={() => onReject(tx.id)}
                    title="Set status to Rejected"
                    className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
