"use client";
import { motion } from "framer-motion";
import { merchProducts as fallbackMerch } from "@/lib/data";
import { useApiData } from "@/lib/api";
import { formatCurrency, cn, downloadCSV } from "@/lib/utils";
import { ShoppingBag, TrendingUp, ArrowUpRight, Package, DollarSign, Sparkles, Download } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Treemap } from "recharts";
import CountUp from "react-countup";
import { useState } from "react";

const anim = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const ai = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

// Seeded pseudo-random for deterministic distribution on initial render
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const monthlyRevenue = Array.from({ length: 12 }, (_, idx) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][idx],
  revenue: 6 + seeded(idx) * 8 + (idx > 2 && idx < 9 ? 4 : 0),
  forecast: idx >= 8 ? 10 + seeded(idx + 12) * 6 + idx * 0.5 : undefined,
}));

const categoryData = [
  { name: "Apparel", value: 48, color: "#0ea5e9" },
  { name: "Headwear", value: 18, color: "#a855f7" },
  { name: "Collectibles", value: 22, color: "#f59e0b" },
  { name: "Accessories", value: 12, color: "#10b981" },
];

const regionData = [
  { name: "Europe", revenue: 52.4, growth: 8.2 },
  { name: "Americas", revenue: 38.6, growth: 18.4 },
  { name: "Asia Pacific", revenue: 22.8, growth: 32.6 },
  { name: "Middle East", revenue: 11.0, growth: 44.2 },
];

export default function MerchModule() {
  const merchProducts = useApiData("/merch", fallbackMerch);
  const [priceMultiplier, setPriceMultiplier] = useState(1.0);

  return (
    <motion.div variants={anim} initial="hidden" animate="show" className="space-y-6">
      {/* KPIs */}
      <motion.div variants={ai} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: 124_800_000, prefix: "$", icon: DollarSign, color: "#10b981", change: 6.3 },
          { label: "Units Sold", value: 2_680_000, icon: Package, color: "#0ea5e9", change: 12.1 },
          { label: "Avg. Order Value", value: 46.57, prefix: "$", icon: ShoppingBag, color: "#a855f7", change: 3.8 },
          { label: "Growth Rate", value: 18.4, suffix: "%", icon: TrendingUp, color: "#f59e0b", change: 4.2 },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} variants={ai} className="metric-card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
                  <ArrowUpRight className="w-3 h-3" />{kpi.change}%
                </span>
              </div>
              <div className="font-data text-2xl font-bold text-white">
                {kpi.prefix}<CountUp end={kpi.value} duration={1.5} separator="," decimals={kpi.value < 100 ? 2 : 0} />{kpi.suffix}
              </div>
              <div className="text-[11px] text-zinc-500 font-medium mt-1">{kpi.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Revenue Chart + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={ai} className="lg:col-span-2 chart-container">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue Trend & Forecast</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="glass-panel p-3 text-xs">
                    <p className="text-zinc-400">{label}</p>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {payload.map((p: any) => p.value && (
                      <p key={p.dataKey} className="text-white font-data">{p.name}: ${p.value.toFixed(1)}M</p>
                    ))}
                  </div>
                );
              }} />
              <Area type="monotone" dataKey="revenue" name="Actual" stroke="#10b981" fill="url(#gRev)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#a855f7" fill="none" strokeWidth={2} strokeDasharray="6 4" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={ai} className="chart-container">
          <h3 className="text-sm font-semibold text-white mb-4">Category Mix</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {categoryData.map(d => <Cell key={d.name} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categoryData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-zinc-400 flex-1">{d.name}</span>
                <span className="font-data text-xs text-white">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Product Rankings */}
      <motion.div variants={ai} className="chart-container">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Product Performance Ranking</h3>
          <button 
            onClick={() => downloadCSV(merchProducts, 'merch_performance')}
            className="flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-lg bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] transition-colors"
          >
            <Download className="w-3 h-3" />
            Export CSV
          </button>
        </div>
        <div className="space-y-2">
          {merchProducts.sort((a, b) => b.revenue - a.revenue).map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all"
            >
              <span className={cn("position-badge", idx === 0 ? "p1" : idx === 1 ? "p2" : idx === 2 ? "p3" : "bg-white/[0.06] text-zinc-400")}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{p.name}</p>
                <p className="text-[10px] text-zinc-500">{p.team} · {p.category}</p>
              </div>
              <div className="text-right px-3">
                <p className="font-data text-sm text-white">{formatCurrency(p.revenue)}</p>
                <p className="text-[9px] text-zinc-500">Revenue</p>
              </div>
              <div className="text-right px-3">
                <p className="font-data text-sm text-zinc-300">{(p.units / 1000).toFixed(0)}K</p>
                <p className="text-[9px] text-zinc-500">Units</p>
              </div>
              <span className="flex items-center gap-0.5 font-data text-sm font-semibold text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />{p.growth}%
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Pricing Simulator */}
      <motion.div variants={ai} className="gradient-border p-[1px]">
        <div className="rounded-2xl bg-[#0f0f12] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#f43f5e] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Dynamic Pricing Simulator</h3>
              <p className="text-xs text-zinc-500">Adjust price multiplier to see projected revenue impact</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs text-zinc-400 mb-2 block">Price Multiplier</label>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.05"
                value={priceMultiplier}
                onChange={(e) => setPriceMultiplier(parseFloat(e.target.value))}
                className="w-full accent-[#f59e0b]"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>-30%</span>
                <span className="font-data text-white text-sm font-bold">{((priceMultiplier - 1) * 100).toFixed(0)}%</span>
                <span>+50%</span>
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/[0.03]">
              <p className="text-xs text-zinc-500 mb-1">Projected Revenue</p>
              <p className="font-data text-2xl font-bold text-white">
                ${(124.8 * priceMultiplier * (priceMultiplier > 1.2 ? 0.85 : priceMultiplier < 0.9 ? 1.12 : 1)).toFixed(1)}M
              </p>
              <p className={cn("text-xs font-semibold mt-1", priceMultiplier >= 1 ? "text-emerald-400" : "text-red-400")}>
                {priceMultiplier >= 1 ? "+" : ""}{((priceMultiplier * (priceMultiplier > 1.2 ? 0.85 : priceMultiplier < 0.9 ? 1.12 : 1) - 1) * 100).toFixed(1)}% vs baseline
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/[0.03]">
              <p className="text-xs text-zinc-500 mb-1">Projected Units</p>
              <p className="font-data text-2xl font-bold text-white">
                {(2.68 * (priceMultiplier > 1 ? Math.pow(0.85, priceMultiplier - 1) : Math.pow(1.15, 1 - priceMultiplier))).toFixed(1)}M
              </p>
              <p className="text-xs text-zinc-400 mt-1">Elasticity factor: -0.42</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Regional Performance */}
      <motion.div variants={ai} className="chart-container">
        <h3 className="text-sm font-semibold text-white mb-4">Regional Performance</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={regionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              return (
                <div className="glass-panel p-3 text-xs">
                  <p className="text-white font-semibold">{payload[0].payload.name}</p>
                  <p className="text-zinc-400">Revenue: ${payload[0].payload.revenue}M</p>
                  <p className="text-emerald-400">Growth: +{payload[0].payload.growth}%</p>
                </div>
              );
            }} />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
              {regionData.map((_, idx) => (
                <Cell key={idx} fill={["#0ea5e9", "#a855f7", "#f59e0b", "#10b981"][idx]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
