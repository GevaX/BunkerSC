import React from "react";
import type { Program } from "../../types";

interface ProgramBadgeProps {
  program?: Program | string;
  size?: "sm" | "md";
  className?: string;
}

export const ProgramBadge: React.FC<ProgramBadgeProps> = ({
  program,
  size = "sm",
  className = "",
}) => {
  if (!program) return null;

  const sizeClasses =
    size === "sm"
      ? "text-[10px] px-1.5 py-0.5 rounded-md"
      : "text-xs px-2 py-0.5 rounded-lg";

  return (
    <span
      className={`inline-flex items-center font-mono font-bold tracking-wider uppercase border shrink-0 transition-colors ${sizeClasses} ${
        program === "FLL"
          ? "bg-red-500/15 text-red-400 border-red-500/30"
          : "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
      } ${className}`}
    >
      {program}
    </span>
  );
};
