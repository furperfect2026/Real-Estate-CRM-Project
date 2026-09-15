"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { useLeads } from "@/hooks/use-leads";
import { usePipelines } from "@/hooks/use-pipelines";
import { Lead, LeadStage } from "@/lib/types";
import { 
  Plus, 
  PhoneCall, 
  MessageCircle, 
  ChevronRight, 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  Sparkles,
  Inbox,
  UserPlus,
  Star,
  Calendar,
  Handshake,
  CheckCircle2,
  Filter,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CallenDialerDialog } from "@/components/leads/callen-dialer-dialog";
import { useActiveRole } from "@/hooks/use-active-role";
import { toast } from "sonner";

const STAGE_ORDER: LeadStage[] = [
  'NEW_LEAD',
  'ASSIGNED',
  'CALLING',
  'INTERESTED',
  'SITE_VISIT',
  'NEGOTIATION',
  'CONVERTED'
];

const STAGE_CONFIG: Record<string, { name: string; stageKey: LeadStage; color: string; bgBadge: string; textBadge: string; icon: React.ElementType }> = {
  "1": { name: "1. New Lead", stageKey: 'NEW_LEAD', color: "bg-blue-500", bgBadge: "bg-blue-50", textBadge: "text-blue-700", icon: Inbox },
  "2": { name: "2. Assigned", stageKey: 'ASSIGNED', color: "bg-purple-500", bgBadge: "bg-purple-50", textBadge: "text-purple-700", icon: UserPlus },
  "3": { name: "3. Calling", stageKey: 'CALLING', color: "bg-amber-500", bgBadge: "bg-amber-50", textBadge: "text-amber-800", icon: PhoneCall },
  "4": { name: "4. Interested", stageKey: 'INTERESTED', color: "bg-emerald-500", bgBadge: "bg-emerald-50", textBadge: "text-emerald-700", icon: Star },
  "5": { name: "5. Site Visit", stageKey: 'SITE_VISIT', color: "bg-indigo-500", bgBadge: "bg-indigo-50", textBadge: "text-indigo-700", icon: Calendar },
  "6": { name: "6. Negotiation", stageKey: 'NEGOTIATION', color: "bg-rose-500", bgBadge: "bg-rose-50", textBadge: "text-rose-700", icon: Handshake },
  "7": { name: "7. Converted", stageKey: 'CONVERTED', color: "bg-teal-500", bgBadge: "bg-teal-50", textBadge: "text-teal-700", icon: CheckCircle2 },
};

function resolveStageId(param: string | null): string | null {
  if (!param) return null;
  const clean = param.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean === "1" || clean === "newlead") return "1";
  if (clean === "2" || clean === "assigned") return "2";
  if (clean === "3" || clean === "calling") return "3";
  if (clean === "4" || clean === "interested") return "4";
  if (clean === "5" || clean === "sitevisit") return "5";
  if (clean === "6" || clean === "negotiation") return "6";
  if (clean === "7" || clean === "converted" || clean === "client") return "7";
  return clean;
}

function PipelineBoardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stageQueryParam = searchParams.get('stage');

  const { leads, isLoading: isLoadingLeads, updateStage } = useLeads();
  const { stages, isLoadingStages } = usePipelines();
  const { currentUser, isAdmin, isManager, isEmployee } = useActiveRole();
  const [dialerLead, setDialerLead] = useState<Lead | null>(null);
  
  // Highlighted stage state
  const [highlightedStageId, setHighlightedStageId] = useState<string | null>(() => resolveStageId(stageQueryParam));
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const pipelineStages = stages?.length > 0 ? stages : [
    { id: "1", name: "New Lead", order: 1, stage: "NEW_LEAD" },
    { id: "2", name: "Assigned", order: 2, stage: "ASSIGNED" },
    { id: "3", name: "Calling", order: 3, stage: "CALLING" },
    { id: "4", name: "Interested", order: 4, stage: "INTERESTED" },
    { id: "5", name: "Site Visit", order: 5, stage: "SITE_VISIT" },
    { id: "6", name: "Negotiation", order: 6, stage: "NEGOTIATION" },
    { id: "7", name: "Converted", order: 7, stage: "CONVERTED" },
  ];

  // Sync if query param changes
  useEffect(() => {
    const resolved = resolveStageId(stageQueryParam);
    if (resolved) {
      setHighlightedStageId(resolved);
    }
  }, [stageQueryParam]);

  // Smooth scroll to highlighted column when it changes
  useEffect(() => {
    if (highlightedStageId && columnRefs.current[highlightedStageId]) {
      const timer = setTimeout(() => {
        columnRefs.current[highlightedStageId]?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [highlightedStageId]);

  if (isLoadingLeads || isLoadingStages) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-slate-500 text-sm">
        Loading Tathastu Infra pipeline...
      </div>
    );
  }

  // Filter leads based on active role
  const roleFilteredLeads = leads?.filter((lead: Lead) => {
    if (isAdmin) return true;
    if (isManager) {
      return lead.manager_id === currentUser.team_id || lead.manager_name === currentUser.name;
    }
    if (isEmployee) {
      return lead.employee_id === currentUser.id || lead.employee_name === currentUser.name;
    }
    return true;
  }) || [];

  // Group leads by pipeline_stage_id
  const leadsByStage = pipelineStages.reduce((acc: Record<string, Lead[]>, stage: any) => {
    acc[stage.id] = roleFilteredLeads.filter((lead: Lead) => (lead.pipeline_stage_id || "1").toString() === stage.id.toString()) || [];
    return acc;
  }, {} as Record<string, Lead[]>);

  const handleAdvanceStage = async (lead: Lead, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentStageIdx = STAGE_ORDER.indexOf(lead.stage || 'NEW_LEAD');
    if (currentStageIdx < STAGE_ORDER.length - 1) {
      const nextStage = STAGE_ORDER[currentStageIdx + 1];
      await updateStage({ leadId: lead.id, stage: nextStage });
      toast.success(`${lead.first_name} advanced to ${nextStage.replace('_', ' ')}!`);
    }
  };
  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="max-w-[1700px] w-full mx-auto flex flex-col h-full space-y-6">
        
        {/* Header */}
        <div className="glass rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 bg-white">
          <PageHeader 
            title="Tathastu Infra Sales Pipeline" 
            description="Visual 7-stage conversion board: New Lead ➔ Assigned ➔ Calling ➔ Interested ➔ Site Visit ➔ Negotiation ➔ Converted." 
          />
          <div className="flex items-center gap-2">
            <Link href="/leads">
              <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 rounded-xl">
                View All Leads
              </Button>
            </Link>
            <Link href="/leads">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs text-xs font-semibold h-9 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Lead
              </Button>
            </Link>
          </div>
        </div>

        {/* Stage Focus Banner & Quick Switcher */}
        <div className="space-y-3">
          {highlightedStageId && (
            <div className="p-3.5 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <span className="font-bold text-slate-900">
                    Highlighted Column: {STAGE_CONFIG[highlightedStageId]?.name || `Stage ${highlightedStageId}`}
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Auto-scrolled and illuminated from Dashboard. Click other stage chips below or click clear to view all columns equally.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setHighlightedStageId(null)}
                className="text-xs h-8 border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold shadow-2xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear Highlight
              </Button>
            </div>
          )}

          {/* Quick Stage Switcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Focus:
            </span>
            <button
              onClick={() => setHighlightedStageId(null)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                !highlightedStageId 
                  ? "bg-slate-900 text-white shadow-xs font-bold" 
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              All Columns ({pipelineStages.length})
            </button>
            {pipelineStages.map((stage: any) => {
              const conf = STAGE_CONFIG[stage.id] || STAGE_CONFIG["1"];
              const isSelected = highlightedStageId === stage.id;
              const count = leadsByStage[stage.id]?.length || 0;
              const StageIcon = conf.icon;

              return (
                <button
                  key={stage.id}
                  onClick={() => setHighlightedStageId(isSelected ? null : stage.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                    isSelected 
                      ? "bg-indigo-600 text-white border-indigo-700 shadow-md font-bold scale-105" 
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <StageIcon className={`w-3 h-3 ${isSelected ? "text-white" : "text-slate-500"}`} />
                  <span>{conf.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kanban Board Container */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden rounded-2xl bg-slate-100/70 border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex gap-4 h-full min-w-max items-start">
            
            {pipelineStages.map((stage: any) => {
              const stageLeads = leadsByStage[stage.id] || [];
              const conf = STAGE_CONFIG[stage.id] || STAGE_CONFIG["1"];
              const StageIcon = conf.icon;
              const isHighlighted = highlightedStageId === stage.id;
              
              return (
                <div 
                  key={stage.id}
                  ref={(el) => { columnRefs.current[stage.id] = el; }}
                  className={`w-80 flex flex-col h-full bg-white rounded-2xl flex-shrink-0 relative overflow-hidden transition-all duration-300 ${
                    isHighlighted 
                      ? "ring-4 ring-indigo-500 shadow-2xl shadow-indigo-500/25 border-2 border-indigo-600 scale-[1.015] z-10" 
                      : "border border-slate-200 shadow-xs hover:border-slate-300"
                  }`}
                >
                  {/* Highlight Header Banner when selected */}
                  {isHighlighted && (
                    <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 text-white px-3 py-1.5 flex items-center justify-between text-[11px] font-bold tracking-wide animate-pulse shrink-0">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        Selected Column Focus
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHighlightedStageId(null);
                        }}
                        className="text-white/90 hover:text-white text-[10px] bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5"
                        title="Clear highlight"
                      >
                        ✕ Clear
                      </button>
                    </div>
                  )}

                  {/* Stage Header */}
                  <div 
                    onClick={() => setHighlightedStageId(isHighlighted ? null : stage.id)}
                    className={`p-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 cursor-pointer transition-colors ${
                      isHighlighted ? "bg-indigo-50/70" : "bg-slate-50/80 hover:bg-slate-100/60"
                    }`}
                    title="Click to highlight this stage"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${conf.bgBadge} ${conf.textBadge}`}>
                        <StageIcon className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs">{conf.name}</h3>
                      <span className={`text-[11px] px-2 py-0.2 rounded-full font-bold ${
                        isHighlighted ? "bg-indigo-600 text-white" : "bg-slate-200/80 text-slate-700"
                      }`}>
                        {stageLeads.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[calc(100vh-280px)]">
                    {stageLeads.length === 0 ? (
                      <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs text-center p-3">
                        <StageIcon className="w-5 h-5 mb-1 text-slate-300" />
                        <span>No leads in this stage</span>
                      </div>
                    ) : (
                      stageLeads.map((lead: Lead) => (
                        <div 
                          key={lead.id}
                          className="group bg-white border border-slate-200 hover:border-primary/40 rounded-xl p-3.5 hover:shadow-md transition-all shadow-2xs space-y-2.5"
                        >
                          {/* Client Name & Project */}
                          <div className="flex justify-between items-start">
                            <div>
                              <Link href={`/leads/${lead.id}`}>
                                <h4 className="font-bold text-slate-900 text-xs hover:text-primary transition-colors">
                                  {lead.first_name} {lead.last_name}
                                </h4>
                              </Link>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {lead.project_name || "Tathastu Residency"}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                              {lead.source}
                            </span>
                          </div>

                          {/* Budget & Assignment Chips */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                              {lead.budget || "₹50L - ₹1Cr"}
                            </span>

                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                              {lead.employee_name ? (
                                <span className="flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-md font-semibold">
                                  <UserCheck className="w-3 h-3" />
                                  {lead.employee_name.split(' ')[0]}
                                </span>
                              ) : lead.manager_name ? (
                                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-md font-semibold">
                                  <ShieldCheck className="w-3 h-3" />
                                  {lead.manager_name.split(' ')[0]}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">Unassigned</span>
                              )}
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                            <div className="flex items-center gap-1.5">
                              {/* Callen Trigger */}
                              <Button
                                size="sm"
                                onClick={() => setDialerLead(lead)}
                                className="h-6 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                                title="Call with Callen"
                              >
                                <PhoneCall className="w-3 h-3" />
                                <span>Callen</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`, '_blank')}
                                className="h-6 px-1.5 border-slate-200 text-teal-700 hover:bg-teal-50"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </Button>
                            </div>

                            {/* Advance Stage Button */}
                            {stage.id !== "7" && (
                              <button
                                type="button"
                                onClick={(e) => handleAdvanceStage(lead, e)}
                                className="text-[11px] font-bold text-primary hover:text-primary/80 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                                title="Move to Next Stage"
                              >
                                <span>Advance</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
            
          </div>
        </div>
      </div>

      {/* In-App Callen Dialer Dialog */}
      <CallenDialerDialog 
        lead={dialerLead}
        isOpen={!!dialerLead}
        onClose={() => setDialerLead(null)}
      />
    </div>
  );
}

export default function PipelinePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[400px] flex items-center justify-center text-slate-500 text-sm">
        Loading Tathastu Infra pipeline...
      </div>
    }>
      <PipelineBoardContent />
    </Suspense>
  );
}
