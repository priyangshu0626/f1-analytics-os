"use client";
import { useAppStore } from "@/lib/store";
import { useLiveData } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import CommandPalette from "@/components/layout/CommandPalette";

// Dynamic imports for code splitting
const CommandCenter = dynamic(() => import("@/components/modules/CommandCenter"), { loading: () => <ModuleLoader /> });
const CommercialModule = dynamic(() => import("@/components/modules/CommercialModule"), { loading: () => <ModuleLoader /> });
const FanModule = dynamic(() => import("@/components/modules/FanModule"), { loading: () => <ModuleLoader /> });
const MarketModule = dynamic(() => import("@/components/modules/MarketModule"), { loading: () => <ModuleLoader /> });
const SimulatorModule = dynamic(() => import("@/components/modules/SimulatorModule"), { loading: () => <ModuleLoader /> });
const CopilotModule = dynamic(() => import("@/components/modules/CopilotModule"), { loading: () => <ModuleLoader /> });

// Static fallback ticker headlines (replaced by live data when available)
const FALLBACK_TICKER = [
  "🏎️ LIVE DATA LOADING — Connecting to F1 Analytics Pipeline",
  "📊 Fetching real-time 2026 championship standings...",
  "📰 Loading latest F1 news headlines...",
];

function ModuleLoader() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl shimmer" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-80 rounded-2xl shimmer" />
        <div className="h-80 rounded-2xl shimmer" />
      </div>
    </div>
  );
}

const modules: Record<string, React.ComponentType> = {
  "command-center": CommandCenter,
  commercial: CommercialModule,
  fans: FanModule,
  markets: MarketModule,
  simulator: SimulatorModule,
  copilot: CopilotModule,
};

interface NewsItem {
  title: string;
}

export default function HomePage() {
  const { activeModule, sidebarOpen } = useAppStore();
  const ActiveModule = modules[activeModule] || CommandCenter;

  // Fetch live news for ticker
  const { data: newsItems } = useLiveData<NewsItem[]>("/news", []);
  const tickerItems = newsItems.length > 0
    ? newsItems.map((n) => `📰 ${n.title}`)
    : FALLBACK_TICKER;
  // Duplicate for seamless scroll
  const tickerDisplay = [...tickerItems, ...tickerItems];

  return (
    <div className="h-screen flex overflow-hidden bg-[#09090b]">
      {/* Ambient Background Glow */}
      <div className="ambient-glow" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col min-w-0 relative"
      >
        <Topbar />

        {/* Live Race Ticker — now powered by real news API */}
        <div className="h-8 border-b border-white/[0.04] bg-[#0c0c0f] flex items-center overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0c0c0f] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0c0c0f] to-transparent z-10" />
          <div className="ticker-scroll whitespace-nowrap">
            {tickerDisplay.map((item, i) => (
              <span key={i} className="inline-block px-8 text-[11px] text-zinc-500 font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Module Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <ActiveModule />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
