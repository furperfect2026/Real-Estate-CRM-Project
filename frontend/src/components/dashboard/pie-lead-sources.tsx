"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
import { Users, Filter } from "lucide-react";

export interface LeadSourceItem {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

const defaultSources: Record<string, LeadSourceItem[]> = {
  "7d": [
    { name: "Facebook Ads", value: 38, color: "#6366F1", percentage: "32%" },
    { name: "99acres", value: 28, color: "#10B981", percentage: "24%" },
    { name: "MagicBricks", value: 22, color: "#F59E0B", percentage: "19%" },
    { name: "Website Direct", value: 16, color: "#06B6D4", percentage: "14%" },
    { name: "Referrals", value: 14, color: "#EC4899", percentage: "11%" },
  ],
  "30d": [
    { name: "Facebook Ads", value: 142, color: "#6366F1", percentage: "35%" },
    { name: "99acres", value: 98, color: "#10B981", percentage: "24%" },
    { name: "MagicBricks", value: 74, color: "#F59E0B", percentage: "18%" },
    { name: "Website Direct", value: 52, color: "#06B6D4", percentage: "13%" },
    { name: "Referrals", value: 41, color: "#EC4899", percentage: "10%" },
  ],
  "90d": [
    { name: "Facebook Ads", value: 395, color: "#6366F1", percentage: "34%" },
    { name: "99acres", value: 284, color: "#10B981", percentage: "25%" },
    { name: "MagicBricks", value: 215, color: "#F59E0B", percentage: "19%" },
    { name: "Website Direct", value: 146, color: "#06B6D4", percentage: "13%" },
    { name: "Referrals", value: 108, color: "#EC4899", percentage: "9%" },
  ],
  "1y": [
    { name: "Facebook Ads", value: 1450, color: "#6366F1", percentage: "36%" },
    { name: "99acres", value: 980, color: "#10B981", percentage: "24%" },
    { name: "MagicBricks", value: 720, color: "#F59E0B", percentage: "18%" },
    { name: "Website Direct", value: 530, color: "#06B6D4", percentage: "13%" },
    { name: "Referrals", value: 360, color: "#EC4899", percentage: "9%" },
  ],
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.4))" }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius - 2}
        fill={fill}
      />
    </g>
  );
};

export function PieLeadSources({ period = "30d" }: { period?: string }) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const data = defaultSources[period] || defaultSources["30d"];
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const activeItem = activeIndex !== undefined ? data[activeIndex] : null;

  return (
    <Card className="glass overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Lead Ingestion Sources
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Omnichannel breakdown from ad campaigns & portals
            </CardDescription>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/80">
            {data.length} Channels
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="relative h-[220px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as LeadSourceItem;
                    return (
                      <div className="backdrop-blur-xl bg-white/95 border border-slate-200 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="flex items-center gap-2 font-semibold text-slate-900">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.name}
                        </div>
                        <div className="mt-1 flex items-baseline justify-between gap-4 text-slate-600">
                          <span>Leads captured:</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {item.value} ({item.percentage})
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={86}
                paddingAngle={4}
                dataKey="value"
                {...({ activeIndex, activeShape: renderActiveShape } as any)}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
                isAnimationActive={true}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="cursor-pointer transition-opacity duration-300"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    opacity={activeIndex === undefined || activeIndex === index ? 1 : 0.45}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total / Active Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeItem ? (
              <>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {activeItem.name}
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {activeItem.value}
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold">
                  {activeItem.percentage} share
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Leads
                </span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {total}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  Active Inflow
                </span>
              </>
            )}
          </div>
        </div>

        {/* Interactive Legend Pill List */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          {data.map((item, idx) => {
            const isHovered = activeIndex === idx;
            return (
              <button
                key={item.name}
                type="button"
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(undefined)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left ${
                  isHovered
                    ? "bg-slate-100 shadow-xs border border-slate-300 text-slate-900"
                    : "bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/60 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 ml-2 shrink-0">
                  {item.percentage}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
