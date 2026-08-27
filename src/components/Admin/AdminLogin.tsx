import React, { useState } from "react";
import {
  Lock,
  KeyRound,
  ArrowRight,
  AlertCircle,
  EyeOff,
  Eye,
} from "lucide-react";

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [passcode, setPasscode] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
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
      const response = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ensures the Set-Cookie is stored
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
        return;
      }

      setErrorMsg(data.error || "Invalid administrative passcode.");
    } catch {
      setErrorMsg("Could not reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            <h2 className="text-xl font-bold text-zinc-100">Admin Portal</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Restricted access for reviewing, approving, and rejecting credit
              submissions and managing the system
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
                type={passwordVisible ? "text" : "password"}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter secret passcode..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder:text-zinc-600"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 transition"
              >
                {passwordVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
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
