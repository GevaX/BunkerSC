import React, { useState } from "react";
import { Lock, KeyRound, ArrowRight, AlertCircle } from "lucide-react";

interface AdminLoginProps {
  onSuccess: (passcode: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!passcode.trim()) {
      setErrorMsg("Please enter the administrative passcode.");
      return;
    }

    setIsLoading(true);

    try {
      // First attempt validation via Vercel serverless function
      const response = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onSuccess(passcode.trim());
          return;
        }
      } else if (response.status === 401) {
        setErrorMsg("Invalid administrative passcode.");
        setIsLoading(false);
        return;
      }
    } catch {
      // If serverless endpoint is not reachable during local dev, verify against environment passcode
    }

    // Client fallback check for development
    const clientEnvPasscode = import.meta.env.VITE_ADMIN_PASSCODE;
    if (passcode.trim() === clientEnvPasscode) {
      onSuccess(passcode.trim());
    } else {
      setErrorMsg(
        "Invalid administrative passcode. Please verify credentials.",
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 text-zinc-100">
        {/* Security Shield Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-950/40">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100">
              Administrator Console
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Restricted access for reviewing, approving, and rejecting credit
              submissions
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Admin Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter shared passcode..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder:text-zinc-600"
                autoFocus
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Access Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-zinc-800/80 flex flex-col items-center text-center space-y-2">
          <button
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            ← Return to Public Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
