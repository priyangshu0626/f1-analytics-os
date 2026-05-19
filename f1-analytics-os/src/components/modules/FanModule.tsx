"use client";
import { motion } from "framer-motion";
import { useLiveData } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { formatNumber, cn } from "@/lib/utils";
import { Users, Video, Globe, Brain, ArrowUpRight, Newspaper, Heart } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";
import CountUp from "react-countup";
import SourceBadge from "@/components/ui/SourceBadge";

const c = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const i = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

interface FanData {
  youtube: Array<{ channelId: string; teamKey: string; subscriberCount: number; viewCount: number; videoCount: number }>;
  newsArticles: number;
  sentiment: { score: number; positive: number; neutral: number; negative: number };
  sentimentBreakdown: Array<{ headline: string; label: string; confidence: number }>;
}

export default function FanModule() {
  const { selectedTeam } = useAppStore();
  const { data: fanData } = useLiveData<FanData>("/fans", {
    youtube: [], newsArticles: 0,
    sentiment: { score: 0, positive: 0, neutral: 0, negative: 0 },
    sentimentBreakdown: [],
  });

  const ytChannels = fanData.youtube || [];
  const totalYTSubs = ytChannels.reduce((a, c) => a + c.subscriberCount, 0);
  const totalYTViews = ytChannels.reduce((a, c) => a + c.viewCount, 0);
  const sentimentPie = [
    { name: "Positive", value: fanData.sentiment.positive || 0, color: "#10b981" },
    { name: "Neutral", value: fanData.sentiment.neutral || 0, color: "#f59e0b" },
    { name: "Negative", value: fanData.sentiment.negative || 0, color: "#ef4444" },
  ];

  return (
    <motion.div variants={c} initial="hidden" animate="show" className="space-y-6">
      {/* Real Platform KPIs */}
      <motion.div variants={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "YouTube Subscribers", value: totalYTSubs, icon: Video, color: "#ef4444", source: "YouTube Data API", dataType: "LIVE DATA" as const },
          { label: "Total Video Views", value: totalYTViews, icon: Globe, color: "#0ea5e9", source: "YouTube Data API", dataType: "LIVE DATA" as const },
          { label: "News Articles", value: fanData.newsArticles, icon: Newspaper, color: "#a855f7", source: "GNews + NewsData", dataType: "LIVE DATA" as const },
          { label: "Sentiment Score", value: fanData.sentiment.score, icon: Brain, color: "#f59e0b", source: "HuggingFace NLP", dataType: "CALCULATED" as const, suffix: "/100" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} variants={i} className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                    <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">{kpi.label}</span>
                </div>
              </div>
              <div className="font-data text-2xl font-bold text-white">
                <CountUp end={kpi.value} duration={1.5} separator="," />{kpi.suffix || ""}
              </div>
              <div className="mt-2">
                <SourceBadge source={kpi.source} dataType={kpi.dataType} compact />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* YouTube Subscribers per Team — REAL data */}
      <motion.div variants={i} className="chart-container">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-white">YouTube Subscribers per F1 Team</h3>
          <SourceBadge source="YouTube Data API v3" dataType="LIVE DATA" compact />
        </div>
        <p className="text-[10px] text-zinc-500 mb-3">Real subscriber counts from verified YouTube team channels</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={ytChannels.filter((c) => c.subscriberCount > 0).sort((a, b) => b.subscriberCount - a.subscriberCount)}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="teamKey" tick={{ fill: "#a1a1aa", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="glass-panel p-3 text-xs">
                  <p className="font-semibold text-white mb-1">{d.teamKey}</p>
                  <p className="text-zinc-400">Subscribers: <span className="text-white font-data">{formatNumber(d.subscriberCount)}</span></p>
                  <p className="text-zinc-400">Total Views: <span className="text-white font-data">{formatNumber(d.viewCount)}</span></p>
                  <p className="text-zinc-400">Videos: <span className="text-white font-data">{d.videoCount}</span></p>
                  <p className="text-[9px] text-emerald-400 mt-1">✓ Verified: YouTube Data API</p>
                </div>
              );
            }} />
            <Bar dataKey="subscriberCount" radius={[6, 6, 0, 0]} barSize={32} fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sentiment Analysis — REAL NLP */}
        <motion.div variants={i} className="chart-container">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">News Sentiment Analysis</h3>
            <SourceBadge source="HuggingFace RoBERTa" dataType="CALCULATED" compact />
          </div>
          <p className="text-[10px] text-zinc-500 mb-3">Real NLP sentiment analysis on {fanData.sentimentBreakdown.length} live F1 headlines</p>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={sentimentPie} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {sentimentPie.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {sentimentPie.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-zinc-400 w-16">{d.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                  </div>
                  <span className="font-data text-xs text-white w-10 text-right">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Headline-by-headline sentiment */}
        <motion.div variants={i} className="chart-container">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Headline Sentiment Breakdown</h3>
            <SourceBadge source="HuggingFace NLP" dataType="CALCULATED" compact />
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto mt-3">
            {fanData.sentimentBreakdown.map((s, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <Heart className={cn("w-3.5 h-3.5 mt-0.5 flex-shrink-0",
                  s.label === "positive" ? "text-emerald-400" :
                  s.label === "negative" ? "text-red-400" : "text-amber-400"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-zinc-300 line-clamp-2">{s.headline}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded",
                      s.label === "positive" ? "bg-emerald-400/10 text-emerald-400" :
                      s.label === "negative" ? "bg-red-400/10 text-red-400" : "bg-amber-400/10 text-amber-400"
                    )}>{s.label}</span>
                    <span className="text-[9px] text-zinc-600">{s.confidence}% confidence</span>
                  </div>
                </div>
              </div>
            ))}
            {fanData.sentimentBreakdown.length === 0 && (
              <p className="text-xs text-zinc-600 text-center py-4">Awaiting pipeline refresh for sentiment data</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Team YouTube Rankings */}
      <motion.div variants={i} className="chart-container">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-white">Team YouTube Rankings</h3>
          <SourceBadge source="YouTube Data API v3" dataType="LIVE DATA" compact />
        </div>
        <div className="space-y-2 mt-3">
          {ytChannels.sort((a, b) => b.subscriberCount - a.subscriberCount).map((ch, idx) => {
            const isSelected = selectedTeam !== "All Teams" && ch.teamKey.includes(selectedTeam.toLowerCase().replace(/\s+/g, "_"));
            return (
              <div key={ch.channelId} className={cn("flex items-center gap-4 p-3 rounded-xl transition-all border",
                isSelected ? "bg-[#ef4444]/10 border-[#ef4444]/30" : "bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08]"
              )}>
                <span className={cn("font-data text-xs w-6", isSelected ? "text-[#ef4444]" : "text-zinc-500")}>#{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{ch.teamKey}</p>
                  <p className="text-[10px] text-zinc-500">{ch.videoCount} videos</p>
                </div>
                <div className="text-center px-4">
                  <p className="font-data text-sm text-white">{formatNumber(ch.subscriberCount)}</p>
                  <p className="text-[9px] text-zinc-500">Subscribers</p>
                </div>
                <div className="text-center px-4">
                  <p className="font-data text-sm text-zinc-300">{formatNumber(ch.viewCount)}</p>
                  <p className="text-[9px] text-zinc-500">Views</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
