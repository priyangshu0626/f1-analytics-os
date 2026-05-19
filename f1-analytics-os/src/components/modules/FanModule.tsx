"use client";
import { motion } from "framer-motion";
import { teamSocialData as fallbackFans, sentimentTimeline, fanGeography } from "@/lib/data";
import { useApiData } from "@/lib/api";
import { formatNumber, cn } from "@/lib/utils";
import { Users, TrendingUp, Heart, Globe, Zap, ArrowUpRight } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import CountUp from "react-countup";

const c = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const i = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

const platformData = [
  { name: "Instagram", followers: 102_400_000, color: "#E1306C", growth: 11.2 },
  { name: "TikTok", followers: 73_600_000, color: "#00f2ea", growth: 24.8 },
  { name: "X/Twitter", followers: 54_000_000, color: "#1DA1F2", growth: 5.4 },
  { name: "YouTube", followers: 32_100_000, color: "#FF0000", growth: 14.6 },
];

// Seeded pseudo-random for deterministic distribution on initial render
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const engagementTimeline = Array.from({ length: 24 }, (_, idx) => ({
  week: `W${idx + 1}`,
  instagram: 3.2 + seeded(idx * 4) * 3 + (idx > 12 ? 0.5 : 0),
  tiktok: 5.4 + seeded(idx * 4 + 1) * 4,
  twitter: 1.8 + seeded(idx * 4 + 2) * 2,
  youtube: 2.1 + seeded(idx * 4 + 3) * 2.5,
}));

const demographics = [
  { name: "18-24", value: 32, color: "#0ea5e9" },
  { name: "25-34", value: 28, color: "#a855f7" },
  { name: "35-44", value: 22, color: "#10b981" },
  { name: "45-54", value: 12, color: "#f59e0b" },
  { name: "55+", value: 6, color: "#f43f5e" },
];

export default function FanModule() {
  const teamSocialData = useApiData("/fans", fallbackFans);
  const totalFollowers = platformData.reduce((a, p) => a + p.followers, 0);

  return (
    <motion.div variants={c} initial="hidden" animate="show" className="space-y-6">
      {/* Platform KPIs */}
      <motion.div variants={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformData.map((p) => (
          <motion.div key={p.name} variants={i} className="metric-card group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500 font-medium">{p.name}</span>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />{p.growth}%
              </span>
            </div>
            <div className="font-data text-2xl font-bold text-white">
              <CountUp end={p.followers / 1_000_000} duration={1.5} decimals={1} suffix="M" />
            </div>
            <div className="mt-3 h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(p.followers / totalFollowers) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ backgroundColor: p.color }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Engagement Timeline */}
      <motion.div variants={i} className="chart-container">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Engagement Rate Timeline</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Weekly engagement rate by platform (%)</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={engagementTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="glass-panel p-3 text-xs">
                  <p className="text-zinc-400 mb-1">{label}</p>
                  {payload.map((p: { name: string; value: number; color: string; dataKey: string }) => (
                    <div key={p.dataKey} className="flex justify-between gap-4">
                      <span style={{ color: p.color }}>{p.name}</span>
                      <span className="font-data text-white">{p.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              );
            }} />
            <Line type="monotone" dataKey="instagram" name="Instagram" stroke="#E1306C" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="tiktok" name="TikTok" stroke="#00f2ea" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="twitter" name="X/Twitter" stroke="#1DA1F2" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="youtube" name="YouTube" stroke="#FF0000" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sentiment Analysis */}
        <motion.div variants={i} className="chart-container">
          <h3 className="text-sm font-semibold text-white mb-4">Sentiment Analysis</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={sentimentTimeline.slice(0, 20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="glass-panel p-3 text-xs">
                    <p className="text-zinc-400 mb-1">{label}</p>
                    {payload.map((p: { name: string; value: number; dataKey: string }) => (
                      <div key={p.dataKey} className="flex justify-between gap-4">
                        <span className="text-zinc-400">{p.name}</span>
                        <span className="font-data text-white">{p.value}%</span>
                      </div>
                    ))}
                  </div>
                );
              }} />
              <Area type="monotone" dataKey="positive" name="Positive" stroke="#10b981" fill="#10b981" fillOpacity={0.15} stackId="1" />
              <Area type="monotone" dataKey="neutral" name="Neutral" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} stackId="1" />
              <Area type="monotone" dataKey="negative" name="Negative" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} stackId="1" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Demographics */}
        <motion.div variants={i} className="chart-container">
          <h3 className="text-sm font-semibold text-white mb-4">Audience Demographics</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={demographics} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {demographics.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {demographics.map(d => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-zinc-400 w-12">{d.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                  </div>
                  <span className="font-data text-xs text-white w-10 text-right">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Team Rankings */}
      <motion.div variants={i} className="chart-container">
        <h3 className="text-sm font-semibold text-white mb-4">Team Social Ranking</h3>
        <div className="space-y-2">
          {teamSocialData.sort((a, b) => b.growth - a.growth).map((team, idx) => {
            const total = team.instagram + team.tiktok + team.twitter + team.youtube;
            return (
              <div key={team.team} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                <span className="font-data text-xs text-zinc-500 w-6">#{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{team.team}</p>
                  <p className="text-[10px] text-zinc-500">{formatNumber(total)} total followers</p>
                </div>
                <div className="text-center px-4">
                  <p className="font-data text-sm text-white">{team.engRate}%</p>
                  <p className="text-[9px] text-zinc-500">Eng. Rate</p>
                </div>
                <div className="text-center px-4">
                  <p className={cn("font-data text-sm font-semibold", team.sentiment > 75 ? "text-emerald-400" : team.sentiment > 65 ? "text-amber-400" : "text-red-400")}>
                    {team.sentiment}
                  </p>
                  <p className="text-[9px] text-zinc-500">Sentiment</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-data text-sm font-semibold text-emerald-400">{team.growth}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Geographic Distribution */}
      <motion.div variants={i} className="chart-container">
        <h3 className="text-sm font-semibold text-white mb-4">Geographic Fan Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {fanGeography.slice(0, 10).map(geo => (
            <div key={geo.country} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#0ea5e9]/30 transition-all text-center">
              <p className="text-lg font-bold font-data text-white">{formatNumber(geo.fans)}</p>
              <p className="text-xs text-zinc-400 mt-1">{geo.country}</p>
              <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400 font-semibold mt-1">
                <ArrowUpRight className="w-3 h-3" />{geo.growth}%
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
