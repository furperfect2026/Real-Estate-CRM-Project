"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Users,
  CheckSquare,
  Clock,
  Sparkles,
  Calendar,
  Phone,
  MessageSquare,
  Plus,
  ArrowRight,
  Building2,
  TrendingUp,
  Flame,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TathastuLeadFlowInsights } from "@/components/dashboard/tathastu-lead-flow-insights";
import { PieLeadSources } from "@/components/dashboard/pie-lead-sources";
import { PieDealStages } from "@/components/dashboard/pie-deal-stages";
import { TrendRevenueChart } from "@/components/dashboard/trend-revenue-chart";
import { TeamLeaderboard } from "@/components/dashboard/team-leaderboard";
import { useActiveRole } from "@/hooks/use-active-role";
import { useNotifications } from "@/hooks/use-notifications";
import { PhoneCall, MapPin, UserCheck, ShieldCheck, PhoneMissed, Car } from "lucide-react";

export default function DashboardPage() {
  const { currentUser, isAdmin, isManager, isEmployee } = useActiveRole();
  const { urgentCount } = useNotifications();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  const periods: { id: "7d" | "30d" | "90d" | "1y"; label: string }[] = [
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "90d", label: "This Quarter" },
    { id: "1y", label: "This Year" },
  ];

  // Dynamic KPI values based on selected period
  const kpiData = {
    "7d": {
      pipeline: "₹4.8 Cr",
      leads: "64",
      visits: "14",
      closed: "₹1.2 Cr",
    },
    "30d": {
      pipeline: "₹18.4 Cr",
      leads: "342",
      visits: "48",
      closed: "₹4.2 Cr",
    },
    "90d": {
      pipeline: "₹48.6 Cr",
      leads: "980",
      visits: "142",
      closed: "₹12.8 Cr",
    },
    "1y": {
      pipeline: "₹142.0 Cr",
      leads: "3,450",
      visits: "520",
      closed: "₹38.5 Cr",
    },
  }[period];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Interactive Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 backdrop-blur-xl bg-white/90 border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Good afternoon, {currentUser.name.split(" ")[0]}!
            </h1>
            <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${currentUser.badge_color}`}>
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Admin Panel
                </>
              ) : isManager ? (
                <>
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Manager Panel ({currentUser.team_name})
                </>
              ) : (
                <>
                  <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
                  Caller Workbench
                </>
              )}
            </span>
          </div>
          <p className="text-xs lg:text-sm text-slate-500">
            {isAdmin
              ? "Company-wide sales velocity, omnichannel intake, and conversion intelligence."
              : isManager
              ? `Regional pipeline overview for ${currentUser.team_name}, team site visits, and caller quota performance.`
              : "Your personalized calling queue, client site tours, and conversion milestones."}
          </p>
        </div>

        {/* Period Selector and Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200">
            {periods.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPeriod(p.id);
                  toast.info(`Updated dashboard analytics for ${p.label}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === p.id
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Link href="/leads">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs border-0 text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              {isEmployee ? "Open Call Queue" : "Capture Lead"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards Grid (Tailored per Role) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={isAdmin ? "Active Pipeline Value" : isManager ? "Team Pipeline Value" : "My Calling Queue"}
          value={isAdmin ? kpiData.pipeline : isManager ? "₹9.8 Cr" : "18 Leads"}
          change="+18.4% MoM"
          trend="up"
          icon={isEmployee ? PhoneCall : Building2}
          subtext={isAdmin ? "Across 4 active projects" : isManager ? "Sales Team East deals" : "Active prospects to dial"}
          glowColor="indigo"
          href={isEmployee ? "/leads" : "/pipeline"}
        />
        <KpiCard
          title={isAdmin ? "Inbound Leads" : isManager ? "Team Lead Inflow" : "Calls Logged Today"}
          value={isAdmin ? kpiData.leads : isManager ? "186 Leads" : "14 Calls"}
          change="+24.2% MoM"
          trend="up"
          icon={isEmployee ? Phone : Users}
          subtext={isAdmin ? "99acres & Meta ads leading" : isManager ? "Allocated to callers" : "Callen dialer active"}
          glowColor="emerald"
          href="/leads"
        />
        <KpiCard
          title={isAdmin ? "Site Visits Conducted" : isManager ? "Team Site Visits" : "My Scheduled Visits"}
          value={isAdmin ? kpiData.visits : isManager ? "28 Scheduled" : "4 Visits"}
          change="+12.5% pace"
          trend="up"
          icon={Calendar}
          subtext={isEmployee ? "Upcoming client tours" : "8 scheduled today"}
          glowColor="amber"
          href="/site-visits"
        />
        <KpiCard
          title={isAdmin ? "Closed Revenue Bookings" : isManager ? "Team Revenue Booked" : "My Closed Bookings"}
          value={isAdmin ? kpiData.closed : isManager ? "₹2.4 Cr" : "₹1.15 Cr"}
          change="+31.8% MoM"
          trend="up"
          icon={TrendingUp}
          subtext={isEmployee ? "Unit 804 allotted" : "14 residential units sold"}
          glowColor="purple"
          href="/bookings"
        />
      </div>

      {/* Tathastu Infra Lead Flow & Conversion Intelligence (Admin & Manager only) */}
      {!isEmployee && <TathastuLeadFlowInsights />}

      {/* CALLER / USER WORKBENCH VIEW */}
      {isEmployee && (
        <div className="space-y-6">
          {/* Urgent Missed Follow-Up / Site Visit Alert Banner */}
          {urgentCount > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs animate-pulse">
                  <PhoneMissed className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-rose-950">
                      ⚠️ {urgentCount} Urgent Follow-Up & Site Visit Item{urgentCount > 1 ? "s" : ""} Due Today!
                    </h4>
                    <span className="text-[10px] font-extrabold uppercase bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded">
                      Immediate Action
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5">
                    Missed follow-up for <strong>Vikram Rao</strong> (Pride World City) & 1 site visit scheduled at 11:00 AM with cab pickup.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href="/leads">
                  <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-8 rounded-xl flex items-center gap-1.5 shadow-2xs">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Dial Missed Follow-Up</span>
                  </Button>
                </Link>
                <Link href="/site-visits">
                  <Button size="sm" variant="outline" className="border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold h-8 rounded-xl flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Today's Visit</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Caller Performance Progress Bar */}
          <Card className="glass border-purple-200 bg-gradient-to-r from-purple-50/70 via-white to-blue-50/50 shadow-xs">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200">
                    Daily Calling Goal
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Goal: 25 Calls / Day</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>14 Calls Completed</span>
                  <span className="text-xs text-emerald-600 font-semibold">(56% to Daily Target)</span>
                </h3>
                <div className="w-full md:w-80 h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full" style={{ width: '56%' }} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href="/leads">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold h-9 rounded-xl flex items-center gap-1.5 shadow-xs">
                    <PhoneCall className="w-3.5 h-3.5" />
                    Start Inbound Calling Queue
                  </Button>
                </Link>
                <Link href="/ai-assistant">
                  <Button variant="outline" className="border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-semibold h-9 rounded-xl flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Open AI Follow-Up Studio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Caller's Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Avg Conversation</span>
              <strong className="text-lg font-bold text-slate-900 mt-1 block">02m 45s</strong>
              <span className="text-[10px] text-emerald-600 font-medium">✓ Optimal engagement</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Connected Rate</span>
              <strong className="text-lg font-bold text-slate-900 mt-1 block">78.5%</strong>
              <span className="text-[10px] text-emerald-600 font-medium">↑ Above team avg</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Site Tours Scheduled</span>
              <strong className="text-lg font-bold text-slate-900 mt-1 block">4 Tours</strong>
              <span className="text-[10px] text-blue-600 font-medium">2 with Cab Pickup</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">AI Messages Sent</span>
              <strong className="text-lg font-bold text-slate-900 mt-1 block">12 WhatsApps</strong>
              <span className="text-[10px] text-purple-600 font-medium">1-Click dispatched</span>
            </div>
          </div>
        </div>
      )}

      {/* Row 1: Area Chart + Lead Sources (Admin & Manager View) */}
      {!isEmployee && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <TrendRevenueChart period={period} />
          </div>
          <div className="lg:col-span-5">
            <PieLeadSources period={period} />
          </div>
        </div>
      )}

      {/* Row 2: Pie Chart + Team Performance (Admin & Manager View) */}
      {!isEmployee && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <PieDealStages period={period} />
          </div>
          <div className="lg:col-span-7">
            <TeamLeaderboard />
          </div>
        </div>
      )}

      {/* Row 3: Live Feed & AI Co-Pilot Insights */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Live Activity & Hot Leads Stream */}
        <Card className="lg:col-span-7 glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Recent High-Intent Leads & Activity
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Real-time omnichannel inquiries requiring executive follow-up
                </CardDescription>
              </div>
              <Link href="/leads">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-slate-100"
                >
                  View All <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  id: "1",
                  name: "Vikram Malhotra",
                  project: "Pride World City (3 BHK)",
                  budget: "₹85L - ₹1.1Cr",
                  source: "Facebook Ads",
                  sourceColor: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
                  score: 92,
                  time: "10 mins ago",
                  phone: "9820192831",
                },
                {
                  id: "2",
                  name: "Pooja Deshmukh",
                  project: "Godrej Sky Greens (2 BHK)",
                  budget: "₹65L - ₹75L",
                  source: "99acres",
                  sourceColor: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
                  score: 86,
                  time: "32 mins ago",
                  phone: "9871234509",
                },
                {
                  id: "3",
                  name: "Rajesh Kulkarni",
                  project: "VTP Sierra Luxury Villa",
                  budget: "₹1.8Cr - ₹2.2Cr",
                  source: "MagicBricks",
                  sourceColor: "bg-amber-50 text-amber-700 border-amber-200/80",
                  score: 94,
                  time: "1 hr ago",
                  phone: "9988776655",
                },
              ].map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 transition-all border border-slate-200/60 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                      {lead.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {lead.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${lead.sourceColor}`}
                        >
                          {lead.source}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{lead.project}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">
                          {lead.budget}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200/60">
                    <div className="text-right sm:mr-2">
                      <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        AI Score: {lead.score}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lead.time}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${lead.phone}`}
                        className="p-2 rounded-lg bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 border border-slate-200/80 transition-colors shadow-2xs"
                        title="Call Lead"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/91${lead.phone}?text=Hi%20${encodeURIComponent(
                          lead.name
                        )},%20thank%20you%20for%20inquiring%20about%20${encodeURIComponent(
                          lead.project
                        )}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 border border-slate-200/80 transition-colors shadow-2xs"
                        title="WhatsApp Lead"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Co-Pilot Recommendation Widget */}
        <Card className="lg:col-span-5 glass bg-gradient-to-br from-white to-blue-50/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              Gemini AI Deal Co-Pilot
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Automated intelligence based on recent lead activity & behavioral triggers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  Closing Opportunity
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/80">
                  94% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                3 leads from the <span className="text-slate-900 font-bold">Pride World City</span> campaign have viewed the price sheets multiple times today. Assigned executive <span className="text-indigo-700 font-bold">Gayatri</span> has high closing momentum in this bracket.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={() => {
                    toast.success("AI Follow-up reminder dispatched to Gayatri via WhatsApp!");
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-xs text-xs font-medium h-8"
                >
                  Send Prompt to Rep
                </Button>
                <Link href="/ai-assistant" className="flex-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold h-8 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Launch AI Studio
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <div className="text-[11px] font-medium text-slate-500">
                  Round-Robin Health
                </div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  100% Balanced
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                  Average response: 4.2m
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <div className="text-[11px] font-medium text-slate-500">
                  Project Inflow
                </div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  4 Active Sites
                </div>
                <div className="text-[10px] text-indigo-600 font-semibold mt-1">
                  18.4 Cr pipeline value
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
