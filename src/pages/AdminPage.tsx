import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLogin } from "../components/Admin/AdminLogin";
import { AdminDashboard } from "../components/Admin/AdminDashboard";
import { useAppData } from "../hooks/useAppData";

export function AdminPage() {
  const navigate = useNavigate();
  const { users, transactions, reload } = useAppData();
  const [adminPasscode, setAdminPasscode] = useState<string | null>(() =>
    sessionStorage.getItem("bunkersc_admin_auth"),
  );

  const handleAuthSuccess = (passcode: string) => {
    sessionStorage.setItem("bunkersc_admin_auth", passcode);
    setAdminPasscode(passcode);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("bunkersc_admin_auth");
    setAdminPasscode(null);
    navigate("/");
  };

  if (!adminPasscode) {
    return (
      <AdminLogin
        onSuccess={handleAuthSuccess}
        onCancel={() => navigate("/")}
      />
    );
  }

  return (
    <AdminDashboard
      passcode={adminPasscode}
      users={users}
      transactions={transactions}
      onRefreshData={() => reload(true)}
      onLogout={handleLogout}
      onReturnToLeaderboard={() => navigate("/")}
    />
  );
}
