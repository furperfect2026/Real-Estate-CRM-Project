"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GitFork, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Handshake, 
  TrendingUp, 
  Building2, 
  Sparkles,
  Inbox,
  Star,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FUNNEL_STAGES = [
  { id: "1", stageKey: "NEW_LEAD", name: "New Lead", count: 120, pct: "100%", drop: "-", color: "bg-blue-500", hoverColor: "hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20", icon: Inbox },
  { id: "2", stageKey: "ASSIGNED", name: "Assigned", count: 112, pct: "93.3%", drop: "93.3% allocated", color: "bg-purple-500", hoverColor: "hover:border-purple-500 hover:ring-2 hover:ring-purple-500/20", icon: ShieldCheck },
  { id: "3", stageKey: "CALLING", name: "Calling (Callen)", count: 98, pct: "81.6%", drop: "87.5% contacted", color: "bg-amber-500", hoverColor: "hover:border-amber-500 hover:ring-2 hover:ring-amber-500/20", icon: PhoneCall },
  { id: "4", stageKey: "INTERESTED", name: "Interested", count: 64, pct: "53.3%", drop: "65.3% qualified", color: "bg-emerald-500", hoverColor: "hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20", icon: Star },
  { id: "5", stageKey: "SITE_VISIT", name: "Site Visit", count: 38, pct: "31.6%", drop: "59.3% booked", color: "bg-indigo-500", hoverColor: "hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20", icon: Calendar },
  { id: "6", stageKey: "NEGOTIATION", name: "Negotiation", count: 22, pct: "18.3%", drop: "57.8% offer", color: "bg-rose-500", hoverColor: "hover:border-rose-500 hover:ring-2 hover:ring-rose-500/20", icon: Handshake },
  { id: "7", stageKey: "CONVERTED", name: "Converted (Client)", count: 16, pct: "13.3%", drop: "72.7% won", color: "bg-teal-500", hoverColor: "hover:border-teal-500 hover:ring-2 hover:ring-teal-500/20", icon: CheckCircle2 },
];

const SOURCE_INSIGHTS = [
  { source: "Google Ads", count: 34, visits: 12, converted: 6, roi: "4.8x", color: "text-blue-600 bg-blue-50" },
  { source: "Meta (FB / IG)", count: 42, visits: 14, converted: 5, roi: "3.9x", color: "text-indigo-600 bg-indigo-50" },
  { source: "99acres", count: 20, visits: 8, converted: 3, roi: "3.2x", color: "text-amber-600 bg-amber-50" },
  { source: "MagicBricks", count: 12, visits: 4, converted: 1, roi: "2.5x", color: "text-rose-600 bg-rose-50" },
  { source: "Website / Landing", count: 8, visits: 4, converted: 2, roi: "6.1x", color: "text-purple-600 bg-purple-50" },
  { source: "Walk-ins / Direct", count: 4, visits: 3, converted: 2, roi: "8.4x", color: "text-emerald-600 bg-emerald-50" },
];

