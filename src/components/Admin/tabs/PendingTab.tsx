import React from "react";
import { Check, X, Clock, Plus, Minus, CheckCircle2 } from "lucide-react";
import type { Transaction } from "../../../types";
import { formatDate } from "../../../services/utils";

interface PendingQueueTabProps {
  pendingTransactions: Transaction[];
  actionLoadingId: string | null;
  isBatchLoading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onBatchApproveAll: () => void;
  onBatchRejectAll: () => void;
}

export const PendingQueueTab: React.FC<PendingQueueTabProps> = ({
  pendingTransactions,
  actionLoadingId,
  isBatchLoading,
  onApprove,
  onReject,
  onBatchApproveAll,
  onBatchRejectAll,
}) => {
  return (
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
              onClick={onBatchApproveAll}
              disabled={isBatchLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve All ({pendingTransactions.length})</span>
            </button>
            <button
              onClick={onBatchRejectAll}
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
                    onClick={() => onApprove(tx.id)}
                    disabled={isLoading || isBatchLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => onReject(tx.id)}
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
  );
};
