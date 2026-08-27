import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AppDataProvider } from "./hooks/AppDataProvider";
import { useAppData } from "./hooks/useAppData";
import { Navbar } from "./components/Navbar";
import { SubmitPointModal } from "./components/SubmitPointModal";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ActivityPage } from "./pages/ActivityPage";
import { AdminPage } from "./pages/AdminPage";
import { Lock, RefreshCw } from "lucide-react";

function Layout() {
  const {
    users,
    reload,
    isLoading,
    isSubmitOpen,
    openSubmitModal,
    closeSubmitModal,
    selectedMemberId,
  } = useAppData();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar onOpenSubmitModal={() => openSubmitModal()} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3 text-zinc-500">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-sm font-semibold">Loading...</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<LeaderboardPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>

      <footer className="border-t border-zinc-800/80 bg-zinc-950/80 mt-12 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-zinc-300">BunkerSC</span>
            <span>— Bunker Social Credit App, "For a Better Society"</span>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="text-zinc-400 hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>Admin Portal</span>
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <p>
            This code for this project is open-source and available on GitHub.{" "}
            <a
              href="https://github.com/GevaX/BunkerSC"
              className="text-zinc-400 hover:text-emerald-400 transition"
            >
              View it here.
            </a>
          </p>
        </div>
      </footer>

      <SubmitPointModal
        isOpen={isSubmitOpen}
        onClose={() => closeSubmitModal()}
        users={users}
        defaultRecipientId={selectedMemberId}
        onSuccess={() => reload(true)}
      />
    </div>
  );
}

export function App() {
  return (
    <AppDataProvider>
      <Layout />
    </AppDataProvider>
  );
}

export default App;
