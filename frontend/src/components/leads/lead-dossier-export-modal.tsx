"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Printer, 
  Download, 
  Building2, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  FileText,
  UserCheck
} from "lucide-react";
import { Lead } from "@/lib/types";
import { toast } from "sonner";

interface LeadDossierExportModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadDossierExportModal({ lead, isOpen, onClose }: LeadDossierExportModalProps) {
  if (!lead) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyDossier = () => {
    const text = `TATHASTU INFRA • CLIENT LEAD DOSSIER
Name: ${lead.first_name} ${lead.last_name}
Phone: ${lead.phone}
Email: ${lead.email || "N/A"}
Budget: ${lead.budget}
Project: ${lead.project_name || "Tathastu Residency"}
Stage: ${lead.stage}
Source: ${lead.source}
Manager: ${lead.manager_name || "Anmol"}
Caller: ${lead.employee_name || "Gayatri"}
Admin Notes: ${lead.admin_notes || "None"}
Call Count: ${lead.call_logs?.length || 0}`;

    navigator.clipboard.writeText(text);
    toast.success("Lead dossier summary copied to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white border-slate-200 text-slate-900 p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span className="font-extrabold text-sm tracking-wide uppercase">Tathastu Infra CRM</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Official Lead Dossier
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Generated for Management Review • Client Audit History
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyDossier}
              className="border-slate-700 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs h-8"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Copy
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 print:p-0 print:m-0 text-slate-900">
          
          {/* Top Banner */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {lead.first_name} {lead.last_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1.5 font-medium">
                <span className="flex items-center gap-1 font-mono text-slate-800">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {lead.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  {lead.email || "No email"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Added {new Date(lead.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {lead.stage.replace('_', ' ')}
              </span>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Lead Source: <strong className="text-slate-800">{lead.source}</strong>
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Interested Project</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{lead.project_name || "Tathastu Residency"}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Budget Range</span>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">{lead.budget || "₹65 L - ₹1.2 Cr"}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Assigned Manager</span>
              <p className="text-xs font-bold text-indigo-700 mt-0.5">{lead.manager_name || "Anmol"}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Assigned Caller</span>
              <p className="text-xs font-bold text-purple-700 mt-0.5">{lead.employee_name || "Gayatri"}</p>
            </div>
          </div>

          {/* Admin Management Notes */}
          {lead.admin_notes && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Management & Admin Confidential Notes
                </span>
                {lead.admin_sentiment && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                    {lead.admin_sentiment.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-950 font-sans leading-relaxed pt-1">
                {lead.admin_notes}
              </p>
            </div>
          )}

          {/* Call Logs & Interactions Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Call & Follow-Up Audit Log ({lead.call_logs?.length || 0} Recorded Sessions)
            </h3>
            
            {(!lead.call_logs || lead.call_logs.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
                No calls recorded yet.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-2.5">Date & Time</th>
                      <th className="p-2.5">Caller</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5">Outcome</th>
                      <th className="p-2.5">Summary / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lead.call_logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="p-2.5 font-mono text-[11px] text-slate-600">
                          {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">{log.agent_name}</td>
                        <td className="p-2.5 font-mono text-slate-600">
                          {Math.floor(log.duration_seconds / 60)}m {log.duration_seconds % 60}s
                        </td>
                        <td className="p-2.5">
                          <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {log.outcome}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-700 max-w-xs truncate">{log.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Signoff / Verification Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tathastu Infrastructure CRM • Certified Audit Record</span>
            <span>Generated by: Rohit Nalpe (Super Admin)</span>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
