import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  activeModule: string;
  notificationsOpen: boolean;
  theme: 'dark' | 'light';
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveModule: (module: string) => void;
  setNotificationsOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  activeModule: 'command-center',
  notificationsOpen: false,
  theme: 'dark',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setActiveModule: (module) => set({ activeModule: module }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  setTheme: (theme) => set({ theme }),
  selectedTeam: 'All Teams',
  setSelectedTeam: (team) => set({ selectedTeam: team }),
}));

interface CopilotState {
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
  isStreaming: boolean;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setStreaming: (streaming: boolean) => void;
  clearMessages: () => void;
}

export const useCopilotStore = create<CopilotState>((set) => ({
  messages: [],
  isStreaming: false,
  addMessage: (role, content) =>
    set((s) => ({
      messages: [...s.messages, { role, content, timestamp: new Date() }],
    })),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  clearMessages: () => set({ messages: [] }),
}));
