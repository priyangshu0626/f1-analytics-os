"use client";
import { cn } from "@/lib/utils";
import type { DataType } from "@/lib/analytics";

const TYPE_STYLES: Record<DataType, { color: string; bg: string; dot: string }> = {
  "LIVE DATA": { color: "text-emerald-400", bg: "bg-emerald-400/10", dot: "bg-emerald-400" },
  "CALCULATED": { color: "text-sky-400", bg: "bg-sky-400/10", dot: "bg-sky-400" },
  "AI SUMMARY": { color: "text-purple-400", bg: "bg-purple-400/10", dot: "bg-purple-400" },
  "HISTORICAL": { color: "text-amber-400", bg: "bg-amber-400/10", dot: "bg-amber-400" },
};

interface SourceBadgeProps {
  source: string;
  dataType: DataType;
  updatedAt?: string;
  compact?: boolean;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SourceBadge({ source, dataType, updatedAt, compact }: SourceBadgeProps) {
  const style = TYPE_STYLES[dataType] || TYPE_STYLES["LIVE DATA"];

  if (compact) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded", style.bg, style.color)}>
        <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
        {dataType}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
      <span className={cn("inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded", style.bg, style.color)}>
        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", style.dot)} />
        {dataType}
      </span>
      <span>Source: {source}</span>
      {updatedAt && <span>· {timeAgo(updatedAt)}</span>}
    </div>
  );
}
