"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
import { Layers, IndianRupee } from "lucide-react";

export interface DealStageItem {
  name: string;
  count: number;
  valueCr: number;
  color: string;
  status: "new" | "contacted" | "visit" | "negotiation" | "won";
}

const defaultStages: Record<string, DealStageItem[]> = {
  "7d": [
    { name: "New Inquiries", count: 42, valueCr: 3.2, color: "#60A5FA", status: "new" },
    { name: "Contacted", count: 28, valueCr: 2.5, color: "#818CF8", status: "contacted" },
    { name: "Site Visits", count: 18, valueCr: 2.1, color: "#A78BFA", status: "visit" },
    { name: "Negotiation", count: 12, valueCr: 1.8, color: "#F59E0B", status: "negotiation" },
    { name: "Booked / Won", count: 8, valueCr: 1.4, color: "#10B981", status: "won" },
  ],
  "30d": [
    { name: "New Inquiries", count: 128, valueCr: 9.4, color: "#60A5FA", status: "new" },
    { name: "Contacted", count: 94, valueCr: 7.2, color: "#818CF8", status: "contacted" },
    { name: "Site Visits", count: 58, valueCr: 6.8, color: "#A78BFA", status: "visit" },
    { name: "Negotiation", count: 34, valueCr: 4.5, color: "#F59E0B", status: "negotiation" },
    { name: "Booked / Won", count: 24, valueCr: 3.9, color: "#10B981", status: "won" },
  ],
  "90d": [
    { name: "New Inquiries", count: 380, valueCr: 28.5, color: "#60A5FA", status: "new" },
    { name: "Contacted", count: 260, valueCr: 21.0, color: "#818CF8", status: "contacted" },
    { name: "Site Visits", count: 165, valueCr: 19.2, color: "#A78BFA", status: "visit" },
    { name: "Negotiation", count: 96, valueCr: 13.8, color: "#F59E0B", status: "negotiation" },
    { name: "Booked / Won", count: 68, valueCr: 11.2, color: "#10B981", status: "won" },
  ],
  "1y": [
    { name: "New Inquiries", count: 1420, valueCr: 112.0, color: "#60A5FA", status: "new" },
    { name: "Contacted", count: 980, valueCr: 84.5, color: "#818CF8", status: "contacted" },
    { name: "Site Visits", count: 620, valueCr: 72.0, color: "#A78BFA", status: "visit" },
    { name: "Negotiation", count: 340, valueCr: 48.6, color: "#F59E0B", status: "negotiation" },
    { name: "Booked / Won", count: 245, valueCr: 41.2, color: "#10B981", status: "won" },
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
        style={{ filter: "drop-shadow(0px 0px 8px rgba(16, 185, 129, 0.4))" }}
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

export function PieDealStages({ period = "30d" }: { period?: string }) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const data = defaultStages[period] || defaultStages["30d"];
  const totalDeals = data.reduce((acc, curr) => acc + curr.count, 0);
  const totalValue = data.reduce((acc, curr) => acc + curr.valueCr, 0).toFixed(1);

  const activeItem = activeIndex !== undefined ? data[activeIndex] : null;

  return (
    <Card className="glass overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Pipeline Stage Conversion
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Active volume and value progression through sales stages
            </CardDescription>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80">
            ₹{totalValue} Cr Pipeline
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
                    const item = payload[0].payload as DealStageItem;
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
                          <span>Volume:</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {item.count} deals
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-baseline justify-between gap-4 text-slate-600">
                          <span>Value:</span>
                          <span className="font-bold text-emerald-600 text-sm">
                            ₹{item.valueCr.toFixed(1)} Cr
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
                dataKey="count"
                {...({ activeIndex, activeShape: renderActiveShape } as any)}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
                isAnimationActive={true}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`stage-cell-${index}`}
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

          {/* Centered Value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeItem ? (
              <>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {activeItem.name}
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {activeItem.count} Deals
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  ₹{activeItem.valueCr.toFixed(1)} Cr Value
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Deals in Flight
                </span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {totalDeals}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  ₹{totalValue} Cr Total
                </span>
              </>
            )}
          </div>
        </div>

        {/* Progress Rows for each stage */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          {data.map((item, idx) => {
            const pct = Math.round((item.count / totalDeals) * 100);
            const isHovered = activeIndex === idx;
            return (
              <div
                key={item.name}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(undefined)}
                className={`px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isHovered ? "bg-slate-100 shadow-xs border border-slate-200" : "hover:bg-slate-50/80 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-800 font-semibold">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono text-[11px]">
                      {item.count} deals
                    </span>
                    <span className="font-bold text-emerald-600 text-[11px]">
                      ₹{item.valueCr.toFixed(1)} Cr
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
