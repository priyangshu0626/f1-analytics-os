"use client";
import { useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Target, Users, ShoppingBag, Zap, MessageSquare, Search, Settings } from "lucide-react";

const commands = [
  { id: "command-center", label: "Executive Command Center", icon: LayoutDashboard, group: "Modules" },
  { id: "sponsorship", label: "Sponsorship ROI Intelligence", icon: Target, group: "Modules" },
  { id: "fans", label: "Fan Intelligence & Social Analytics", icon: Users, group: "Modules" },
  { id: "merchandise", label: "Merchandise & Revenue Intelligence", icon: ShoppingBag, group: "Modules" },
  { id: "simulator", label: "Race Weekend Simulator", icon: Zap, group: "Modules" },
  { id: "copilot", label: "AI Strategy Copilot", icon: MessageSquare, group: "Modules" },
  { id: "settings", label: "Settings", icon: Settings, group: "System" },
];

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveModule } = useAppStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Command Palette Trigger
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape") setCommandPaletteOpen(false);

      // Global Navigation Shortcuts (Alt + 1-6)
      if (e.altKey) {
        switch (e.key) {
          case "1": e.preventDefault(); setActiveModule("command-center"); break;
          case "2": e.preventDefault(); setActiveModule("sponsorship"); break;
          case "3": e.preventDefault(); setActiveModule("fans"); break;
          case "4": e.preventDefault(); setActiveModule("merchandise"); break;
          case "5": e.preventDefault(); setActiveModule("simulator"); break;
          case "6": e.preventDefault(); setActiveModule("copilot"); break;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandPaletteOpen, setCommandPaletteOpen, setActiveModule]);

  const selectCommand = useCallback((id: string) => {
    setActiveModule(id);
    setCommandPaletteOpen(false);
  }, [setActiveModule, setCommandPaletteOpen]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cmd-backdrop"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101]"
          >
            <Command className="rounded-2xl border border-white/[0.08] bg-[#18181b] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 border-b border-white/[0.06]">
                <Search className="w-4 h-4 text-zinc-500" />
                <Command.Input
                  placeholder="Type a command or search..."
                  className="flex-1 h-12 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>
              <Command.List className="p-2 max-h-[300px] overflow-y-auto">
                <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                  No results found.
                </Command.Empty>
                {["Modules", "System"].map(group => (
                  <Command.Group key={group} heading={group} className="text-[10px] uppercase tracking-wider text-zinc-600 font-semibold px-2 py-1.5">
                    {commands.filter(c => c.group === group).map(cmd => {
                      const Icon = cmd.icon;
                      return (
                        <Command.Item
                          key={cmd.id}
                          value={cmd.label}
                          onSelect={() => selectCommand(cmd.id)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer transition-colors data-[selected=true]:bg-white/[0.06] data-[selected=true]:text-white"
                        >
                          <Icon className="w-4 h-4 text-zinc-500" />
                          {cmd.label}
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                ))}
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
