"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, LucideIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  subtext: string;
  glowColor?: "indigo" | "emerald" | "amber" | "purple" | "rose";
  href?: string;
}

const colorMap = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    glow: "from-indigo-100/60 to-transparent",
    border: "border-slate-200/90 hover:border-indigo-400 group-hover:border-indigo-400",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    glow: "from-emerald-100/60 to-transparent",
    border: "border-slate-200/90 hover:border-emerald-400 group-hover:border-emerald-400",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    glow: "from-amber-100/60 to-transparent",
    border: "border-slate-200/90 hover:border-amber-400 group-hover:border-amber-400",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    glow: "from-purple-100/60 to-transparent",
    border: "border-slate-200/90 hover:border-purple-400 group-hover:border-purple-400",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    glow: "from-rose-100/60 to-transparent",
    border: "border-slate-200/90 hover:border-rose-400 group-hover:border-rose-400",
  },
};

export function KpiCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  subtext,
  glowColor = "indigo",
  href,
}: KpiCardProps) {
  const styles = colorMap[glowColor];

  const content = (
    <Card
      className={cn(
        "glass relative overflow-hidden transition-all duration-300",
        href && "cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:bg-white",
        styles.border
      )}
    >
      <div
        className={cn(
          "absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br blur-2xl opacity-50 pointer-events-none transition-opacity duration-300",
          href && "group-hover:opacity-90",
          styles.glow
        )}
      />

      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition-colors">
            {title}
          </span>
          <div className="flex items-center gap-1.5">
            <div className={cn("p-2 rounded-xl transition-transform duration-300 group-hover:scale-110", styles.bg, styles.text)}>
              <Icon className="w-4 h-4" />
            </div>
            {href && (
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 -translate-x-1 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 text-slate-800" />
            )}
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <div className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
            {value}
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs">
          <div
            className={cn(
              "flex items-center font-semibold gap-1 px-1.5 py-0.5 rounded-md",
              trend === "up" && "text-emerald-400 bg-emerald-500/10",
              trend === "down" && "text-rose-400 bg-rose-500/10",
              trend === "neutral" && "text-slate-400 bg-slate-500/10"
            )}
          >
            {trend === "up" && <TrendingUp className="w-3 h-3" />}
            {trend === "down" && <TrendingDown className="w-3 h-3" />}
            <span>{change}</span>
          </div>
          <span className="text-muted-foreground truncate">{subtext}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block group no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
