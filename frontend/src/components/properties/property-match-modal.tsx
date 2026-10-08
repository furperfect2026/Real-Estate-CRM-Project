"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  MessageCircle,
  PhoneCall,
  Calendar,
  Search,
  ExternalLink,
  ShieldCheck,
  MapPin,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Lead, PropertyMatchResult } from "@/lib/types";
import { useProperties } from "@/hooks/use-properties";
import { useLeads } from "@/hooks/use-leads";
import { toast } from "sonner";

interface PropertyMatchModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunchDialer?: (lead: Lead) => void;
}

export function PropertyMatchModal({
  lead,
  isOpen,
  onClose,
  onLaunchDialer,
}: PropertyMatchModalProps) {
  const { useGetProperties, matchClientWithProperties } = useProperties();
  const { data: properties = [] } = useGetProperties();
  const { updateStage } = useLeads();

  const [copiedPitchId, setCopiedPitchId] = useState<string | null>(null);
  const [copiedWaId, setCopiedWaId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  if (!lead) return null;

  const matchResults: PropertyMatchResult[] = matchClientWithProperties(lead, properties);

  // Filtered matches
  const filteredMatches = matchResults.filter((m) => {
    if (filterType === "HIGH_MATCH" && m.matchScore < 80) return false;
    if (filterType === "PERFECT_BUDGET" && m.budgetFit !== "PERFECT" && m.budgetFit !== "UNDER_BUDGET") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const p = m.property;
      return (
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const topMatch = matchResults[0];

  const handleCopyPitch = (id: string, pitch: string) => {
    navigator.clipboard.writeText(pitch);
    setCopiedPitchId(id);
    toast.success("AI phone pitch copied to clipboard! Read it directly to the customer.");
    setTimeout(() => setCopiedPitchId(null), 2500);
  };

  const handleSendWhatsApp = (match: PropertyMatchResult) => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(match.whatsappMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    toast.success(`Opening WhatsApp proposal for ${lead.first_name}...`);
  };

  const handleBookVisit = async (match: PropertyMatchResult) => {
    try {
      await updateStage({ leadId: lead.id, stage: "SITE_VISIT" });
      toast.success(
        `Site visit scheduled for ${lead.first_name} at ${match.property.name}! Stage updated to SITE VISIT.`
      );
      onClose();
    } catch (e) {
      toast.error("Failed to update lead status");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl bg-white border-slate-200 text-slate-900 p-0 overflow-hidden shadow-2xl rounded-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>AI Property Recommendation & Client Matching</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                    Caller Live Copilot
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Instant matching table comparing property inventory specifications vs client requirement with verbatim phone pitch.
                </DialogDescription>
              </div>
            </div>

            {/* Quick Action Dial */}
            {onLaunchDialer && (
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onLaunchDialer(lead);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3.5 h-8 rounded-xl flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call with Callen</span>
              </Button>
            )}
          </div>

          {/* Client Profile Highlight Strip */}
          <div className="mt-3 p-3 bg-white border border-blue-100 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                {lead.first_name[0]}{lead.last_name[0] || ""}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900">
                  {lead.first_name} {lead.last_name}
                </span>
                <span className="text-xs text-slate-500 ml-2 font-mono">
                  {lead.phone}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                💰 Budget: {lead.budget || "Not Specified"}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                📍 Target Project: {lead.project_name || "Any Tathastu Project"}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                Stage: {lead.stage}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Controls */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search property, location, BHK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 h-8 bg-white border-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => setFilterType("ALL")}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterType === "ALL"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              All Matches ({matchResults.length})
            </button>
            <button
              onClick={() => setFilterType("HIGH_MATCH")}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterType === "HIGH_MATCH"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              🎯 High Match (&gt;80%)
            </button>
            <button
              onClick={() => setFilterType("PERFECT_BUDGET")}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterType === "PERFECT_BUDGET"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              💰 Budget Fit
            </button>
          </div>
        </div>

        {/* Body: Matching Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm">No properties match your filter</p>
              <p className="text-xs text-slate-400 mt-1">Try changing your search term or view all inventory.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map((m, index) => {
                const prop = m.property;
                const isTop = index === 0;

                return (
                  <div
                    key={prop.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isTop
                        ? "border-blue-400/80 bg-blue-50/20 shadow-md ring-2 ring-blue-500/10"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    {/* Card Header & AI Match Badge */}
                    <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">{prop.name}</h3>
                            {isTop && (
                              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold shadow-2xs">
                                🌟 Top AI Recommended Match
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {prop.location} • <span className="font-mono">{prop.rera_number}</span>
                          </p>
                        </div>
                      </div>

                      {/* Compatibility Score */}
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Compatibility</div>
                          <div className="text-sm font-extrabold text-blue-700">{m.matchScore}% Match</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center font-extrabold text-xs text-blue-800">
                          {m.matchScore}%
                        </div>
                      </div>
                    </div>

                    {/* MATCHING COMPARISON TABLE (Requested by User) */}
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50/50">
                              <th className="py-2 px-3 w-1/3">🏢 Property Specification & Description</th>
                              <th className="py-2 px-3 w-1/3">👤 Client Requirement</th>
                              <th className="py-2 px-3 w-1/3">⚡ AI Fit & Readiness</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr>
                              <td className="py-2.5 px-3 align-top">
                                <div className="font-bold text-slate-900 text-xs">{prop.price_display}</div>
                                <div className="text-[11px] text-slate-500">All-Inclusive Price</div>
                              </td>
                              <td className="py-2.5 px-3 align-top">
                                <div className="font-bold text-slate-900 text-xs">{lead.budget}</div>
                                <div className="text-[11px] text-slate-500">Client Stated Budget</div>
                              </td>
                              <td className="py-2.5 px-3 align-top">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                                    m.budgetFit === "PERFECT"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : m.budgetFit === "UNDER_BUDGET"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  {m.budgetFit === "PERFECT"
                                    ? "Perfect Budget Match"
                                    : m.budgetFit === "UNDER_BUDGET"
                                    ? "Under Budget (High Saving)"
                                    : "Slight Stretch"}
                                </span>
                              </td>
                            </tr>

                            <tr>
                              <td className="py-2.5 px-3 align-top">
                                <div className="font-bold text-slate-900 text-xs">{prop.type} ({prop.carpet_area})</div>
                                <div className="text-[11px] text-slate-500">{prop.possession}</div>
                              </td>
                              <td className="py-2.5 px-3 align-top">
                                <div className="font-bold text-slate-900 text-xs">{lead.project_name || "Tathastu Group"}</div>
                                <div className="text-[11px] text-slate-500">
                                  {lead.notes || "Seeking quality apartment"}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 align-top">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Configuration & Area Fit
                                </span>
                              </td>
                            </tr>

                            <tr>
                              <td className="py-2.5 px-3 align-top" colSpan={3}>
                                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                                  <p className="text-[11px] font-semibold text-slate-700">Property Description & Highlights:</p>
                                  <p className="text-xs text-slate-600 leading-relaxed">{prop.description}</p>
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {prop.key_highlights.map((h, i) => (
                                      <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                                        ✓ {h}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* VERBATIM CALLER SPEECH SCRIPT (Directly tell client) */}
                      <div className="mt-3 p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                              🗣️ Caller Direct Phone Pitch (Read out loud to client):
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyPitch(prop.id, m.pitchScript)}
                            className="h-7 text-xs text-amber-800 hover:bg-amber-100 font-semibold flex items-center gap-1 px-2"
                          >
                            {copiedPitchId === prop.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied Script!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Script</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed bg-white/80 p-3 rounded-lg border border-amber-200/70 italic">
                          &quot;{m.pitchScript}&quot;
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-400">
                          Added by: <span className="font-semibold text-slate-600">{prop.added_by}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendWhatsApp(m)}
                            className="h-8 text-xs font-semibold text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex items-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp Proposal</span>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleBookVisit(m)}
                            className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center gap-1.5 shadow-xs"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Schedule Site Visit</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-800">{filteredMatches.length}</span> matching properties for{" "}
            <span className="font-bold text-slate-800">{lead.first_name} {lead.last_name}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs border-slate-200"
          >
            Close Matcher
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
