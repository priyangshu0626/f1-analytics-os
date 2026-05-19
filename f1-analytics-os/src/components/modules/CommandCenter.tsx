"use client";
import { motion } from "framer-motion";
import { kpiMetrics as fallbackKpis, revenueTimeline, aiInsights, raceEvents, teamSocialData as fallbackFans } from "@/lib/data";
import { useApiData } from "@/lib/api";
import { formatNumber, formatCurrency, cn } from "@/lib/utils";
import {
  DollarSign, TrendingUp, Users, ShoppingBag, Activity, Brain,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Lightbulb, Zap,
  Shield, BarChart3, Globe, ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import CountUp from "react-countup";

const iconMap: Record<string, React.ElementType> = {
  DollarSign, TrendingUp, Users, ShoppingBag, Activity, Brain
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="glass-panel p-3 text-xs min-w-[160px]">
      <p className="text-zinc-400 mb-2 font-medium">{label}</p>
      {payload.map((p, i: number) => (
        <div key={i} className="flex justify-between gap-4 py-0.5">
          <span className="text-zinc-400">{p.name}</span>
          <span className="font-data text-white">${p.value}M</span>
        </div>
      ))}
    </div>
  );
}

const insightIcons: Record<string, React.ElementType> = {
  opportunity: Lightbulb,
  anomaly: AlertTriangle,
  risk: Shield,
  growth: TrendingUp,
  prediction: Zap,
};
const insightColors: Record<string, string> = {
  opportunity: "text-emerald-400",
  anomaly: "text-amber-400",
  risk: "text-red-400",
  growth: "text-blue-400",
  prediction: "text-purple-400",
};

