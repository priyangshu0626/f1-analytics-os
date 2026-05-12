import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(0);
}

export function formatCurrency(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

export function formatPercent(num: number): string {
  return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
}

export function getTeamColor(team: string): string {
  const colors: Record<string, string> = {
    "Red Bull": "#3671C6",
    Ferrari: "#E8002D",
    Mercedes: "#27F4D2",
    McLaren: "#FF8000",
    "Aston Martin": "#229971",
    Alpine: "#0093CC",
    Williams: "#64C4FF",
    "RB": "#6692FF",
    "Kick Sauber": "#52E252",
    Haas: "#B6BABD",
  };
  return colors[team] || "#888888";
}

export function generateSparkline(length: number = 12, trend: "up" | "down" | "flat" = "up"): number[] {
  const data: number[] = [];
  let value = 50 + Math.random() * 30;
  for (let i = 0; i < length; i++) {
    const drift = trend === "up" ? 2 : trend === "down" ? -2 : 0;
    value += drift + (Math.random() - 0.5) * 15;
    value = Math.max(10, Math.min(100, value));
    data.push(value);
  }
  return data;
}

export function downloadCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => {
      let value = row[fieldName];
      if (typeof value === 'string' && value.includes(',')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','))
  ];
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
