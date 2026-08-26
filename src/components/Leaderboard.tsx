import React, { useState } from "react";
import { Trophy, Search, ChevronRight } from "lucide-react";
import type { LeaderboardEntry } from "../types";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onSelectMember: (member: LeaderboardEntry) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  onSelectMember,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = entries.filter((entry) => {
    if (searchQuery.trim()) {
      return entry.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Table Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">
              Leaderboard Standings
            </h2>
            <p className="text-xs text-zinc-400">
              Ranked by total approved social credit
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member..."
            className="w-full sm:w-60 pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {/* Table Rows */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 text-zinc-500">
          <p className="text-sm font-semibold">No participants found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEntries.map((entry) => {
            const isFirst = entry.rank === 1;
            const isSecond = entry.rank === 2;
            const isThird = entry.rank === 3;
            const isScorePos = entry.score > 0;
            const isScoreNeg = entry.score < 0;

            return (
              <div
                key={entry.id}
                onClick={() => onSelectMember(entry)}
                className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer border ${
                  isFirst
                    ? "bg-zinc-900/90 border-amber-500/40 hover:border-amber-400/80 shadow-md shadow-amber-950/20"
                    : isSecond
                      ? "bg-zinc-900/80 border-slate-500/40 hover:border-slate-400/80"
                      : isThird
                        ? "bg-zinc-900/80 border-amber-700/40 hover:border-amber-600/80"
                        : "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80"
                }`}
              >
                {/* Left: Rank & Name */}
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                  {/* Rank Badge */}
                  <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 shrink-0">
                    {isFirst ? (
                      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-400 text-zinc-950 font-black text-sm shadow-md">
                        1
                      </div>
                    ) : isSecond ? (
                      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-300 text-zinc-950 font-black text-sm shadow-md">
                        2
                      </div>
                    ) : isThird ? (
                      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-700 text-zinc-100 font-black text-sm shadow-md">
                        3
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-sm text-zinc-500 group-hover:text-zinc-300 transition">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Member Name */}
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm sm:text-base text-zinc-100 truncate group-hover:text-emerald-400 transition">
                        {entry.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Score & Actions */}
                <div className="flex items-center space-x-4 shrink-0">
                  {/* Score */}
                  <div className="text-right">
                    <div
                      className={`text-base sm:text-lg font-black font-mono tracking-tight ${
                        isScorePos
                          ? "text-emerald-400"
                          : isScoreNeg
                            ? "text-rose-400"
                            : "text-zinc-400"
                      }`}
                    >
                      {entry.score.toLocaleString("en-US")}
                    </div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                      Points
                    </span>
                  </div>

                  {/* Chevron / Inspect */}
                  <div className="flex items-center text-zinc-600 group-hover:text-zinc-300 transition pl-1">
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
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
