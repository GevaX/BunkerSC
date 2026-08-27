/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import type { User, Transaction } from "../../types";
import {
  updateTransactionStatus,
  batchUpdateTransactionStatus,
  addUser,
  deleteUser,
} from "../../services/api";
import { AdminHeader, type AdminTab } from "./AdminHeader";
import { PendingQueueTab } from "./tabs/PendingTab";
import { AuditLogTab } from "./tabs/AuditTab";
import { RosterTab } from "./tabs/RosterTab";
import { CheckCircle2 } from "lucide-react";

interface AdminDashboardProps {
  users: User[];
  transactions: Transaction[];
  onRefreshData: () => Promise<void>;
  onLogout: () => void;
  onReturnToLeaderboard: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  transactions,
  onRefreshData,
  onLogout,
  onReturnToLeaderboard,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("pending");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingTransactions = transactions.filter(
    (t) => t.status === "pending",
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSessionExpired = () => {
    alert("Your admin session has expired. Please log in again.");
    onLogout();
  };

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      await updateTransactionStatus(id, "approved");
      await onRefreshData();
      showToast("Transaction approved and leaderboard updated!");
    } catch (err: any) {
      if (err?.status === 401) return handleSessionExpired();
      alert(`Error approving: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoadingId(id);
    try {
      await updateTransactionStatus(id, "rejected");
      await onRefreshData();
      showToast("Transaction rejected and discarded from standings.");
    } catch (err: any) {
      if (err?.status === 401) return handleSessionExpired();
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
      await batchUpdateTransactionStatus(ids, "approved");
      await onRefreshData();
      showToast(`All ${ids.length} requests approved!`);
    } catch (err: any) {
      if (err?.status === 401) return handleSessionExpired();
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
      await batchUpdateTransactionStatus(ids, "rejected");
      await onRefreshData();
      showToast(`All ${ids.length} requests rejected.`);
    } catch (err: any) {
      if (err?.status === 401) return handleSessionExpired();
      alert(`Batch error: ${err.message}`);
    } finally {
      setIsBatchLoading(false);
    }
  };

  const handleAddMember = async (name: string) => {
    try {
      await addUser(name);
      await onRefreshData();
      showToast(`Added "${name}" to group roster.`);
    } catch (err: any) {
      if (err?.status === 401) return handleSessionExpired();
      alert(`Error adding member: ${err.message}`);
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
      if (err?.status === 401) return handleSessionExpired();
      alert(`Error deleting member: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl animate-in slide-in-from-bottom-5 font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <AdminHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingTransactions.length}
        historyCount={transactions.length}
        rosterCount={users.length}
        onLogout={onLogout}
        onReturnToLeaderboard={onReturnToLeaderboard}
      />

      {activeTab === "pending" && (
        <PendingQueueTab
          pendingTransactions={pendingTransactions}
          actionLoadingId={actionLoadingId}
          isBatchLoading={isBatchLoading}
          onApprove={handleApprove}
          onReject={handleReject}
          onBatchApproveAll={handleBatchApproveAll}
          onBatchRejectAll={handleBatchRejectAll}
        />
      )}

      {activeTab === "history" && (
        <AuditLogTab
          transactions={transactions}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {activeTab === "members" && (
        <RosterTab
          users={users}
          onAddMember={handleAddMember}
          onDeleteMember={handleDeleteMember}
        />
      )}
    </div>
  );
};