export function TathastuLeadFlowInsights() {
  const [selectedTab, setSelectedTab] = useState<'FUNNEL' | 'HIERARCHY' | 'SOURCES'>('FUNNEL');

  return (
    <Card className="glass shadow-xs border-slate-200/80 bg-white">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <CardTitle className="text-base font-bold text-slate-900">
                Tathastu Infra • Lead Flow & Conversion Intelligence
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Click any stage to view and highlight its leads column in Sales Pipeline
            </CardDescription>
          </div>

          <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl">
            <button
              onClick={() => setSelectedTab('FUNNEL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedTab === 'FUNNEL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7-Stage Funnel
            </button>
            <button
              onClick={() => setSelectedTab('HIERARCHY')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedTab === 'HIERARCHY' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Assignment Matrix
            </button>
            <button
              onClick={() => setSelectedTab('SOURCES')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedTab === 'SOURCES' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Source ROI
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Tab 1: 7-Stage Conversion Funnel */}
        {selectedTab === 'FUNNEL' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {FUNNEL_STAGES.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.id}
                    href={`/pipeline?stage=${s.id}`}
                    className={`p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2 relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer group bg-white ${s.hoverColor}`}
                    title={`Click to view ${s.name} column in Sales Pipeline`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary uppercase flex items-center gap-1 transition-colors">
                        Stage {idx + 1}
                        <ChevronRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <div className="text-lg font-extrabold text-slate-900 group-hover:text-primary transition-colors">{s.count}</div>
                      <div className="text-[11px] font-semibold text-slate-700 truncate group-hover:text-slate-900">{s.name}</div>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-primary">{s.pct}</span>
                      <span className="text-slate-400 group-hover:text-slate-600">{s.drop}</span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-transparent group-hover:bg-primary transition-colors" />
                  </Link>
                );
              })}
            </div>

            {/* Visual Funnel Progression Bar */}
            <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Funnel Velocity & Overall Pipeline Conversion</span>
                <span className="text-emerald-700">Overall Win Rate: 13.3% (16 of 120 Converted)</span>
              </div>
              <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden flex">
                <Link href="/pipeline?stage=1" style={{ width: '20%' }} className="bg-blue-500 h-full hover:opacity-85 transition-opacity" title="Click to view Stage 1: New Lead in Pipeline" />
                <Link href="/pipeline?stage=2" style={{ width: '18%' }} className="bg-purple-500 h-full hover:opacity-85 transition-opacity" title="Click to view Stage 2: Assigned in Pipeline" />
                <Link href="/pipeline?stage=3" style={{ width: '20%' }} className="bg-amber-500 h-full hover:opacity-85 transition-opacity" title="Click to view Stage 3: Calling in Pipeline" />
                <Link href="/pipeline?stage=4" style={{ width: '18%' }} className="bg-emerald-500 h-full hover:opacity-85 transition-opacity" title="Click to view Stage 4: Interested in Pipeline" />
                <Link href="/pipeline?stage=5" style={{ width: '12%' }} className="bg-indigo-500 h-full hover:opacity-85 transition-opacity" title="Click to view Stage 5: Site Visit in Pipeline" />
                <Link href="/pipeline?stage=6" style={{ width: '8%' }} className="bg-rose-500 h-full hover:opacity-85 transition-opacity" title="Click to view Stage 6: Negotiation in Pipeline" />
                <Link href="/pipeline?stage=7" style={{ width: '4%' }} className="bg-teal-500 h-full hover:opacity-85 transition-opacity" title="Click to view Stage 7: Converted in Pipeline" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Average First Contact SLA: <strong>14 Mins via Callen</strong></span>
                <span>Avg. Cycle Length: <strong>18 Days</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 2-Tier Assignment Hierarchy Performance */}
        {selectedTab === 'HIERARCHY' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Manager 1: Anmol (Sales Manager) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      AN
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Anmol</h4>
                      <p className="text-[10px] text-slate-500">Sales Manager (MGR-001) • 64 Leads Allocated</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    9 Closed (₹6.8 Cr)
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Callers & Executives</p>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">Gayatri</span>
                      <p className="text-[10px] text-slate-500">Sales Executive & Caller (CLR-001) • 88 calls logged</p>
                    </div>
                    <span className="font-bold text-slate-700 text-xs">5 Visits / 4 Closed</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">Direct Inbound Desk</span>
                      <p className="text-[10px] text-slate-500">32 leads • 76 calls logged</p>
                    </div>
                    <span className="font-bold text-slate-700 text-xs">6 Visits / 5 Closed</span>
                  </div>
                </div>
              </div>

              {/* Manager 2: Priya Sharma (Team West) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      PS
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Priya Sharma</h4>
                      <p className="text-[10px] text-slate-500">Sales Manager (West) • 48 Leads Allocated</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    7 Closed (₹5.4 Cr)
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Callers & Executives</p>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">Vikram Malhotra</span>
                      <p className="text-[10px] text-slate-500">24 leads • 64 calls logged</p>
                    </div>
                    <span className="font-bold text-slate-700 text-xs">4 Visits / 4 Closed</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">Sneha Kulkarni</span>
                      <p className="text-[10px] text-slate-500">24 leads • 59 calls logged</p>
                    </div>
                    <span className="font-bold text-slate-700 text-xs">4 Visits / 3 Closed</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Lead Source ROI */}
        {selectedTab === 'SOURCES' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-700 uppercase">Channel / Source</th>
                    <th className="px-4 py-2.5 text-center font-bold text-slate-700 uppercase">Captured</th>
                    <th className="px-4 py-2.5 text-center font-bold text-slate-700 uppercase">Site Visits</th>
                    <th className="px-4 py-2.5 text-center font-bold text-slate-700 uppercase">Converted</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-700 uppercase">Est. ROI</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {SOURCE_INSIGHTS.map((s) => (
                    <tr key={s.source} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap font-semibold text-slate-900 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${s.color}`}>
                          {s.source}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-center text-slate-700 font-bold">{s.count}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-center text-indigo-700 font-semibold">{s.visits}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-center text-emerald-700 font-bold">{s.converted}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right font-bold text-primary">{s.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
