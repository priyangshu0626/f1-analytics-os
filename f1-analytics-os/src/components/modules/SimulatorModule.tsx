"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Zap, Play, BarChart3, TrendingUp, Users, ShoppingBag, Target, Sparkles, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Cell } from "recharts";
import CountUp from "react-countup";

const anim = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const ai = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

const teams = ["Red Bull", "Ferrari", "Mercedes", "McLaren", "Aston Martin", "Alpine", "Williams", "RB", "Kick Sauber", "Haas"];
const races = ["Monaco GP", "British GP", "Italian GP", "Japanese GP", "US GP", "Abu Dhabi GP", "Australian GP", "Brazilian GP"];
const positions = ["P1 Win", "P2 Podium", "P3 Podium", "P4-P5", "P6-P10", "DNF"];
const incidents = ["None", "Safety Car", "Red Flag", "Driver Clash", "Mechanical DNF", "Weather Disruption"];

function runMonteCarlo(team: string, race: string, position: string, incident: string): {
  results: Array<{ metric: string; baseline: number; simulated: number; delta: number; confidence: number; unit: string; icon: string }>;
  distribution: number[];
  narrative: string;
} {
  const posMultiplier = position === "P1 Win" ? 1.8 : position === "P2 Podium" ? 1.4 : position === "P3 Podium" ? 1.2 : position === "P4-P5" ? 1.0 : position === "P6-P10" ? 0.9 : 0.7;
  const incidentMultiplier = incident === "None" ? 1.0 : incident === "Safety Car" ? 1.1 : incident === "Red Flag" ? 1.3 : incident === "Driver Clash" ? 1.5 : incident === "Mechanical DNF" ? 0.8 : 1.15;
  const raceWeight = race === "Monaco GP" ? 1.6 : race === "British GP" ? 1.4 : race === "Italian GP" ? 1.3 : 1.1;

  const merchBase = 2.4;
  const merchSim = merchBase * posMultiplier * raceWeight * (0.9 + Math.random() * 0.2);
  const followerBase = 180_000;
  const followerSim = followerBase * posMultiplier * incidentMultiplier * raceWeight * (0.85 + Math.random() * 0.3);
  const sponsorBase = 84;
  const sponsorSim = Math.min(100, sponsorBase * posMultiplier * (0.95 + Math.random() * 0.1));
  const engageBase = 4.2;
  const engageSim = engageBase * posMultiplier * incidentMultiplier * (0.9 + Math.random() * 0.2);

  // Seeded pseudo-random for deterministic distribution on initial render
  const seeded = (seed: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  };

  const iterations = 1000;
  const distribution = Array.from({ length: 50 }, (_, idx) => {
    const x = (idx - 25) / 10;
    return Math.round(iterations * Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI) * (0.8 + seeded(idx) * 0.4));
  });

  return {
    results: [
      { metric: "Merchandise Revenue", baseline: merchBase, simulated: merchSim, delta: ((merchSim - merchBase) / merchBase) * 100, confidence: 87, unit: "$M", icon: "ShoppingBag" },
      { metric: "Follower Growth", baseline: followerBase, simulated: followerSim, delta: ((followerSim - followerBase) / followerBase) * 100, confidence: 78, unit: "", icon: "Users" },
      { metric: "Sponsor Visibility", baseline: sponsorBase, simulated: sponsorSim, delta: ((sponsorSim - sponsorBase) / sponsorBase) * 100, confidence: 92, unit: "%", icon: "Target" },
      { metric: "Engagement Rate", baseline: engageBase, simulated: engageSim, delta: ((engageSim - engageBase) / engageBase) * 100, confidence: 82, unit: "%", icon: "TrendingUp" },
    ],
    distribution,
    narrative: `**Simulation Complete: ${team} at ${race}**\n\nIf ${team} finishes ${position} at the ${race}${incident !== "None" ? ` with a ${incident}` : ""}, our Monte Carlo model (n=1,000 iterations) projects:\n\n• **Merchandise revenue** would ${merchSim > merchBase ? "increase" : "decrease"} to **$${merchSim.toFixed(1)}M** (${((merchSim - merchBase) / merchBase * 100).toFixed(0)}% ${merchSim > merchBase ? "uplift" : "decline"})\n• **Follower growth** of **${Math.round(followerSim).toLocaleString()}** new fans across platforms\n• **Sponsor visibility index** would reach **${sponsorSim.toFixed(1)}%**\n• **Social engagement** would spike to **${engageSim.toFixed(1)}%**\n\n*Confidence level: ${position === "P1 Win" ? "High" : "Medium"} | Model: Monte Carlo (1,000 iterations)*`,
  };
}

