"use client";
import { motion } from "framer-motion";
import { useLiveData } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { formatNumber, cn } from "@/lib/utils";
import {
  BarChart3, TrendingUp, Video, Newspaper,
  Brain, ArrowUpRight, Download
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import CountUp from "react-countup";
import SourceBadge from "@/components/ui/SourceBadge";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

interface CommercialProfile {
  constructorName: string; constructorId: string;
  standingsPosition: number; championshipPoints: number; wins: number;
  youtubeSubscribers: number; youtubeViews: number; youtubeVideos: number;
  newsMentions: number; sentimentScore: number;
  commercialScore: number; standingsScore: number; youtubeScore: number; newsScore: number;
}

export default function CommercialModule() {
  const { selectedTeam } = useAppStore();
  const { data: commercial } = useLiveData<{ profiles: CommercialProfile[]; pointsProgression: Array<Record<string, string | number>> }>(
    "/commercial", { profiles: [], pointsProgression: [] }
  );

  const profiles = selectedTeam === "All Teams"
    ? commercial.profiles
    : commercial.profiles.filter((p) => p.constructorName.toLowerCase().includes(selectedTeam.toLowerCase()) || selectedTeam.toLowerCase().includes(p.constructorName.toLowerCase()));

  const sorted = [...profiles].sort((a, b) => b.commercialScore - a.commercialScore);
  const topProfile = sorted[0];

  // Radar data for top 3 teams
  const radarData = sorted.slice(0, 3).length > 0 ? [
    { subject: "Standings", ...Object.fromEntries(sorted.slice(0, 3).map((p) => [p.constructorName, p.standingsScore])) },
    { subject: "YouTube", ...Object.fromEntries(sorted.slice(0, 3).map((p) => [p.constructorName, p.youtubeScore])) },
    { subject: "News", ...Object.fromEntries(sorted.slice(0, 3).map((p) => [p.constructorName, p.newsScore])) },
    { subject: "Sentiment", ...Object.fromEntries(sorted.slice(0, 3).map((p) => [p.constructorName, p.sentimentScore])) },
  ] : [];

  const radarColors = ["#0ea5e9", "#ef4444", "#10b981"];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header KPIs — all from real data */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Top Commercial Score", value: topProfile?.commercialScore || 0, suffix: "/100", icon: BarChart3, color: "#10b981", source: "CALCULATED" },
          { label: "Total YT Subscribers", value: profiles.reduce((a, p) => a + p.youtubeSubscribers, 0), icon: Video, color: "#ef4444", source: "YouTube API" },
          { label: "Total News Mentions", value: profiles.reduce((a, p) => a + p.newsMentions, 0), icon: Newspaper, color: "#a855f7", source: "GNews + NewsData" },
          { label: "Avg Sentiment", value: profiles.length ? Math.round(profiles.reduce((a, p) => a + p.sentimentScore, 0) / profiles.length) : 0, suffix: "/100", icon: Brain, color: "#f59e0b", source: "HuggingFace" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} variants={item} className="metric-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                <span className="text-xs text-zinc-500 font-medium">{kpi.label}</span>
              </div>
              <div className="font-data text-2xl font-bold text-white">
                <CountUp end={kpi.value} duration={1.5} separator="," />{kpi.suffix}
              </div>
              <div className="mt-2">
                <SourceBadge source={kpi.source} dataType={kpi.source === "CALCULATED" ? "CALCULATED" : "LIVE DATA"} compact />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Constructor Commercial Rankings — REAL DATA */}
      <motion.div variants={item} className="chart-container overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-white">Constructor Commercial Score Rankings</h3>
          <SourceBadge source="Jolpica + YouTube + GNews + HuggingFace" dataType="CALCULATED" compact />
        </div>
        <p className="text-[10px] text-zinc-500 mb-4">Formula: CCS = (standings_score + youtube_score + news_score + sentiment_score) / 4</p>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Constructor</th>
                <th>Standings</th>
                <th>Points</th>
                <th>YT Subs</th>
                <th>News</th>
                <th>Sentiment</th>
                <th>CCS</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, idx) => (
                <tr key={p.constructorId}>
                  <td><span className={cn("position-badge", idx === 0 ? "p1" : idx === 1 ? "p2" : idx === 2 ? "p3" : "bg-white/[0.06] text-zinc-400")}>{idx + 1}</span></td>
                  <td><span className="text-white font-medium text-sm">{p.constructorName}</span></td>
                  <td className="font-data text-zinc-300">P{p.standingsPosition}</td>
                  <td className="font-data text-white">{p.championshipPoints}</td>
                  <td className="font-data text-zinc-300">{p.youtubeSubscribers > 0 ? formatNumber(p.youtubeSubscribers) : <span className="text-zinc-600">No data</span>}</td>
                  <td className="font-data text-zinc-300">{p.newsMentions}</td>
                  <td>
                    <span className={cn("font-data font-semibold", p.sentimentScore > 60 ? "text-emerald-400" : p.sentimentScore > 40 ? "text-amber-400" : "text-red-400")}>
                      {p.sentimentScore}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#a855f7]" style={{ width: `${p.commercialScore}%` }} />
                      </div>
                      <span className="font-data text-xs font-bold text-white">{p.commercialScore}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* YouTube Subscribers Bar Chart */}
        <motion.div variants={item} className="chart-container">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">YouTube Subscribers by Team</h3>
            <SourceBadge source="YouTube Data API v3" dataType="LIVE DATA" compact />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sorted.filter((p) => p.youtubeSubscribers > 0)} layout="vertical" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
              <YAxis dataKey="constructorName" type="category" tick={{ fill: "#a1a1aa", fontSize: 11 }} width={100} axisLine={false} tickLine={false} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                return (
                  <div className="glass-panel p-3 text-xs">
                    <p className="font-semibold text-white mb-1">{payload[0].payload.constructorName}</p>
                    <p className="text-zinc-400">Subscribers: <span className="text-white font-data">{formatNumber(payload[0].payload.youtubeSubscribers)}</span></p>
                    <p className="text-zinc-400">Views: <span className="text-white font-data">{formatNumber(payload[0].payload.youtubeViews)}</span></p>
                    <p className="text-[9px] text-zinc-600 mt-1">Source: YouTube Data API</p>
                  </div>
                );
              }} />
              <Bar dataKey="youtubeSubscribers" radius={[0, 6, 6, 0]} barSize={14} fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart — real component scores */}
        <motion.div variants={item} className="chart-container">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Commercial Score Breakdown</h3>
            <SourceBadge source="Multi-API" dataType="CALCULATED" compact />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
              {sorted.slice(0, 3).map((p, i) => (
                <Radar key={p.constructorName} name={p.constructorName} dataKey={p.constructorName} stroke={radarColors[i]} fill={radarColors[i]} fillOpacity={0.1} strokeWidth={2} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {sorted.slice(0, 3).map((p, i) => (
              <span key={p.constructorName} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: radarColors[i] }} />{p.constructorName}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