export default function CommandCenter() {
  const kpiMetrics = useApiData("/kpis", fallbackKpis);
  const teamSocialData = useApiData("/fans", fallbackFans);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* AI Insight Banner */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-[#0ea5e9]/10 via-[#a855f7]/10 to-[#e10600]/10 p-5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9]/5 via-transparent to-[#e10600]/5 animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#a855f7] flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#0ea5e9] uppercase tracking-wider">AI Intelligence Brief</span>
              <div className="pulse-dot bg-emerald-400" />
              <span className="text-[10px] text-zinc-500">Live</span>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed">
              Portfolio revenue up <span className="text-emerald-400 font-semibold">12.4% YoY</span> at $847.2M. 
              McLaren&apos;s TikTok-driven fan growth (+22.1%) presents a <span className="text-[#0ea5e9] font-semibold">$15-20M sponsorship opportunity</span>. 
              Crypto.com ROI declining — recommend contract review before Q4. 
              Monaco GP projected to deliver <span className="text-purple-400 font-semibold">$48M commercial revenue</span>, +12% above 2025.
            </p>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiMetrics.map((kpi, idx) => {
          const Icon = iconMap[kpi.icon] || Activity;
          return (
            <motion.div
              key={kpi.id}
              variants={item}
              className="metric-card group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-semibold",
                  kpi.trend === "up" ? "text-emerald-400" : "text-red-400"
                )}>
                  {kpi.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(kpi.change)}%
                </div>
              </div>
              <div className="font-data text-2xl font-bold text-white mb-1">
                {kpi.prefix}
                <CountUp end={kpi.value} duration={2} separator="," decimals={kpi.value < 100 ? 1 : 0} delay={idx * 0.1} />
                {kpi.suffix}
              </div>
              <div className="text-[11px] text-zinc-500 font-medium">{kpi.label}</div>
              {/* Mini Sparkline */}
              <div className="mt-3 flex items-end gap-[2px] h-6">
                {kpi.sparkline.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all duration-300"
                    style={{
                      height: `${v}%`,
                      backgroundColor: kpi.color,
                      opacity: 0.3 + (i / kpi.sparkline.length) * 0.7,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Breakdown */}
        <motion.div variants={item} className="lg:col-span-2 chart-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue Breakdown</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Monthly revenue by source (in $M)</p>
            </div>
            <div className="flex gap-1">
              {["Sponsorship", "Broadcast", "Merchandise", "Hospitality", "Digital"].map((s, i) => {
                const colors = ["#0ea5e9", "#a855f7", "#f59e0b", "#10b981", "#f43f5e"];
                return (
                  <span key={s} className="flex items-center gap-1 text-[10px] text-zinc-400 px-2 py-1 rounded-md bg-white/[0.03]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i] }} />
                    {s}
                  </span>
                );
              })}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueTimeline}>
              <defs>
                <linearGradient id="gSponsor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gBroadcast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gMerch" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sponsorship" name="Sponsorship" stroke="#0ea5e9" fill="url(#gSponsor)" strokeWidth={2} />
              <Area type="monotone" dataKey="broadcast" name="Broadcast" stroke="#a855f7" fill="url(#gBroadcast)" strokeWidth={2} />
              <Area type="monotone" dataKey="merchandise" name="Merchandise" stroke="#f59e0b" fill="url(#gMerch)" strokeWidth={2} />
              <Area type="monotone" dataKey="hospitality" name="Hospitality" stroke="#10b981" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="digital" name="Digital" stroke="#f43f5e" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Alerts */}
        <motion.div variants={item} className="chart-container flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Strategic Alerts</h3>
            <span className="badge badge-info">
              <Zap className="w-3 h-3" /> AI Powered
            </span>
          </div>
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
                          "badge-info": insight.severity === "low",
                        })}>
                          {insight.severity}
                        </span>
                        <span className="text-[10px] text-zinc-600">{insight.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Team Social Performance */}
        <motion.div variants={item} className="chart-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Team Social Intelligence</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Total following across platforms</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={teamSocialData.slice(0, 6)} layout="vertical" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
              <YAxis dataKey="team" type="category" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                return (
                  <div className="glass-panel p-3 text-xs">
                    <p className="text-white font-semibold mb-1">{payload[0].payload.team}</p>
                    <p className="text-zinc-400">Instagram: {formatNumber(payload[0].payload.instagram)}</p>
                    <p className="text-zinc-400">TikTok: {formatNumber(payload[0].payload.tiktok)}</p>
                    <p className="text-zinc-400">Engagement: {payload[0].payload.engRate}%</p>
                  </div>
                );
              }} />
              <Bar dataKey="instagram" fill="#E1306C" radius={[0, 4, 4, 0]} barSize={8} />
              <Bar dataKey="tiktok" fill="#00f2ea" radius={[0, 4, 4, 0]} barSize={8} />
              <Bar dataKey="twitter" fill="#1DA1F2" radius={[0, 4, 4, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Race Calendar */}
        <motion.div variants={item} className="chart-container">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Race Calendar & Impact</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Commercial performance by event</p>
            </div>
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {raceEvents.map((race, i) => (
              <div key={race.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold font-data text-zinc-400">
                  {race.country}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white">{race.name}</p>
                  <p className="text-[10px] text-zinc-500">{race.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-data text-white">{formatNumber(race.tvViewers)}</p>
                  <p className="text-[10px] text-zinc-500">viewers</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-xs font-data font-semibold", race.merchSpike > 20 ? "text-emerald-400" : "text-zinc-400")}>
                    +{race.merchSpike}%
                  </p>
                  <p className="text-[10px] text-zinc-500">merch</p>
                </div>
                <div className="w-16">
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#a855f7]" style={{ width: `${race.sponsorExposure}%` }} />
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-0.5 text-right">{race.sponsorExposure}%</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Globe placeholder */}
      <motion.div variants={item} className="chart-container text-center py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0ea5e9]/5 via-transparent to-[#a855f7]/5" />
        <div className="relative">
          <Globe className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Global Fan Distribution</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">87.4M fans across 195 countries. Fastest growing markets: India (+42.1%), Saudi Arabia (+48.6%), United States (+28.6%)</p>
          <div className="flex justify-center gap-6 mt-6">
            {[
              { flag: "🇬🇧", country: "UK", fans: "14.2M" },
              { flag: "🇺🇸", country: "US", fans: "12.8M" },
              { flag: "🇮🇹", country: "Italy", fans: "9.4M" },
              { flag: "🇧🇷", country: "Brazil", fans: "8.6M" },
              { flag: "🇩🇪", country: "Germany", fans: "7.2M" },
            ].map((c) => (
              <div key={c.country} className="text-center">
                <span className="text-2xl">{c.flag}</span>
                <p className="text-xs text-white font-semibold mt-1">{c.fans}</p>
                <p className="text-[10px] text-zinc-500">{c.country}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
