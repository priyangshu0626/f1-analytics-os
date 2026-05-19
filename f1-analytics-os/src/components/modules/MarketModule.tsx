"use client";
import { motion } from "framer-motion";
import { useLiveData } from "@/lib/api";
import { formatNumber, cn } from "@/lib/utils";
import { Globe, DollarSign, TrendingUp, MapPin, Flag } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import CountUp from "react-countup";
import SourceBadge from "@/components/ui/SourceBadge";

const anim = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const ai = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

interface ExchangeRates { base: string; rates: Record<string, number>; lastUpdated: string }
interface Region { region: string; currency: string; rate: number; marketShare: number; growth: number }
interface CountryData { name: string; code: string; flagEmoji: string; population: number; region: string; capital: string; currencies: string[] }
interface MarketData { rates: ExchangeRates; regions: Region[]; countries: CountryData[] }

export default function MarketModule() {
  const { data: marketData } = useLiveData<MarketData | null>("/markets", null);

  const rates = marketData?.rates || { base: "USD", rates: {}, lastUpdated: "" };
  const regions = marketData?.regions || [];
  const countries = marketData?.countries || [];
  const currencyEntries = Object.entries(rates.rates).filter(([k]) => k !== "USD");

  const regionColors = ["#0ea5e9", "#a855f7", "#f59e0b", "#10b981", "#ef4444"];

  return (
    <motion.div variants={anim} initial="hidden" animate="show" className="space-y-6">
      {/* KPIs */}
      <motion.div variants={ai} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Currencies Tracked", value: currencyEntries.length, icon: DollarSign, color: "#10b981", source: "ExchangeRate API" },
          { label: "F1 Markets", value: countries.length, icon: MapPin, color: "#0ea5e9", source: "REST Countries" },
          { label: "Regions Covered", value: regions.length, icon: Globe, color: "#a855f7", source: "ExchangeRate API" },
          { label: "Base Currency", value: "USD", icon: Flag, color: "#f59e0b", source: "ExchangeRate API", isText: true },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} variants={ai} className="metric-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
                <span className="text-xs text-zinc-500 font-medium">{kpi.label}</span>
              </div>
              <div className="font-data text-2xl font-bold text-white">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(kpi as any).isText ? String(kpi.value) : <CountUp end={kpi.value as number} duration={1} separator="," />}
              </div>
              <div className="mt-2"><SourceBadge source={kpi.source} dataType="LIVE DATA" compact /></div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Regional Market Data */}
      <motion.div variants={ai} className="chart-container">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-white">Regional Market Analysis</h3>
          <SourceBadge source="ExchangeRate API" dataType="LIVE DATA" compact />
        </div>
        <p className="text-[10px] text-zinc-500 mb-3">F1 market share and growth by region with live exchange rates</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={regions}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="region" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="glass-panel p-3 text-xs">
                  <p className="text-white font-semibold">{d.region}</p>
                  <p className="text-zinc-400">Market Share: <span className="text-white">{d.marketShare}%</span></p>
                  <p className="text-zinc-400">Growth: <span className="text-emerald-400">+{d.growth}%</span></p>
                  <p className="text-zinc-400">Currency: <span className="text-white">{d.currency}</span> (1 USD = {d.rate})</p>
                  <p className="text-[9px] text-emerald-400 mt-1">✓ Live: ExchangeRate API</p>
                </div>
              );
            }} />
            <Bar dataKey="marketShare" radius={[6, 6, 0, 0]} barSize={40}>
              {regions.map((_, idx) => <Cell key={idx} fill={regionColors[idx % regionColors.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live Exchange Rates */}
        <motion.div variants={ai} className="chart-container">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Live Exchange Rates (vs USD)</h3>
            <SourceBadge source="ExchangeRate API" dataType="LIVE DATA" updatedAt={rates.lastUpdated} compact />
          </div>
          <div className="space-y-2 mt-3 max-h-[300px] overflow-y-auto">
            {currencyEntries.sort((a, b) => a[0].localeCompare(b[0])).map(([currency, rate]) => (
              <div key={currency} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <span className="font-data text-sm font-bold text-white w-10">{currency}</span>
                </div>
                <span className="font-data text-sm text-zinc-300">1 USD = {rate.toFixed(4)} {currency}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* F1 Market Countries */}
        <motion.div variants={ai} className="chart-container">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">F1 Market Countries</h3>
            <SourceBadge source="REST Countries API" dataType="LIVE DATA" compact />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3 max-h-[300px] overflow-y-auto">
            {countries.slice(0, 16).map((country) => (
              <div key={country.code} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#0ea5e9]/30 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{country.flagEmoji}</span>
                  <span className="text-xs font-medium text-white truncate">{country.name}</span>
                </div>
                <p className="text-[10px] text-zinc-500">{country.capital} · {country.region}</p>
                <p className="font-data text-xs text-zinc-400 mt-1">Pop: {formatNumber(country.population)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
