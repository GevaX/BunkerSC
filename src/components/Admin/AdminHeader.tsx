import React from "react";
import {
  Shield,
  ArrowLeft,
  LogOut,
  Clock,
  FileCheck,
  Users,
} from "lucide-react";

export type AdminTab = "pending" | "history" | "members";

interface AdminHeaderProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  pendingCount: number;
  historyCount: number;
  rosterCount: number;
  onLogout: () => void;
  onReturnToLeaderboard: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
  historyCount,
  rosterCount,
  onLogout,
  onReturnToLeaderboard,
}) => {
  return (
    <>
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-black text-zinc-100">
                Admin Portal
              </h1>
            </div>
            <p className="text-xs text-zinc-400">
              Manage incoming point requests, audit history, and group members
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onReturnToLeaderboard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 max-w-md">
        <button
          onClick={() => onTabChange("pending")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition relative cursor-pointer ${
            activeTab === "pending"
              ? "bg-zinc-800 text-zinc-100 shadow border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Pending Queue</span>
          {pendingCount > 0 && (
            <span className="flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-black rounded-full bg-amber-500 text-zinc-950">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange("history")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "history"
              ? "bg-zinc-800 text-zinc-100 shadow border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Audit Log ({historyCount})</span>
        </button>

        <button
          onClick={() => onTabChange("members")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "members"
              ? "bg-zinc-800 text-zinc-100 shadow border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Roster ({rosterCount})</span>
        </button>
      </div>
    </>
  );
};
