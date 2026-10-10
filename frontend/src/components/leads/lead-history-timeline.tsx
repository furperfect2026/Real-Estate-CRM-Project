"use client";

import React, { useState } from "react";
import { 
  PhoneCall, 
  PhoneForwarded, 
  MessageCircle, 
  Car, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Users, 
  ShieldAlert, 
  FileText, 
  Sparkles, 
  ArrowRight,
  Filter,
  Volume2,
  Calendar,
  Layers,
  Inbox
} from "lucide-react";
import { Lead, LeadActivity, ActivityType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AdminCallRecordingPlayer } from "./admin-call-recording-player";

interface LeadHistoryTimelineProps {
  lead: Lead;
  isAdmin?: boolean;
}

export function LeadHistoryTimeline({ lead, isAdmin = false }: LeadHistoryTimelineProps) {
  const [filterType, setFilterType] = useState<"ALL" | "CALLS" | "ASSIGNMENTS" | "MESSAGES" | "MILESTONES">("ALL");
  const [selectedCallAudioIndex, setSelectedCallAudioIndex] = useState<number | null>(null);

  // Derive activities from lead.activities or fallback to synthesize from call_logs and events
  const rawActivities: LeadActivity[] = lead.activities && lead.activities.length > 0 
    ? lead.activities 
    : [
        // Synthesize fallback baseline if not populated
        {
          id: "synth_1",
          lead_id: lead.id,
          type: "INTAKE",
          title: `Inquiry Received via ${lead.source}`,
          description: `Customer submitted interest in ${lead.project_name || "Tathastu Residency"} with budget ${lead.budget}. Initial contact phone ${lead.phone}.`,
          performed_by: "System Intake Gateway",
          performed_by_role: "System Ingestion",
          timestamp: lead.created_at,
          badge: "Ingestion"
        },
        ...(lead.manager_name ? [{
          id: "synth_2",
          lead_id: lead.id,
          type: "ASSIGNMENT" as ActivityType,
          title: "Tier 1: Manager Assigned",
          description: `Assigned to Sales Manager ${lead.manager_name} for pipeline distribution.`,
          performed_by: lead.assigned_by || "Rohit Nalpe (Super Admin)",
          performed_by_role: "Super Admin",
          timestamp: lead.assigned_at || lead.created_at,
          badge: "Admin Action"
        }] : []),
        ...(lead.employee_name ? [{
          id: "synth_3",
          lead_id: lead.id,
          type: "ASSIGNMENT" as ActivityType,
          title: "Tier 2: Caller Delegated",
          description: `Allocated to Caller ${lead.employee_name} for direct outreach.`,
          performed_by: lead.manager_name || "Sales Manager",
          performed_by_role: "Sales Manager",
          timestamp: lead.assigned_at || lead.created_at,
          badge: "Caller Delegated"
        }] : []),
        ...(lead.call_logs?.map((c, idx) => ({
          id: `synth_call_${c.id}`,
          lead_id: lead.id,
          type: (idx === 0 ? "FIRST_CALL" : "FOLLOW_UP_CALL") as ActivityType,
          title: idx === 0 ? `First Follow-Up Call (${Math.floor(c.duration_seconds / 60)}m ${c.duration_seconds % 60}s)` : `Follow-Up Call (${Math.floor(c.duration_seconds / 60)}m ${c.duration_seconds % 60}s)`,
          description: `${c.agent_name} logged disposition: ${c.outcome}. Notes: ${c.notes}`,
          performed_by: c.agent_name,
          performed_by_role: "Sales Caller",
          timestamp: c.timestamp,
          badge: idx === 0 ? "First Touchpoint" : "Follow-up",
          metadata: {
            duration_seconds: c.duration_seconds,
            call_outcome: c.outcome,
            recording_available: true
          }
        })) || [])
      ];

  // Sort activities chronologically (newest first for timeline)
  const sortedActivities = [...rawActivities].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Apply filters
  const filteredActivities = sortedActivities.filter((act) => {
    if (filterType === "CALLS") return act.type === "FIRST_CALL" || act.type === "FOLLOW_UP_CALL";
    if (filterType === "ASSIGNMENTS") return act.type === "ASSIGNMENT" || act.type === "ADMIN_OVERRIDE";
    if (filterType === "MESSAGES") return act.type === "WHATSAPP" || act.type === "NOTE";
    if (filterType === "MILESTONES") return act.type === "INTAKE" || act.type === "SITE_VISIT" || act.type === "STAGE_CHANGE";
    return true;
  });

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "INTAKE":
        return <Inbox className="w-4 h-4 text-blue-600" />;
      case "FIRST_CALL":
        return <PhoneCall className="w-4 h-4 text-emerald-600" />;
      case "FOLLOW_UP_CALL":
        return <PhoneForwarded className="w-4 h-4 text-indigo-600" />;
      case "WHATSAPP":
        return <MessageCircle className="w-4 h-4 text-teal-600" />;
      case "ASSIGNMENT":
        return <Users className="w-4 h-4 text-purple-600" />;
      case "ADMIN_OVERRIDE":
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case "SITE_VISIT":
        return <Car className="w-4 h-4 text-orange-600" />;
      case "STAGE_CHANGE":
        return <CheckCircle2 className="w-4 h-4 text-violet-600" />;
      case "NOTE":
        return <FileText className="w-4 h-4 text-slate-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case "INTAKE":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "FIRST_CALL":
        return "bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/20";
      case "FOLLOW_UP_CALL":
        return "bg-indigo-50 border-indigo-200 text-indigo-700";
      case "WHATSAPP":
        return "bg-teal-50 border-teal-200 text-teal-700";
      case "ASSIGNMENT":
        return "bg-purple-50 border-purple-200 text-purple-700";
      case "ADMIN_OVERRIDE":
        return "bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-500/20";
      case "SITE_VISIT":
        return "bg-orange-50 border-orange-200 text-orange-700";
      case "STAGE_CHANGE":
        return "bg-violet-50 border-violet-200 text-violet-700";
      case "NOTE":
        return "bg-slate-100 border-slate-200 text-slate-700";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">

      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Lead 360° Profile History & Audit Timeline
          </h3>
          <p className="text-xs text-slate-500">
            Chronological audit log: Lead Ingestion ➔ First Call ➔ Delegation ➔ Touchpoints ➔ Status
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === "ALL" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({sortedActivities.length})
          </button>
          <button
            onClick={() => setFilterType("CALLS")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === "CALLS" ? "bg-white text-emerald-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Calls & Audio
          </button>
          <button
            onClick={() => setFilterType("ASSIGNMENTS")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === "ASSIGNMENTS" ? "bg-white text-purple-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setFilterType("MESSAGES")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === "MESSAGES" ? "bg-white text-teal-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            WhatsApp & Notes
          </button>
          <button
            onClick={() => setFilterType("MILESTONES")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterType === "MILESTONES" ? "bg-white text-blue-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Milestones
          </button>
        </div>
      </div>

      {/* Quick Summary Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3">
          <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Initial Ingestion</span>
          <p className="text-xs font-extrabold text-blue-950 mt-0.5">{lead.source}</p>
          <p className="text-[11px] text-blue-800/80">{new Date(lead.created_at).toLocaleDateString()} ({Math.floor((Date.now() - new Date(lead.created_at).getTime()) / 86400000)} days ago)</p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
          <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">First Follow-Up Call</span>
          <p className="text-xs font-extrabold text-emerald-950 mt-0.5">
            {lead.call_logs && lead.call_logs.length > 0 ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Done by {lead.call_logs[lead.call_logs.length - 1].agent_name} ({Math.floor(lead.call_logs[lead.call_logs.length - 1].duration_seconds / 60)}m {lead.call_logs[lead.call_logs.length - 1].duration_seconds % 60}s)
              </span>
            ) : (
              <span className="text-slate-500">Pending First Call</span>
            )}
          </p>
          <p className="text-[11px] text-emerald-800/80">
            {lead.call_logs && lead.call_logs.length > 0 
              ? new Date(lead.call_logs[lead.call_logs.length - 1].timestamp).toLocaleDateString() 
              : "Not connected yet"}
          </p>
        </div>

        <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3">
          <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Assignment Chain</span>
          <p className="text-xs font-extrabold text-purple-950 mt-0.5 truncate">
            {lead.assigned_by || "Rohit Nalpe"} ➔ {lead.manager_name || "Manager"} ➔ {lead.employee_name || "Caller"}
          </p>
          <p className="text-[11px] text-purple-800/80">2-Tier Active Delegation</p>
        </div>
      </div>

      {/* Selected Audio Recording Playback Modal / Inline Box */}
      {selectedCallAudioIndex !== null && lead.call_logs && lead.call_logs[selectedCallAudioIndex] && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold text-slate-800">
              Auditing Recording for: {lead.call_logs[selectedCallAudioIndex].notes}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedCallAudioIndex(null)}
              className="text-xs h-7 text-slate-500 hover:text-slate-900"
            >
              Close Player
            </Button>
          </div>
          <AdminCallRecordingPlayer 
            callLog={lead.call_logs[selectedCallAudioIndex]}
            leadName={`${lead.first_name} ${lead.last_name}`}
          />
        </div>
      )}

      {/* Vertical Timeline Feed */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No events found for this filter.
          </div>
        ) : (
          filteredActivities.map((act, index) => {
            const isFirstCall = act.type === "FIRST_CALL";
            const isAdminOverride = act.type === "ADMIN_OVERRIDE";
            const dateObj = new Date(act.timestamp);

            return (
              <div key={act.id || index} className="relative group">
                
                {/* Node Dot */}
                <div className={`absolute -left-6 top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-xs z-10 ${getActivityColor(act.type)}`}>
                  {getActivityIcon(act.type)}
                </div>

                {/* Event Card */}
                <div className={`p-4 rounded-xl border transition-all duration-200 ${
                  isFirstCall 
                    ? "bg-emerald-50/40 border-emerald-300 shadow-xs" 
                    : isAdminOverride 
                    ? "bg-amber-50/40 border-amber-300 shadow-xs" 
                    : "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:shadow-xs"
                }`}>
                  
                  {/* Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{act.title}</span>
                      {act.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isFirstCall 
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : isAdminOverride
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-white text-slate-700 border-slate-200"
                        }`}>
                          {act.badge}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Body description */}
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {act.description}
                  </p>

                  {/* Performed by footer & action */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/50 text-[11px] text-slate-500">
                    <div>
                      By: <strong className="text-slate-800">{act.performed_by}</strong> 
                      {act.performed_by_role && <span className="text-slate-400"> ({act.performed_by_role})</span>}
                    </div>

                    {/* If call with recording available, show button to play */}
                    {(act.type === "FIRST_CALL" || act.type === "FOLLOW_UP_CALL") && (
                      <button
                        onClick={() => {
                          // Find matching call log index
                          const logIdx = lead.call_logs?.findIndex(c => c.timestamp === act.timestamp) ?? 0;
                          setSelectedCallAudioIndex(logIdx >= 0 ? logIdx : 0);
                        }}
                        className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Listen Call Audio
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
