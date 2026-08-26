import React, { useState } from "react";
import {
  Activity,
  Plus,
  Minus,
  Clock,
  Search,
  ShieldCheck,
} from "lucide-react";
import { formatRelativeTime } from "../services/utils";
import type { Transaction } from "../types";

interface ActivityFeedProps {
  transactions: Transaction[];
  onSelectMemberByName?: (name: string) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  transactions,
  onSelectMemberByName,
}) => {
  const [filterType, setFilterType] = useState<"all" | "positive" | "negative">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const approvedTxs = transactions.filter((t) => t.status === "approved");

  const filtered = approvedTxs.filter((tx) => {
    if (filterType === "positive" && tx.points <= 0) return false;
    if (filterType === "negative" && tx.points >= 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (tx.recipient_name || "").toLowerCase().includes(q);
      const reasonMatch = tx.reason.toLowerCase().includes(q);
      return nameMatch || reasonMatch;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">
              Live Ledger Feed
            </h2>
            <p className="text-xs text-zinc-400">
              Real-time chronicle of approved point transactions
            </p>
          </div>
        </div>

        {/* Filter buttons & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feed..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === "all"
                  ? "bg-zinc-800 text-zinc-100 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("positive")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === "positive"
                  ? "bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-800/50"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Rewards
            </button>
            <button
              onClick={() => setFilterType("negative")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterType === "negative"
                  ? "bg-rose-950/60 text-rose-300 font-bold border border-rose-800/50"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Penalties
            </button>
          </div>
        </div>
      </div>

      {/* Feed List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/60 text-zinc-500">
          <ShieldCheck className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
          <p className="text-sm font-semibold">
            No approved transactions match your filter
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Transactions appear here as soon as an administrator approves them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((tx) => {
            const isPos = tx.points >= 0;
            return (
              <div
                key={tx.id}
                className="group relative flex flex-col justify-between p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-md hover:shadow-zinc-950/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <button
                      onClick={() =>
                        onSelectMemberByName &&
                        onSelectMemberByName(tx.recipient_name || "")
                      }
                      className="text-sm font-extrabold text-zinc-100 hover:text-emerald-400 transition text-left flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="w-6 h-6 rounded-lg bg-zinc-800 text-[11px] font-mono flex items-center justify-center text-zinc-300 border border-zinc-700/60">
                        {(tx.recipient_name || "U").charAt(0).toUpperCase()}
                      </span>
                      <span>{tx.recipient_name}</span>
                    </button>

                    <div
                      className={`flex items-center gap-1 text-xs font-black font-mono px-2.5 py-1 rounded-lg border ${
                        isPos
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {isPos ? (
                        <Plus className="w-3 h-3" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                      <span>{Math.abs(tx.points)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed pl-7">
                    {tx.reason}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500 pl-7">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(tx.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
