"use client";
import { motion } from "framer-motion";
import { fallbackAlerts } from "@/lib/data";
import { useLiveData } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { formatNumber, cn } from "@/lib/utils";
import {
  Trophy, TrendingUp, Users, Activity, Brain,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Lightbulb, Zap,
  Shield, BarChart3, Globe, ChevronRight, Video, Newspaper
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import SourceBadge from "@/components/ui/SourceBadge";

const iconMap: Record<string, React.ElementType> = {
  "championship-leader": Trophy,
  "constructor-leader": Shield,
  "youtube-reach": Video,
  "news-volume": Newspaper,
  "sentiment": Brain,
  "season-progress": Activity,
};

const colorMap: Record<string, string> = {
  "championship-leader": "#10b981",
  "constructor-leader": "#0ea5e9",
  "youtube-reach": "#ef4444",
  "news-volume": "#a855f7",
  "sentiment": "#f59e0b",
  "season-progress": "#06b6d4",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
};

const insightIcons: Record<string, React.ElementType> = {
  opportunity: Lightbulb,
  anomaly: Zap,
  risk: AlertTriangle,
  growth: TrendingUp,
  prediction: BarChart3,
};
const insightColors: Record<string, string> = {
  opportunity: "text-sky-400",
  anomaly: "text-amber-400",
  risk: "text-red-400",
  growth: "text-emerald-400",
  prediction: "text-purple-400",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="glass-panel p-3 text-xs min-w-[160px]">
      <p className="text-zinc-400 mb-2 font-medium">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-4 py-0.5">
          <span className="text-zinc-400">{p.name}</span>
          <span className="font-data text-white">{p.value}pts</span>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface KPIData { id: string; label: string; value: any; prefix?: string; suffix?: string; source: { name: string; dataType: string; updatedAt: string } }
interface CommercialData { profiles: Array<{ constructorName: string; commercialScore: number; championshipPoints: number; youtubeSubscribers: number; newsMentions: number; sentimentScore: number; standingsPosition: number }>; pointsProgression: Array<Record<string, string | number>> }

export default function CommandCenter() {
  const { selectedTeam } = useAppStore();

  // All real data
  const { data: kpis } = useLiveData<KPIData[]>("/kpis", []);
  const { data: commercial } = useLiveData<CommercialData>("/commercial", { profiles: [], pointsProgression: [] });
  const { data: standingsData } = useLiveData<{ drivers: any[], constructors: any[] }>("/standings", { drivers: [], constructors: [] });
  const { data: liveAlerts } = useLiveData("/alerts", fallbackAlerts);
  const aiInsights = Array.isArray(liveAlerts) && liveAlerts.length > 0 ? liveAlerts : fallbackAlerts;

  const profiles = selectedTeam === "All Teams"
    ? commercial.profiles
    : commercial.profiles.filter((p) => p.constructorName.toLowerCase().includes(selectedTeam.toLowerCase()) || selectedTeam.toLowerCase().includes(p.constructorName.toLowerCase()));

  // Top 4 constructors for points progression chart colors
  const chartColors = ["#0ea5e9", "#ef4444", "#f59e0b", "#10b981", "#a855f7", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#14b8a6"];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Real KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const Icon = iconMap[kpi.id] || Activity;
          const color = colorMap[kpi.id] || "#0ea5e9";
          return (
            <motion.div key={kpi.id} variants={item} className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">{kpi.label}</span>
                </div>
              </div>
              <div className="font-data text-xl font-bold text-white mb-1">
                {kpi.prefix}{typeof kpi.value === "number" ? formatNumber(kpi.value) : kpi.value}{kpi.suffix}
              </div>
              <SourceBadge
                source={kpi.source?.name || "API"}
                dataType={(kpi.source?.dataType as "LIVE DATA" | "CALCULATED") || "LIVE DATA"}
                updatedAt={kpi.source?.updatedAt}
                compact
              />
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Points Progression — REAL race-by-race data */}
        <motion.div variants={item} className="lg:col-span-2 chart-container">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Championship Points Progression</h3>
            <SourceBadge source="Jolpica F1 API" dataType="LIVE DATA" updatedAt={new Date().toISOString()} compact />
          </div>
          <p className="text-[10px] text-zinc-500 mb-3">Real race-by-race cumulative points from {commercial.pointsProgression.length} completed races</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={commercial.pointsProgression}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="race" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {profiles.slice(0, 5).map((p, idx) => (
                <Area key={p.constructorName} type="monotone" dataKey={p.constructorName} stroke={chartColors[idx]} fill={chartColors[idx]} fillOpacity={0.08} strokeWidth={2} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Strategic Alerts */}
        <motion.div variants={item} className="chart-container flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">Strategic Alerts</h3>
            <SourceBadge source="Gemini 2.5 Pro" dataType="AI SUMMARY" compact />
          </div>
          <p className="text-[10px] text-zinc-500 mb-3">AI interpretation of real standings data — no fabricated numbers</p>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px]">
            {aiInsights.map((insight) => {
              const Icon = insightIcons[insight.type] || AlertTriangle;
              return (
                <div key={insight.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5", insightColors[insight.type])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white mb-1 group-hover:text-[#0ea5e9] transition-colors">{insight.title}</p>
                      <p className="text-[11px] text-zinc-500 line-clamp-2">{insight.summary}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn("badge", {
                          "badge-danger": insight.severity === "high",
                          "badge-warning": insight.severity === "medium",
                          "badge-success": insight.severity === "low",
                        })}>{insight.severity}</span>
                        <span className="text-[9px] text-zinc-600">{insight.timestamp}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Real Standings Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={item} className="chart-container">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Driver Championship</h3>
            <SourceBadge source="Jolpica F1 API" dataType="LIVE DATA" compact />
          </div>
          <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {standingsData.drivers.slice(0, 10).map((d: any, idx: number) => (
              <div key={d.driverId} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <span className={cn("position-badge", idx === 0 ? "p1" : idx === 1 ? "p2" : idx === 2 ? "p3" : "bg-white/[0.06] text-zinc-400")}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{d.givenName} {d.familyName}</p>
                    <p className="text-[10px] text-zinc-500">{d.constructorName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-data text-sm font-bold text-white">{d.points}</p>
                  <p className="text-[9px] text-zinc-500">pts</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="chart-container">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Constructor Championship</h3>
            <SourceBadge source="Jolpica F1 API" dataType="LIVE DATA" compact />
          </div>
          <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {standingsData.constructors.map((c: any, idx: number) => (
              <div key={c.constructorId} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <span className={cn("position-badge", idx === 0 ? "p1" : idx === 1 ? "p2" : idx === 2 ? "p3" : "bg-white/[0.06] text-zinc-400")}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{c.constructorName}</p>
                    <p className="text-[10px] text-zinc-500">{c.wins} wins</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-data text-sm font-bold text-white">{c.points}</p>
                  <p className="text-[9px] text-zinc-500">pts</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