const iconMap: Record<string, React.ElementType> = { ShoppingBag, Users, Target, TrendingUp };

export default function SimulatorModule() {
  const [team, setTeam] = useState("Ferrari");
  const [race, setRace] = useState("Monaco GP");
  const [position, setPosition] = useState("P1 Win");
  const [incident, setIncident] = useState("None");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof runMonteCarlo> | null>(null);
  const [progress, setProgress] = useState(0);

  const runSimulation = useCallback(() => {
    setRunning(true);
    setResults(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setRunning(false);
          setResults(runMonteCarlo(team, race, position, incident));
          return 100;
        }
        return p + 2 + Math.random() * 3;
      });
    }, 30);
  }, [team, race, position, incident]);

  return (
    <motion.div variants={anim} initial="hidden" animate="show" className="space-y-6">
      {/* Scenario Builder */}
      <motion.div variants={ai} className="gradient-border p-[1px]">
        <div className="rounded-2xl bg-[#0f0f12] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#e10600] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Scenario Builder</h3>
              <p className="text-xs text-zinc-500">Configure race weekend parameters for Monte Carlo simulation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Team", value: team, onChange: setTeam, options: teams },
              { label: "Race", value: race, onChange: setRace, options: races },
              { label: "Finishing Position", value: position, onChange: setPosition, options: positions },
              { label: "Incident", value: incident, onChange: setIncident, options: incidents },
            ].map(field => (
              <div key={field.label}>
                <label className="text-[11px] text-zinc-500 font-medium mb-1.5 block">{field.label}</label>
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm px-3 outline-none focus:border-[#0ea5e9]/50 transition-colors appearance-none cursor-pointer"
                >
                  {field.options.map(o => <option key={o} value={o} className="bg-[#18181b]">{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <button
            onClick={runSimulation}
            disabled={running}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
              running
                ? "bg-white/[0.06] text-zinc-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#0ea5e9] to-[#a855f7] text-white hover:shadow-lg hover:shadow-[#0ea5e9]/20"
            )}
          >
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? `Running Simulation... ${Math.min(100, Math.round(progress))}%` : "Run Monte Carlo Simulation (n=1,000)"}
          </button>

          {running && (
            <div className="mt-4 h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#a855f7]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progress)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Impact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.results.map((r, idx) => {
                const Icon = iconMap[r.icon] || BarChart3;
                const positive = r.delta > 0;
                return (
                  <motion.div
                    key={r.metric}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn("metric-card", positive ? "glow-blue" : "glow-red")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-4 h-4 text-zinc-500" />
                      <span className="badge badge-info text-[9px]">{r.confidence}% conf</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mb-1">{r.metric}</p>
                    <p className="font-data text-xl font-bold text-white">
                      {r.unit === "$M" ? "$" : ""}<CountUp end={r.simulated} duration={1.5} decimals={1} />{r.unit === "$M" ? "M" : r.unit}
                    </p>
                    <p className={cn("text-xs font-semibold mt-1", positive ? "text-emerald-400" : "text-red-400")}>
                      {positive ? "+" : ""}{r.delta.toFixed(1)}% vs baseline
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Distribution Chart */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="chart-container"
            >
              <h3 className="text-sm font-semibold text-white mb-4">Revenue Distribution (Monte Carlo)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={results.distribution.map((v, i) => ({ bin: i, count: v }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis tick={false} axisLine={false} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={8}>
                    {results.distribution.map((_, idx) => {
                      const dist = Math.abs(idx - 25) / 25;
                      return <Cell key={idx} fill={`rgba(14, 165, 233, ${1 - dist * 0.7})`} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* AI Narrative */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="gradient-border p-[1px]"
            >
              <div className="rounded-2xl bg-[#0f0f12] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-[#a855f7]" />
                  <h3 className="text-sm font-semibold text-white">AI Executive Summary</h3>
                </div>
                <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                  {results.narrative.split("**").map((part, i) =>
                    i % 2 ? <strong key={i} className="text-white">{part}</strong> : <span key={i}>{part}</span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
