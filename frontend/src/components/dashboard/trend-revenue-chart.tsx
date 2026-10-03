"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ArrowUpRight } from "lucide-react";

interface MonthlyDataPoint {
  period: string;
  pipelineCr: number;
  bookedCr: number;
  leadsCount: number;
}

const revenueTrends: Record<string, MonthlyDataPoint[]> = {
  "7d": [
    { period: "Mon", pipelineCr: 1.2, bookedCr: 0.4, leadsCount: 14 },
    { period: "Tue", pipelineCr: 1.8, bookedCr: 0.6, leadsCount: 22 },
    { period: "Wed", pipelineCr: 2.1, bookedCr: 0.7, leadsCount: 26 },
    { period: "Thu", pipelineCr: 1.9, bookedCr: 0.5, leadsCount: 19 },
    { period: "Fri", pipelineCr: 2.8, bookedCr: 1.1, leadsCount: 34 },
    { period: "Sat", pipelineCr: 3.4, bookedCr: 1.5, leadsCount: 42 },
    { period: "Sun", pipelineCr: 2.6, bookedCr: 0.9, leadsCount: 31 },
  ],
  "30d": [
    { period: "Week 1", pipelineCr: 6.4, bookedCr: 2.1, leadsCount: 88 },
    { period: "Week 2", pipelineCr: 8.9, bookedCr: 3.2, leadsCount: 114 },
    { period: "Week 3", pipelineCr: 12.1, bookedCr: 4.5, leadsCount: 146 },
    { period: "Week 4", pipelineCr: 15.8, bookedCr: 5.8, leadsCount: 172 },
  ],
  "90d": [
    { period: "Month 1", pipelineCr: 14.2, bookedCr: 5.1, leadsCount: 310 },
    { period: "Month 2", pipelineCr: 22.8, bookedCr: 8.6, leadsCount: 425 },
    { period: "Month 3", pipelineCr: 31.4, bookedCr: 12.4, leadsCount: 560 },
  ],
  "1y": [
    { period: "Q1", pipelineCr: 34.5, bookedCr: 12.8, leadsCount: 850 },
    { period: "Q2", pipelineCr: 46.2, bookedCr: 18.4, leadsCount: 1120 },
    { period: "Q3", pipelineCr: 62.8, bookedCr: 24.6, leadsCount: 1480 },
    { period: "Q4", pipelineCr: 78.4, bookedCr: 32.1, leadsCount: 1840 },
  ],
};

export function TrendRevenueChart({ period = "30d" }: { period?: string }) {
  const [metricMode, setMetricMode] = useState<"value" | "volume">("value");
  const data = revenueTrends[period] || revenueTrends["30d"];

  const currentBooked = data.reduce((acc, curr) => acc + curr.bookedCr, 0).toFixed(1);
  const currentPipeline = data.reduce((acc, curr) => acc + curr.pipelineCr, 0).toFixed(1);

  return (
    <Card className="glass overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Revenue & Pipeline Trajectory
              </CardTitle>
              <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +24.8%
              </span>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Live progression of deals in evaluation vs booked closings
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setMetricMode("value")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  metricMode === "value"
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Value (₹ Cr)
              </button>
              <button
                type="button"
                onClick={() => setMetricMode("volume")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  metricMode === "volume"
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Lead Inflow
              </button>
            </div>
          </div>
        </div>

        {/* Quick summary strip */}
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Realized Bookings:</span>
            <span className="ml-1.5 font-bold text-emerald-600 text-sm">
              ₹{currentBooked} Cr
            </span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div>
            <span className="text-slate-500 font-medium">Total Pipeline In-Play:</span>
            <span className="ml-1.5 font-bold text-indigo-600 text-sm">
              ₹{currentPipeline} Cr
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorBooked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E2E8F0"
                vertical={false}
              />
              <XAxis
                dataKey="period"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  metricMode === "value" ? `₹${val}Cr` : `${val}`
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="backdrop-blur-xl bg-white/95 border border-slate-200 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[170px]">
                        <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1">
                          {label}
                        </div>
                        {metricMode === "value" ? (
                          <>
                            <div className="flex items-center justify-between text-indigo-600">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                Pipeline:
                              </span>
                              <span className="font-bold">
                                ₹{payload[0]?.value} Cr
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-emerald-600">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Booked:
                              </span>
                              <span className="font-bold">
                                ₹{payload[1]?.value} Cr
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-between text-sky-600">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-sky-500" />
                              Leads:
                            </span>
                            <span className="font-bold">
                              {payload[0]?.value} inquiries
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {metricMode === "value" ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="pipelineCr"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPipeline)"
                    name="Pipeline Value"
                  />
                  <Area
                    type="monotone"
                    dataKey="bookedCr"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorBooked)"
                    name="Realized Bookings"
                  />
                </>
              ) : (
                <Area
                  type="monotone"
                  dataKey="leadsCount"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                  name="Leads Volume"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
