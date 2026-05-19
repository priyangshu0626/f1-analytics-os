"use client";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BarChart3, Users, Globe, Zap,
  MessageSquare, Settings, ChevronLeft, ChevronRight,
  Activity
} from "lucide-react";

const navItems = [
  { id: "command-center", label: "Command Center", icon: LayoutDashboard },
  { id: "commercial", label: "Commercial Intel", icon: BarChart3 },
  { id: "fans", label: "Fan Intelligence", icon: Users },
  { id: "markets", label: "Market Intel", icon: Globe },
  { id: "simulator", label: "Race Simulator", icon: Zap },
  { id: "copilot", label: "AI Copilot", icon: MessageSquare },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, activeModule, setActiveModule } = useAppStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-white/[0.06] bg-[#0c0c0f]"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#e10600] to-[#ff6b35] flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-sm font-bold text-white tracking-tight">F1 Analytics</span>
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Operating System</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={cn(
                "sidebar-link w-full group",
                isActive && "active"
              )}
            >
              <Icon className={cn(
                "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                isActive ? "text-[#0ea5e9]" : "text-zinc-500 group-hover:text-zinc-300"
              )} />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && sidebarOpen && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#0ea5e9]"
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-white/[0.06] space-y-1">
        <button
          onClick={() => setActiveModule("settings")}
          className="sidebar-link w-full group"
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0 text-zinc-500 group-hover:text-zinc-300" />
          {sidebarOpen && <span>Settings</span>}
        </button>
        <button
          onClick={toggleSidebar}
          className="sidebar-link w-full group justify-center"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
