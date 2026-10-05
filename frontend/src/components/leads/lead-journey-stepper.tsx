"use client";

import React from "react";
import { LeadStage } from "@/lib/types";
import { 
  Inbox, 
  UserPlus, 
  PhoneCall, 
  Star, 
  Calendar, 
  Handshake, 
  CheckCircle2, 
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

export const STAGES_FLOW: Array<{
  stage: LeadStage;
  label: string;
  icon: React.ElementType;
  activeColor: string;
  bgColor: string;
}> = [
  { stage: 'NEW_LEAD', label: 'New Lead', icon: Inbox, activeColor: 'text-blue-700 border-blue-500 bg-blue-50', bgColor: 'bg-blue-500' },
  { stage: 'ASSIGNED', label: 'Assigned', icon: UserPlus, activeColor: 'text-purple-700 border-purple-500 bg-purple-50', bgColor: 'bg-purple-500' },
  { stage: 'CALLING', label: 'Calling', icon: PhoneCall, activeColor: 'text-amber-700 border-amber-500 bg-amber-50', bgColor: 'bg-amber-500' },
  { stage: 'INTERESTED', label: 'Interested', icon: Star, activeColor: 'text-emerald-700 border-emerald-500 bg-emerald-50', bgColor: 'bg-emerald-500' },
  { stage: 'SITE_VISIT', label: 'Site Visit', icon: Calendar, activeColor: 'text-indigo-700 border-indigo-500 bg-indigo-50', bgColor: 'bg-indigo-500' },
  { stage: 'NEGOTIATION', label: 'Negotiation', icon: Handshake, activeColor: 'text-rose-700 border-rose-500 bg-rose-50', bgColor: 'bg-rose-500' },
  { stage: 'CONVERTED', label: 'Converted', icon: CheckCircle2, activeColor: 'text-teal-700 border-teal-500 bg-teal-50', bgColor: 'bg-teal-500' },
];

interface LeadJourneyStepperProps {
  currentStage: LeadStage;
  onStageChange?: (newStage: LeadStage) => void;
  interactive?: boolean;
}

export function LeadJourneyStepper({ currentStage, onStageChange, interactive = true }: LeadJourneyStepperProps) {
  const currentIndex = STAGES_FLOW.findIndex(s => s.stage === currentStage);

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="flex items-center min-w-max gap-1">
        {STAGES_FLOW.map((item, index) => {
          const Icon = item.icon;
          const isCompleted = currentIndex > index;
          const isCurrent = currentIndex === index;
          const isFuture = currentIndex < index;

          return (
            <React.Fragment key={item.stage}>
              <button
                type="button"
                disabled={!interactive}
                onClick={() => onStageChange && onStageChange(item.stage)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                  isCurrent && `${item.activeColor} ring-2 ring-primary/20 shadow-xs scale-105 z-10`,
                  isCompleted && "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80",
                  isFuture && "bg-white text-slate-400 border-slate-200/60 hover:text-slate-600 hover:border-slate-300",
                  !interactive && "cursor-default"
                )}
                title={interactive ? `Move stage to ${item.label}` : item.label}
              >
                <div className={cn(
                  "w-5 h-5 rounded-lg flex items-center justify-center text-[10px]",
                  isCurrent && "bg-white shadow-2xs",
                  isCompleted && "bg-slate-200 text-slate-800",
                  isFuture && "bg-slate-100 text-slate-400"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span>{item.label}</span>
              </button>

              {index < STAGES_FLOW.length - 1 && (
                <ChevronRight className={cn(
                  "w-3.5 h-3.5 shrink-0 transition-colors",
                  isCompleted ? "text-emerald-500" : "text-slate-300"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
