import React from "react";
import logo from "../assets/logo.svg";
import { NavLink } from "react-router-dom";
import { Trophy, Activity, PlusCircle } from "lucide-react";

interface NavbarProps {
  onOpenSubmitModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSubmitModal }) => {
  const navCls = (isActive: boolean) =>
    [
      "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
      isActive
        ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60 font-semibold"
        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40",
    ].join(" ");

  const mobileNavCls = (isActive: boolean) =>
    [
      "flex items-center gap-1.5 py-1 px-2.5 rounded-lg",
      isActive ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-400",
    ].join(" ");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <NavLink
            to="/"
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <img src={logo} alt="Logo" className="h-10" />
          </NavLink>

          <nav className="hidden md:flex items-center space-x-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/70">
            <NavLink to="/" end className={({ isActive }) => navCls(isActive)}>
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </NavLink>
            <NavLink
              to="/activity"
              className={({ isActive }) => navCls(isActive)}
            >
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Activity</span>
            </NavLink>
          </nav>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onOpenSubmitModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Submit Points</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex md:hidden border-t border-zinc-800/60 bg-zinc-950/90 px-4 py-2 justify-around text-xs">
        <NavLink
          to="/"
          end
          className={({ isActive }) => mobileNavCls(isActive)}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Leaderboard</span>
        </NavLink>
        <NavLink
          to="/activity"
          className={({ isActive }) => mobileNavCls(isActive)}
        >
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span>Activity</span>
        </NavLink>
      </div>
    </header>
  );
};
