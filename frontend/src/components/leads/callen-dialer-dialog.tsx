"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, PhoneCall, PhoneOff, Clock, User, CheckCircle2, Calendar, AlertCircle, Building2, Sparkles, Copy, Check } from "lucide-react";
import { Lead, CallLog, LeadStage } from "@/lib/types";
import { useLeads } from "@/hooks/use-leads";
import { useProperties } from "@/hooks/use-properties";
import { toast } from "sonner";

interface CallenDialerDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: string;
}

export function CallenDialerDialog({ lead, isOpen, onClose, currentUser = "Gayatri" }: CallenDialerDialogProps) {
  const { logCall } = useLeads();
  const { useGetProperties, matchClientWithProperties } = useProperties();
  const { data: properties = [] } = useGetProperties();
  const [callState, setCallState] = useState<'CONNECTING' | 'IN_CALL' | 'DISPOSITION'>('CONNECTING');
  const [seconds, setSeconds] = useState(0);
  const [outcome, setOutcome] = useState<CallLog['outcome']>('CONNECTED');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('Tomorrow at 11:00 AM');
  const [isSaving, setIsSaving] = useState(false);
  const [isCopiedPitch, setIsCopiedPitch] = useState(false);

  const matchedList = lead ? matchClientWithProperties(lead, properties) : [];
  const topMatch = matchedList[0];

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isOpen) {
      setCallState('CONNECTING');
      setSeconds(0);
      setNotes('');
      setOutcome('CONNECTED');

      // Simulate connected after 1.5 seconds
      const timeout = setTimeout(() => {
        setCallState('IN_CALL');
      }, 1500);

      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);

      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    }
  }, [isOpen]);

  if (!lead) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallState('DISPOSITION');
  };

  const handleSaveCallLog = async () => {
    setIsSaving(true);
    try {
      const callLog: CallLog = {
        id: `call_${Date.now()}`,
        timestamp: new Date().toISOString(),
        duration_seconds: seconds,
        agent_name: currentUser,
        outcome,
        notes: notes || `Call completed with outcome: ${outcome}`,
        follow_up_date: outcome === 'CALLBACK' || outcome === 'SCHEDULED_VISIT' ? followUpDate : null,
      };

      // Determine next lead stage based on Callen disposition
      let nextStage: LeadStage = 'CALLING';
      if (outcome === 'SCHEDULED_VISIT') {
        nextStage = 'SITE_VISIT';
      } else if (outcome === 'CONNECTED') {
        nextStage = 'INTERESTED';
      } else if (outcome === 'NOT_INTERESTED') {
        nextStage = 'LOST';
      }

      await logCall({ leadId: lead.id, callLog, nextStage });
      toast.success(`Call logged successfully. Lead stage updated to ${nextStage}!`);
      onClose();
    } catch (e) {
      toast.error("Failed to save call log");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white border-slate-200 text-slate-900 shadow-2xl p-0 overflow-hidden">
        
        {/* Header with Callen Branding */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-primary p-6 text-white text-center relative">
          <div className="flex items-center justify-center gap-2 mb-1">
            <PhoneCall className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
              Callen • Integrated Dialer
            </span>
          </div>
          <h3 className="text-2xl font-bold mt-2">{lead.first_name} {lead.last_name}</h3>
          <p className="text-sm text-blue-100 font-mono mt-0.5">{lead.phone}</p>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold">
            {callState === 'CONNECTING' && (
              <span className="bg-amber-400/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-full animate-pulse">
                Ringing...
              </span>
            )}
            {callState === 'IN_CALL' && (
              <span className="bg-emerald-400/20 text-emerald-100 border border-emerald-400/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Connected • {formatDuration(seconds)}
              </span>
            )}
            {callState === 'DISPOSITION' && (
              <span className="bg-white/20 text-white px-3 py-1 rounded-full">
                Call Ended • Total: {formatDuration(seconds)}
              </span>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {callState !== 'DISPOSITION' ? (
            <div className="space-y-6 text-center py-4">
              <div className="flex justify-center items-center gap-3">
                <div className="w-3 h-12 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-3 h-20 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-3 h-16 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-3 h-24 bg-teal-500 rounded-full animate-bounce delay-200"></div>
                <div className="w-3 h-14 bg-blue-500 rounded-full animate-bounce delay-150"></div>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-md mx-auto flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-700">Project: {lead.project_name || "Tathastu Residency"}</span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span>Budget: {lead.budget || "₹50L - ₹1Cr"}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  {lead.stage}
                </span>
              </div>

              {/* 🎯 Real-Time AI Property Pitch Card */}
              {topMatch && (
                <div className="text-left bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-1.5 shadow-2xs max-w-md mx-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>AI Matched Property ({topMatch.matchScore}% Match):</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(topMatch.pitchScript);
                        setIsCopiedPitch(true);
                        toast.success("Speech pitch copied!");
                        setTimeout(() => setIsCopiedPitch(false), 2000);
                      }}
                      className="text-[10px] text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1"
                    >
                      {isCopiedPitch ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopiedPitch ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="text-[11px] font-bold text-slate-900 flex items-center justify-between">
                    <span>{topMatch.property.name}</span>
                    <span className="text-blue-700">{topMatch.property.price_display}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium bg-white/80 p-2 rounded-lg border border-amber-100 italic leading-relaxed">
                    &quot;{topMatch.pitchScript}&quot;
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  onClick={handleEndCall}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl px-8 py-6 text-base font-bold shadow-lg shadow-rose-600/25 flex items-center gap-2 mx-auto"
                >
                  <PhoneOff className="w-5 h-5" />
                  End Call & Log Notes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Call Outcome (Disposition)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'CONNECTED', label: 'Interested / Connected', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
                    { id: 'SCHEDULED_VISIT', label: '📅 Scheduled Site Visit', color: 'text-indigo-700 bg-indigo-50 border-indigo-300' },
                    { id: 'CALLBACK', label: '⏰ Callback Requested', color: 'text-amber-700 bg-amber-50 border-amber-300' },
                    { id: 'BUSY', label: 'Line Busy / No Answer', color: 'text-slate-700 bg-slate-100 border-slate-300' },
                    { id: 'NOT_INTERESTED', label: 'Not Interested / Lost', color: 'text-rose-700 bg-rose-50 border-rose-300' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOutcome(item.id as any)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all text-left ${
                        outcome === item.id 
                          ? `${item.color} ring-2 ring-primary/20 shadow-xs` 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {(outcome === 'CALLBACK' || outcome === 'SCHEDULED_VISIT') && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    {outcome === 'SCHEDULED_VISIT' ? 'Site Visit Date & Time' : 'Callback Time'}
                  </Label>
                  <Input 
                    value={followUpDate} 
                    onChange={(e) => setFollowUpDate(e.target.value)} 
                    placeholder="e.g. Tomorrow at 11:30 AM" 
                    className="bg-slate-50 border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Call Summary & Client Feedback</Label>
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record client requirements, budget confirmation, specific unit preferences..."
                  className="min-h-[90px] bg-slate-50 border-slate-300 text-slate-900 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveCallLog}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs text-xs font-medium px-5 py-2"
                >
                  {isSaving ? "Saving..." : "Save Log & Update Stage"}
                </Button>
              </div>
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
