"use client";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Search, Bell, Command, ChevronRight } from "lucide-react";

const moduleLabels: Record<string, string> = {
  "command-center": "Executive Command Center",
  sponsorship: "Sponsorship ROI Intelligence",
  fans: "Fan Intelligence & Social Analytics",
  merchandise: "Merchandise & Revenue Intelligence",
  simulator: "Race Weekend Commercial Simulator",
  copilot: "AI Strategy Copilot",
  settings: "System Settings",
};

export default function Topbar() {
  const { activeModule, setCommandPaletteOpen, setNotificationsOpen } = useAppStore();

  return (
    <header className="h-14 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">F1 Analytics OS</span>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-white font-medium">{moduleLabels[activeModule] || activeModule}</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Search / Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] transition-colors text-zinc-400 text-sm"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-zinc-500">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          onClick={() => setNotificationsOpen(true)}
          className="relative w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] transition-colors flex items-center justify-center"
        >
          <Bell className="w-4 h-4 text-zinc-400" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e10600] text-[9px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#a855f7] flex items-center justify-center text-white text-xs font-bold ml-1">
          PA
        </div>
      </div>
    </header>
  );
}
