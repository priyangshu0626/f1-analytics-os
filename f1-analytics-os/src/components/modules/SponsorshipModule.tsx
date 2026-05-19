"use client";
import { motion } from "framer-motion";
import { sponsors as fallbackSponsors, exposureHeatmap } from "@/lib/data";
import { useApiData } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { formatCurrency, formatNumber, cn, downloadCSV } from "@/lib/utils";
import {
  Target, TrendingUp, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Shield, Sparkles, ChevronRight, Eye, DollarSign, BarChart3, Download
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, CartesianGrid, ScatterChart, Scatter, ZAxis
} from "recharts";
import CountUp from "react-countup";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

const radarData = [
  { subject: "Brand Align", Oracle: 92, AWS: 88, Crypto: 45 },
  { subject: "Visibility", Oracle: 94, AWS: 89, Crypto: 72 },
  { subject: "Audience Fit", Oracle: 86, AWS: 90, Crypto: 58 },
  { subject: "ROI", Oracle: 95, AWS: 88, Crypto: 52 },
  { subject: "Activation", Oracle: 82, AWS: 92, Crypto: 48 },
  { subject: "Longevity", Oracle: 90, AWS: 85, Crypto: 35 },
];

const forecastData = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  actual: i < 8 ? 45 + Math.random() * 20 + i * 2 : undefined,
  forecast: i >= 6 ? 55 + Math.random() * 15 + i * 1.5 : undefined,
  upper: i >= 6 ? 65 + Math.random() * 15 + i * 1.5 : undefined,
  lower: i >= 6 ? 45 + Math.random() * 15 + i * 1.5 : undefined,
}));

