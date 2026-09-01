import React, { useEffect, useState } from "react";
import { X, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { User } from "../types";
import { submitPointRequest } from "../services/api";
import { useEscapeKey } from "@/hooks/useEscapeKey";

interface SubmitPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  defaultRecipientId?: string;
  onSuccess: () => void;
}

export const SubmitPointModal: React.FC<SubmitPointModalProps> = ({
  isOpen,
  onClose,
  users,
  defaultRecipientId,
  onSuccess,
}) => {
  const [recipientId, setRecipientId] = useState<string>("");
  const [sender, setSender] = useState<string>("");
  const [points, setPoints] = useState<number | string>(100);
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEscapeKey(onClose);

  useEffect(() => {
    if (defaultRecipientId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecipientId(defaultRecipientId);
    }
  }, [defaultRecipientId]);

  const resetForm = () => {
    setRecipientId("");
    setSender("");
    setPoints(100);
    setReason("");
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const quickPresets = [
    { label: "+50 Minor Praise", value: 50, type: "pos" },
    { label: "+100 Good Deed", value: 100, type: "pos" },
    { label: "+250 High Honor", value: 250, type: "pos" },
    { label: "+500 Bunker Hero", value: 500, type: "pos" },
    { label: "-50 Minor Infraction", value: -50, type: "neg" },
    { label: "-100 Violation", value: -100, type: "neg" },
    { label: "-250 Serious Misconduct", value: -250, type: "neg" },
    { label: "-500 Sabotage", value: -500, type: "neg" },
  ];

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numericPoints = Number(points);
    if (!recipientId) {
      setErrorMsg("Please select a recipient group member.");
      return;
    }
    if (
      isNaN(numericPoints) ||
      numericPoints === 0 ||
      !Number.isInteger(numericPoints)
    ) {
      setErrorMsg(
        "Points must be a non-zero integer (positive for reward, negative for penalty).",
      );
      return;
    }
    if (!reason.trim()) {
      setErrorMsg(
        "A specific reason is mandatory for administrative auditing.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await submitPointRequest({
        recipient_id: recipientId,
        sender: sender.trim(),
        points: numericPoints,
        reason: reason.trim(),
      });

      setSuccessMsg(
        "Point request successfully queued! It is now pending administrator review.",
      );
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 3000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Internal server error";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const numericPoints = Number(points) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/60 rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Submit Social Credit Request
              </h2>
              <p className="text-xs text-zinc-400">
                Public submission for administrator evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Recipient Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Group Member Recipient
            </label>
            <Combobox
              items={users}
              itemToStringLabel={(u: User) => u?.name ?? ""}
              value={users.find((u) => u.id === recipientId) ?? null}
              onValueChange={(u: User | null) => setRecipientId(u?.id ?? "")}
            >
              <ComboboxInput
                placeholder="Select a member"
                className="border-zinc-700/80 bg-zinc-950 rounded-xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500
        [&_input]:bg-zinc-950! [&_input]:text-zinc-100! [&_input]:text-sm! [&_input]:placeholder:text-zinc-600!
        [&_button]:text-zinc-400! [&_button:hover]:text-zinc-100! [&_button:hover]:bg-zinc-800!"
              />
              <ComboboxContent className="bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl">
                <ComboboxEmpty className="text-zinc-500 text-sm">
                  No members found.
                </ComboboxEmpty>
                <ComboboxList>
                  {(u: User) => (
                    <ComboboxItem
                      key={u.id}
                      value={u}
                      className="text-zinc-100 text-sm rounded-lg data-highlighted:bg-emerald-500/15 data-highlighted:text-emerald-300"
                    >
                      {u.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          {/* Sender Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Sender
            </label>
            <textarea
              rows={1}
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Optional sender name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none placeholder:text-zinc-600"
            />
          </div>

          {/* Points Input & Type Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Point Adjustment
              </label>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                  numericPoints > 0
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : numericPoints < 0
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {quickPresets.find((preset) => preset.value === points)
                  ?.label ??
                  (numericPoints > 0
                    ? `+${numericPoints} Reward`
                    : numericPoints < 0
                      ? `${numericPoints} Penalty`
                      : "0 Points")}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="e.g. 100 or -150"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-zinc-100 font-mono text-base font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {quickPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setPoints(preset.value)}
                  className={`px-2 py-1 text-[11px] font-semibold font-mono rounded-lg border transition text-center cursor-pointer ${
                    numericPoints === preset.value
                      ? preset.type === "pos"
                        ? "bg-emerald-500 text-zinc-950 border-emerald-400 font-bold"
                        : "bg-rose-500 text-zinc-100 border-rose-400 font-bold"
                      : preset.type === "pos"
                        ? "bg-zinc-950 hover:bg-emerald-950/40 text-emerald-300 border-zinc-800 hover:border-emerald-800/50"
                        : "bg-zinc-950 hover:bg-rose-950/40 text-rose-300 border-zinc-800 hover:border-rose-800/50"
                  }`}
                >
                  {preset.value > 0 ? `+${preset.value}` : preset.value}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Mandatory Justification / Reason
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detailed explanation of the action, deed, or incident..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none placeholder:text-zinc-600"
            />
          </div>

          {/* Alerts & Messages */}
          {errorMsg && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800 text-[11px] text-zinc-400">
            🛡️{" "}
            <span className="font-semibold text-zinc-300">
              Admin Approval Protection:
            </span>{" "}
            All submitted points remain in a{" "}
            <span className="text-amber-300 font-mono font-semibold">
              pending
            </span>{" "}
            status until validated by an administrator.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !!successMsg}
              className="flex items-center space-x-2 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-950/50 transition active:scale-95 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Submitting to Queue...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
