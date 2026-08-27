import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLogin } from "../components/Admin/AdminLogin";
import { AdminDashboard } from "../components/Admin/AdminDashboard";
import { useAppData } from "../hooks/useAppData";

export function AdminPage() {
  const navigate = useNavigate();
  const { users, transactions, reload } = useAppData();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin-auth", { method: "GET", credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setIsAdmin(Boolean(d.authenticated));
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
      transactions={transactions}
      onRefreshData={() => reload(true)}
      onLogout={handleLogout}
      onReturnToLeaderboard={() => navigate("/")}
    />
  );
}
