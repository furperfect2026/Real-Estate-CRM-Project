"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Trophy, Award, CheckCircle } from "lucide-react";

interface SalesRep {
  name: string;
  shortName: string;
  dealsClosed: number;
  revenueLakhs: number;
  revenueCr: string;
  quotaPercent: number;
  avatarColor: string;
}

const repsData: SalesRep[] = [
  {
    name: "Gayatri",
    shortName: "Gayatri",
    dealsClosed: 14,
    revenueLakhs: 420,
    revenueCr: "₹4.2 Cr",
    quotaPercent: 128,
    avatarColor: "from-indigo-500 to-purple-600",
  },
  {
    name: "Siddhi Verma",
    shortName: "Siddhi V.",
    dealsClosed: 11,
    revenueLakhs: 380,
    revenueCr: "₹3.8 Cr",
    quotaPercent: 115,
    avatarColor: "from-emerald-500 to-teal-600",
  },
  {
    name: "Adhiraj Patil",
    shortName: "Adhiraj P.",
    dealsClosed: 9,
    revenueLakhs: 290,
    revenueCr: "₹2.9 Cr",
    quotaPercent: 96,
    avatarColor: "from-amber-500 to-orange-600",
  },
  {
    name: "Priya Nair",
    shortName: "Priya N.",
    dealsClosed: 7,
    revenueLakhs: 240,
    revenueCr: "₹2.4 Cr",
    quotaPercent: 88,
    avatarColor: "from-pink-500 to-rose-600",
  },
  {
    name: "Rohan Mehta",
    shortName: "Rohan M.",
    dealsClosed: 5,
    revenueLakhs: 180,
    revenueCr: "₹1.8 Cr",
    quotaPercent: 72,
    avatarColor: "from-sky-500 to-blue-600",
  },
];

export function TeamLeaderboard() {
  return (
    <Card className="glass overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Executive Sales Leaderboard
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Top closers ranked by booking volume and quota attainment
            </CardDescription>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200/80">
            <Award className="w-3 h-3" /> Q3 Pace
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-2 space-y-4">
        {/* Horizontal performance bar chart */}
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={repsData}
              margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
            >
              <XAxis
                type="number"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val / 100}Cr`}
              />
              <YAxis
                type="category"
                dataKey="shortName"
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const rep = payload[0].payload as SalesRep;
                    return (
                      <div className="backdrop-blur-xl bg-white/95 border border-slate-200 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-semibold text-slate-900">{rep.name}</div>
                        <div className="flex justify-between gap-4 text-emerald-600">
                          <span>Revenue:</span>
                          <span className="font-bold">{rep.revenueCr}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-600">
                          <span>Deals:</span>
                          <span className="font-bold">{rep.dealsClosed} units</span>
                        </div>
                        <div className="flex justify-between gap-4 text-amber-600">
                          <span>Quota:</span>
                          <span className="font-bold">{rep.quotaPercent}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="revenueLakhs"
                radius={[0, 6, 6, 0]}
                barSize={12}
              >
                {repsData.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={
                      index === 0
                        ? "#6366F1"
                        : index === 1
                        ? "#10B981"
                        : index === 2
                        ? "#F59E0B"
                        : "#38BDF8"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed ranking cards */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {repsData.slice(0, 3).map((rep, rank) => (
            <div
              key={rep.name}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 transition-colors border border-slate-200/60"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                  {rank + 1}
                </div>
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${rep.avatarColor} flex items-center justify-center text-xs font-bold text-white shadow-sm`}
                >
                  {rep.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {rep.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                    {rep.dealsClosed} deals closed
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-emerald-600">
                  {rep.revenueCr}
                </div>
                <div className="text-[10px] text-indigo-600 font-semibold">
                  {rep.quotaPercent}% of target
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
