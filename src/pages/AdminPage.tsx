import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLogin } from "../components/Admin/AdminLogin";
import { AdminDashboard } from "../components/Admin/AdminDashboard";
import { useAppData } from "../hooks/useAppData";
import { fetchAdminTransactions } from "../services/api";
import type { Transaction } from "../types";

export function AdminPage() {
  const navigate = useNavigate();
  const { users, transactions, reload } = useAppData();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminTransactions, setAdminTransactions] = useState<
    Transaction[] | null
  >(null);

  const reloadAdminTransactions = async () => {
    setAdminTransactions(await fetchAdminTransactions());
  };

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;
    void fetchAdminTransactions().then((data) => {
      if (!cancelled) setAdminTransactions(data);
    });

    return () => {
      cancelled = true;
    };
  }, [isAdmin, transactions]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin-auth", { method: "GET", credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;

        const authenticated = Boolean(d.authenticated);
        setIsAdmin(authenticated);
        if (authenticated) void reloadAdminTransactions();
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAuthSuccess = () => {
    setIsAdmin(true);
    void reloadAdminTransactions();
  };

  const handleLogout = () => {
    fetch("/api/admin-auth", {
      method: "DELETE",
      credentials: "include",
    }).finally(() => {
      setIsAdmin(false);
      navigate("/");
    });
  };

  if (isAdmin === null) {
    return null;
  }

  if (!isAdmin) {
    return (
      <AdminLogin
        onSuccess={handleAuthSuccess}
        onCancel={() => navigate("/")}
      />
    );
  }

  return (
    <AdminDashboard
      users={users}
      transactions={adminTransactions ?? transactions}
      onRefreshData={async () => {
        await reload(true);
        await reloadAdminTransactions();
      }}
      onLogout={handleLogout}
      onReturnToLeaderboard={() => navigate("/")}
    />
  );
}
