/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Check,
  X,
  Clock,
  Plus,
  Minus,
  Users,
  Shield,
  FileCheck,
  Trash2,
  CheckCircle2,
  LogOut,
  UserPlus,
  ArrowLeft,
  Search,
} from "lucide-react";
import type { User, Transaction } from "../../types";
import {
  updateTransactionStatus,
  batchUpdateTransactionStatus,
  addUser,
  deleteUser,
} from "../../services/api";

interface AdminDashboardProps {
  passcode: string;
  users: User[];
  transactions: Transaction[];
  onRefreshData: () => Promise<void>;
  onLogout: () => void;
  onReturnToLeaderboard: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  passcode,
  users,
  transactions,
  onRefreshData,
  onLogout,
  onReturnToLeaderboard,
}) => {
  const [activeTab, setActiveTab] = useState<"pending" | "history" | "members">(
    "pending",
  );
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New member form
  const [newMemberName, setNewMemberName] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  // History search & filter
  const [historyFilter, setHistoryFilter] = useState<
    "all" | "approved" | "rejected" | "pending"
  >("all");
  const [historySearch, setHistorySearch] = useState("");

  const pendingTransactions = transactions.filter(
    (t) => t.status === "pending",
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      await updateTransactionStatus(id, "approved", passcode);
      await onRefreshData();
      showToast("Transaction approved and leaderboard updated!");
    } catch (err: any) {
      alert(`Error approving: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoadingId(id);
    try {
      await updateTransactionStatus(id, "rejected", passcode);
      await onRefreshData();
      showToast("Transaction rejected and discarded from standings.");
    } catch (err: any) {
      alert(`Error rejecting: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBatchApproveAll = async () => {
    if (pendingTransactions.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to approve all ${pendingTransactions.length} pending requests?`,
      )
    )
      return;

    setIsBatchLoading(true);
    try {
      const ids = pendingTransactions.map((t) => t.id);
      await batchUpdateTransactionStatus(ids, "approved", passcode);
      await onRefreshData();
      showToast(`All ${ids.length} requests approved!`);
    } catch (err: any) {
      alert(`Batch error: ${err.message}`);
    } finally {
      setIsBatchLoading(false);
    }
  };

  const handleBatchRejectAll = async () => {
    if (pendingTransactions.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to reject all ${pendingTransactions.length} pending requests?`,
      )
    )
      return;

    setIsBatchLoading(true);
    try {
      const ids = pendingTransactions.map((t) => t.id);
      await batchUpdateTransactionStatus(ids, "rejected", passcode);
      await onRefreshData();
      showToast(`All ${ids.length} requests rejected.`);
    } catch (err: any) {
      alert(`Batch error: ${err.message}`);
    } finally {
      setIsBatchLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError(null);
    if (!newMemberName.trim()) {
      setMemberError("Member name cannot be empty");
      return;
    }

    setIsAddingMember(true);
    try {
      await addUser(newMemberName.trim());
      await onRefreshData();
      setNewMemberName("");
      showToast(`Added "${newMemberName.trim()}" to group roster.`);
    } catch (err: any) {
      setMemberError(err.message || "Failed to add member");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleDeleteMember = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Remove "${userName}" from the bunker group? All associated transactions will also be purged.`,
      )
    ) {
      return;
    }

    try {
      await deleteUser(userId);
      await onRefreshData();
      showToast(`Removed "${userName}" from group.`);
    } catch (err: any) {
      alert(`Error deleting member: ${err.message}`);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

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
    <div className="space-y-6">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl animate-in slide-in-from-bottom-5 font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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
          onClick={() => setActiveTab("pending")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition relative cursor-pointer ${
            activeTab === "pending"
              ? "bg-zinc-800 text-zinc-100 shadow border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Pending Queue</span>
          {pendingTransactions.length > 0 && (
            <span className="flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-black rounded-full bg-amber-500 text-zinc-950">
              {pendingTransactions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "history"
              ? "bg-zinc-800 text-zinc-100 shadow border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Audit Log ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "members"
              ? "bg-zinc-800 text-zinc-100 shadow border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Roster ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING QUEUE */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {/* Header with Batch Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div>
              <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <span>Incoming Point Requests</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-mono">
                  {pendingTransactions.length} awaiting action
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                Approving will immediately calculate and update the live
                leaderboard.
              </p>
            </div>

            {pendingTransactions.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBatchApproveAll}
                  disabled={isBatchLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve All ({pendingTransactions.length})</span>
                </button>
                <button
                  onClick={handleBatchRejectAll}
                  disabled={isBatchLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-300 disabled:opacity-50 text-zinc-400 text-xs font-bold transition border border-zinc-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject All</span>
                </button>
              </div>
            )}
          </div>

          {/* Pending List */}
          {pendingTransactions.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 text-zinc-500 space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500/40" />
              <p className="text-sm font-bold text-zinc-300">
                Pending queue is empty!
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                All submitted point requests have been reviewed and processed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTransactions.map((tx) => {
                const isPos = tx.points >= 0;
                const isLoading = actionLoadingId === tx.id;

                return (
                  <div
                    key={tx.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition gap-4 shadow-md"
                  >
                    {/* Left: Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-300 border border-zinc-700">
                          {(tx.recipient_name || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-extrabold text-zinc-100">
                          {tx.recipient_name}
                        </span>

                        <div
                          className={`flex items-center gap-1 text-xs font-black font-mono px-2 py-0.5 rounded-md border ${
                            isPos
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {isPos ? (
                            <Plus className="w-3 h-3" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                          <span>{Math.abs(tx.points)} pts</span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed pl-9">
                        {tx.reason}
                      </p>

                      <p className="text-xs text-zinc-400 leading-relaxed pl-9">
                        | {tx.sender}
                      </p>

                      <div className="flex items-center space-x-2 text-[11px] text-zinc-500 pl-9">
                        <Clock className="w-3 h-3" />
                        <span>Submitted {formatDate(tx.created_at)}</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleApprove(tx.id)}
                        disabled={isLoading || isBatchLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleReject(tx.id)}
                        disabled={isLoading || isBatchLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-rose-950/70 hover:text-rose-300 hover:border-rose-700/50 disabled:opacity-50 text-zinc-300 text-xs font-bold transition border border-zinc-700 cursor-pointer active:scale-95"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUDIT LOG & HISTORY */}
      {activeTab === "history" && (
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
              const isPos = tx.points >= 0;
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
                      {isPos ? `+${tx.points}` : tx.points}
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
                        onClick={() => handleApprove(tx.id)}
                        title="Set status to Approved"
                        className="p-1 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    {tx.status !== "rejected" && (
                      <button
                        onClick={() => handleReject(tx.id)}
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
      )}

      {/* TAB 3: GROUP ROSTER / MEMBERS */}
      {activeTab === "members" && (
        <div className="space-y-6">
          {/* Add member form */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Enroll New Bunker Group Member</span>
            </h2>

            <form
              onSubmit={handleAddMember}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Participant Name (e.g. John)"
                className="flex-1 px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isAddingMember}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shrink-0 cursor-pointer"
              >
                {isAddingMember ? "Adding..." : "Add Member"}
              </button>
            </form>

            {memberError && (
              <p className="text-xs text-rose-400 mt-2 font-medium">
                {memberError}
              </p>
            )}
          </div>

          {/* Member List Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Active Participants ({users.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 border border-zinc-700">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-zinc-200">
                      {user.name}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteMember(user.id, user.name)}
                    title="Remove member"
                    className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