export default function SponsorshipModule() {
  const { selectedTeam } = useAppStore();
  const rawSponsors = useApiData("/sponsors", fallbackSponsors);
  const [tierFilter, setTierFilter] = useState("All");

  const sponsors = rawSponsors.filter(s => {
    const matchesTeam = selectedTeam === "All Teams" || s.team === selectedTeam || s.team === "All Teams";
    const matchesTier = tierFilter === "All" || s.tier === tierFilter;
    return matchesTeam && matchesTier;
  });

  const totalValue = sponsors.reduce((a, s) => a + s.contractValue, 0);
  const avgROI = Math.round(sponsors.reduce((a, s) => a + s.roi, 0) / (sponsors.length || 1));
  const atRisk = sponsors.filter(s => s.status === "at-risk").length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header KPIs */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Portfolio Value", value: totalValue, prefix: "$", icon: DollarSign, color: "#10b981" },
          { label: "Avg. ROI", value: avgROI, suffix: "%", icon: TrendingUp, color: "#0ea5e9" },
          { label: "Visibility Index", value: 84.2, icon: Eye, color: "#a855f7" },
          { label: "At-Risk Sponsors", value: atRisk, icon: AlertTriangle, color: "#ef4444" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} variants={item} className="metric-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                <span className="text-xs text-zinc-500 font-medium">{kpi.label}</span>
              </div>
              <div className="font-data text-2xl font-bold text-white">
                {kpi.prefix}<CountUp end={kpi.value} duration={1.5} separator="," decimals={kpi.value < 100 ? 1 : 0} />{kpi.suffix}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Sponsor Table */}
      <motion.div variants={item} className="chart-container overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Sponsor Portfolio</h3>
          <div className="flex gap-2">
            {["All", "Title", "Major", "Official"].map(t => (
              <button 
                key={t} 
                onClick={() => setTierFilter(t)}
                className={cn("text-[11px] px-3 py-1 rounded-lg transition-colors",
                t === tierFilter ? "bg-[#0ea5e9]/10 text-[#0ea5e9]" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              )}>{t}</button>
            ))}
            <div className="w-[1px] h-6 bg-white/[0.08] mx-1" />
            <button 
              onClick={() => downloadCSV(sponsors, 'sponsor_portfolio')}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-lg bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] transition-colors"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sponsor</th>
                <th>Tier</th>
                <th>Contract Value</th>
                <th>ROI</th>
                <th>Impressions</th>
                <th>EMV</th>
                <th>CPM</th>
                <th>Visibility</th>
                <th>Risk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((s) => (
                <tr key={s.id} className="group cursor-pointer">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-zinc-400">
                        {s.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-white font-medium text-sm group-hover:text-[#0ea5e9] transition-colors">{s.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={cn("badge", {
                      "badge-purple": s.tier === "Title",
                      "badge-info": s.tier === "Major",
                      "badge-success": s.tier === "Official",
                      "badge-warning": s.tier === "Regional",
                    })}>{s.tier}</span>
                  </td>
                  <td className="font-data text-white">{formatCurrency(s.contractValue)}</td>
                  <td>
                    <span className={cn("font-data font-semibold", s.roi > 300 ? "text-emerald-400" : s.roi > 200 ? "text-amber-400" : "text-red-400")}>
                      {s.roi}%
                    </span>
                  </td>
                  <td className="font-data text-zinc-300">{formatNumber(s.impressions)}</td>
                  <td className="font-data text-zinc-300">{formatCurrency(s.emv)}</td>
                  <td className="font-data text-zinc-300">${s.cpm.toFixed(1)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-[#0ea5e9]" style={{ width: `${s.visibilityIndex}%` }} />
                      </div>
                      <span className="font-data text-xs text-zinc-400">{s.visibilityIndex}</span>
                    </div>
                  </td>
                  <td>
                    <span className={cn("font-data text-xs font-semibold", s.riskScore < 20 ? "text-emerald-400" : s.riskScore < 35 ? "text-amber-400" : "text-red-400")}>
                      {s.riskScore}
                    </span>
                  </td>
                  <td>
                    <span className={cn("badge", {
                      "badge-success": s.status === "active",
                      "badge-warning": s.status === "expiring",
                      "badge-danger": s.status === "at-risk",
                    })}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ROI Comparison */}
        <motion.div variants={item} className="chart-container">
          <h3 className="text-sm font-semibold text-white mb-4">Sponsor ROI Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sponsors.slice(0, 8)} layout="vertical" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#a1a1aa", fontSize: 11 }} width={85} axisLine={false} tickLine={false} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="glass-panel p-3 text-xs">
                    <p className="font-semibold text-white mb-1">{d.name}</p>
                    <p className="text-zinc-400">ROI: <span className="text-emerald-400">{d.roi}%</span></p>
                    <p className="text-zinc-400">EMV: {formatCurrency(d.emv)}</p>
                    <p className="text-zinc-400">CPM: ${d.cpm}</p>
                  </div>
                );
              }} />
              <Bar dataKey="roi" radius={[0, 6, 6, 0]} barSize={14} fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div variants={item} className="chart-container">
          <h3 className="text-sm font-semibold text-white mb-4">Sponsor Risk Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
              <Radar name="Oracle" dataKey="Oracle" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="AWS" dataKey="AWS" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
              <Radar name="Crypto.com" dataKey="Crypto" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {[["Oracle", "#0ea5e9"], ["AWS", "#10b981"], ["Crypto.com", "#ef4444"]].map(([n, c]) => (
              <span key={n} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />{n}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Exposure Heatmap */}
      <motion.div variants={item} className="chart-container">
        <h3 className="text-sm font-semibold text-white mb-4">Sponsor Exposure Heatmap</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header */}
            <div className="flex gap-1 mb-1 pl-24">
              {exposureHeatmap[0]?.races.map(r => (
                <div key={r.race} className="flex-1 text-[9px] text-zinc-500 text-center font-medium truncate">{r.race}</div>
              ))}
            </div>
            {/* Rows */}
            {exposureHeatmap.map(row => (
              <div key={row.sponsor} className="flex items-center gap-1 mb-1">
                <div className="w-24 text-[11px] text-zinc-400 truncate font-medium">{row.sponsor}</div>
                {row.races.map((cell, i) => (
                  <div
                    key={i}
                    className="heatmap-cell flex-1 h-8 flex items-center justify-center text-[9px] font-data font-bold"
                    style={{
                      backgroundColor: `rgba(14, 165, 233, ${cell.value / 100 * 0.6})`,
                      color: cell.value > 60 ? "#fff" : "#71717a",
                    }}
                  >
                    {cell.value}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Valuation Forecast */}
      <motion.div variants={item} className="chart-container">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Sponsor Valuation Forecast</h3>
            <p className="text-xs text-zinc-500 mt-0.5">AI-powered projection with confidence intervals</p>
          </div>
          <span className="badge badge-purple"><Sparkles className="w-3 h-3" /> Prophet Model</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="glass-panel p-3 text-xs">
                  <p className="text-zinc-400 mb-1">{label}</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {payload.map((p: any) => p.value && (
                    <p key={p.dataKey} className="text-zinc-300">{p.name}: <span className="text-white font-data">${p.value?.toFixed(1)}M</span></p>
                  ))}
                </div>
              );
            }} />
            <Line type="monotone" dataKey="actual" name="Actual" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3, fill: "#0ea5e9" }} connectNulls={false} />
            <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#a855f7" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: "#a855f7" }} connectNulls={false} />
            <Line type="monotone" dataKey="upper" name="Upper CI" stroke="#a855f7" strokeWidth={1} strokeDasharray="2 2" dot={false} opacity={0.3} connectNulls={false} />
            <Line type="monotone" dataKey="lower" name="Lower CI" stroke="#a855f7" strokeWidth={1} strokeDasharray="2 2" dot={false} opacity={0.3} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div variants={item} className="gradient-border p-[1px]">
        <div className="rounded-2xl bg-[#0f0f12] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#a855f7] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Sponsor Recommendations</h3>
              <p className="text-xs text-zinc-500">Based on brand alignment, market fit, and exposure potential</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Stripe", industry: "Fintech", fit: 94, value: "$25-35M", reason: "Digital-first brand, strong tech alignment, expanding into sports sponsorship" },
              { name: "Apple", industry: "Technology", fit: 97, value: "$80-120M", reason: "Premium brand positioning, massive reach, emerging F1 interest via Apple TV+" },
              { name: "Revolut", industry: "Banking", fit: 86, value: "$15-25M", reason: "Young demographic overlap, crypto-adjacent without volatility risk" },
            ].map(rec => (
              <div key={rec.name} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#0ea5e9]/30 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white group-hover:text-[#0ea5e9]">{rec.name}</span>
                  <span className="badge badge-success">{rec.fit}% fit</span>
                </div>
                <span className="badge badge-info mb-2">{rec.industry}</span>
                <p className="text-[11px] text-zinc-500 mt-2">{rec.reason}</p>
                <p className="text-xs font-data text-[#10b981] font-semibold mt-2">Est. Value: {rec.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
