import React, { useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import type { User, Program } from "../../../types";
import { ProgramBadge } from "../../ui/ProgramBadge";

interface RosterTabProps {
  users: User[];
  onAddMember: (name: string, program: Program) => Promise<void>;
  onDeleteMember: (userId: string, userName: string) => void;
}

export const RosterTab: React.FC<RosterTabProps> = ({
  users,
  onAddMember,
  onDeleteMember,
}) => {
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberProgram, setNewMemberProgram] = useState<Program>("FLL");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  const fllCount = users.filter((u) => u.program === "FLL").length;
  const frcCount = users.filter((u) => u.program === "FRC").length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError(null);
    if (!newMemberName.trim()) {
      setMemberError("Member name cannot be empty");
      return;
    }

    setIsAddingMember(true);
    try {
      await onAddMember(newMemberName.trim(), newMemberProgram);
      setNewMemberName("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to add member";
      setMemberError(message);
    } finally {
      setIsAddingMember(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add member form */}
      <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>Enroll New Bunker Group Member</span>
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Participant Name (e.g. John)"
            className="flex-1 px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
          />

          <div className="flex items-center rounded-xl bg-zinc-950 p-1 border border-zinc-700 shrink-0">
            <button
              type="button"
              onClick={() => setNewMemberProgram("FLL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                newMemberProgram === "FLL"
                  ? "bg-red-950/80 text-red-300 border border-red-800/60"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              FLL
            </button>
            <button
              type="button"
              onClick={() => setNewMemberProgram("FRC")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                newMemberProgram === "FRC"
                  ? "bg-cyan-950/80 text-cyan-300 border border-cyan-800/60"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              FRC
            </button>
          </div>

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
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Active Participants ({users.length})
            </h3>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-red-400/90 font-mono font-semibold">
              FLL: {fllCount}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-cyan-400/90 font-mono font-semibold">
              FRC: {frcCount}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 border border-zinc-700 shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-sm font-bold text-zinc-200 truncate">
                    {user.name}
                  </span>
                  <ProgramBadge program={user.program} />
                </div>
              </div>

              <button
                onClick={() => onDeleteMember(user.id, user.name)}
                title="Remove member"
                className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition cursor-pointer shrink-0 ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
