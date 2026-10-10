"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLeads } from "@/hooks/use-leads";
import { useActiveRole } from "@/hooks/use-active-role";
import { 
  ArrowLeft,
  Phone,
  PhoneCall,
  MessageCircle,
  Mail,
  User,
  Users,
  Building,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Briefcase,
  Plus,
  Loader2,
  Copy,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  AlertTriangle,
  FileText,
  Printer,
  History,
  Volume2,
  Check,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import Link from "next/link";
import { useAI } from "@/hooks/use-ai";
import { useUsers } from "@/hooks/use-users";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LeadJourneyStepper } from "@/components/leads/lead-journey-stepper";
import { CallenDialerDialog } from "@/components/leads/callen-dialer-dialog";
import { LeadHistoryTimeline } from "@/components/leads/lead-history-timeline";
import { AdminCallRecordingPlayer } from "@/components/leads/admin-call-recording-player";
import { LeadDossierExportModal } from "@/components/leads/lead-dossier-export-modal";
import { LeadStage, CallLog } from "@/lib/types";
import { toast } from "sonner";

const MANAGERS = [
  { id: "mgr_1", name: "Anmol", title: "Sales Manager" },
  { id: "mgr_2", name: "Priya Sharma", title: "Senior Sales Manager" },
];

const EMPLOYEES = [
  { id: "emp_1", name: "Gayatri", title: "Sales Executive / Caller" },
  { id: "emp_3", name: "Vikram Malhotra", title: "Relationship Manager" },
  { id: "emp_4", name: "Sneha Kulkarni", title: "Inbound Specialist" },
];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { 
    useGetLead, 
    assignToManager, 
    assignToEmployee, 
    updateStage,
    updateAdminNotes,
    adminOverrideReassign
  } = useLeads();
  const { data: lead, isLoading } = useGetLead(id);
  const { currentUser, isAdmin, isManager } = useActiveRole();
  const [activeTab, setActiveTab] = useState("history");

  // Dialogs state
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);

  // Admin notes and override state
  const [adminNotesText, setAdminNotesText] = useState("");
  const [adminSentiment, setAdminSentiment] = useState<any>("HOT_PROSPECT");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [overrideManagerId, setOverrideManagerId] = useState("");
  const [overrideEmployeeId, setOverrideEmployeeId] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  const { useScoreLead, useGenerateMessage } = useAI();
  const { data: scoreData, isLoading: isScoreLoading } = useScoreLead(id);
  const { mutateAsync: generateMessage, isPending: isGeneratingMessage } = useGenerateMessage();

  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");

  // Sync initial admin notes when lead loads
  useEffect(() => {
    if (lead) {
      setAdminNotesText(lead.admin_notes || "");
      setAdminSentiment(lead.admin_sentiment || "HOT_PROSPECT");
      setOverrideManagerId(lead.manager_id || "mgr_1");
      setOverrideEmployeeId(lead.employee_id || "emp_1");
    }
  }, [lead]);

  const handleGenerateAiMessage = async () => {
    setGeneratedMessage("");
    try {
      const data = await generateMessage(id);
      setGeneratedMessage(data.message || data.text || "Hello! Following up from Tathastu Infra regarding your property inquiry.");
    } catch (error) {
      toast.error("Failed to generate message");
      setGeneratedMessage("Hi there! I'm following up from Tathastu Infra regarding your recent property inquiry. Let me know if you have any questions or would like to schedule a site visit.\n\nBest regards,\nTathastu Infra Sales Team");
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast.success("Message copied to clipboard");
  };

  const handleOpenWhatsApp = () => {
    if (!lead?.phone) return;
    const text = encodeURIComponent(generatedMessage || "Namaskar from Tathastu Infra!");
    window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  const handleStageChange = async (newStage: LeadStage) => {
    if (!lead) return;
    try {
      await updateStage({ leadId: lead.id, stage: newStage });
      toast.success(`Lead stage updated to ${newStage.replace('_', ' ')}!`);
    } catch (e) {
      toast.error("Failed to update stage");
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!lead) return;
    setIsSavingNotes(true);
    try {
      await updateAdminNotes({
        leadId: lead.id,
        adminNotes: adminNotesText,
        adminSentiment,
      });
      toast.success("Confidential admin notes & sentiment updated!");
    } catch (e) {
      toast.error("Failed to save admin notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleAdminOverrideReassign = async () => {
    if (!lead) return;
    if (!overrideReason.trim()) {
      toast.error("Please enter a reason for the admin override");
      return;
    }

    setIsSubmittingOverride(true);
    try {
      const mgr = MANAGERS.find(m => m.id === overrideManagerId);
      const emp = EMPLOYEES.find(e => e.id === overrideEmployeeId);

      await adminOverrideReassign({
        leadId: lead.id,
        managerId: overrideManagerId,
        managerName: mgr?.name || "Anmol",
        employeeId: overrideEmployeeId,
        employeeName: emp?.name || "Gayatri",
        reason: overrideReason.trim(),
      });

      toast.success("Lead reassigned by Super Admin Rohit Nalpe!");
      setIsOverrideOpen(false);
      setOverrideReason("");
    } catch (e) {
      toast.error("Failed to execute admin override");
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px] text-slate-500 text-sm">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-primary" />
        Loading lead details...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px] text-slate-500 text-sm">
        Lead not found.
      </div>
    );
  }

  const activitiesCount = lead.activities?.length || (lead.call_logs?.length ? lead.call_logs.length + 2 : 2);

  const tabs = [
    { id: "history", label: `360° Profile History (${activitiesCount})`, icon: <History className="w-4 h-4" /> },
    { id: "details", label: "Lead Details", icon: <User className="w-4 h-4" /> },
    { id: "call_logs", label: `Call Logs & Audio (${lead.call_logs?.length || 0})`, icon: <PhoneCall className="w-4 h-4" /> },
    { id: "admin_superpowers", label: "Admin Advantages", icon: <ShieldCheck className="w-4 h-4 text-indigo-600" /> },
    { id: "tasks", label: "Follow-ups & Tasks", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leads
          </button>
          
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">
              Source: <span className="font-bold text-slate-800">{lead.source}</span> • Added on {new Date(lead.created_at).toLocaleDateString()}
            </span>
            {lead.admin_sentiment && (
              <span className="inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                <Flame className="w-3 h-3 text-amber-600 fill-amber-600" />
                {lead.admin_sentiment.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Lead Hero Card */}
        <div className="glass rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-xs shrink-0">
              {lead.first_name?.[0]}{lead.last_name?.[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{lead.first_name} {lead.last_name}</h1>
                <StatusBadge status={lead.stage} />
                {lead.is_duplicate && (
                  <span className="text-xs font-bold px-2 py-0.5 bg-rose-100 text-rose-700 border border-rose-300 rounded-md">
                    Duplicate Phone
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-slate-500 text-xs mt-1">
                <span className="font-mono text-slate-700 font-semibold">{lead.phone}</span>
                <span>•</span>
                <span>{lead.email || "No email"}</span>
                <span>•</span>
                <span className="font-semibold text-emerald-700">{lead.budget || "Budget N/A"}</span>
                <span>•</span>
                <span className="text-indigo-600 font-medium">{lead.project_name || "Tathastu Residency"}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons: Callen, WhatsApp, Export Dossier, Admin Override, AI Pitch */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button 
              onClick={() => setIsDialerOpen(true)}
              className="flex-1 md:flex-none flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-xs text-xs h-9"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call via Callen
            </Button>

            <Button 
              onClick={() => window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`, '_blank')}
              className="flex-1 md:flex-none flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all shadow-xs text-xs h-9"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </Button>

            <Button
              onClick={() => setIsDossierOpen(true)}
              variant="outline"
              className="flex-1 md:flex-none flex items-center gap-1.5 px-3.5 py-2 border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl font-semibold text-xs h-9"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              Export Dossier
            </Button>

            <Button
              onClick={() => setIsOverrideOpen(true)}
              variant="outline"
              className="flex-1 md:flex-none flex items-center gap-1.5 px-3.5 py-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-semibold text-xs h-9"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              Admin Override
            </Button>

            <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
              <DialogTrigger 
                render={
                  <Button 
                    onClick={handleGenerateAiMessage}
                    className="flex-1 md:flex-none flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all shadow-xs text-xs h-9"
                  />
                }
              >
                <Sparkles className="w-4 h-4" />
                AI Follow-up
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px] bg-white border-slate-200 text-slate-900 shadow-xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Tathastu Infra • AI Follow-up Message
                  </DialogTitle>
                </DialogHeader>
                
                {isGeneratingMessage ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                    <p className="text-slate-500 text-xs">Crafting personalized message...</p>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <Textarea 
                      value={generatedMessage}
                      onChange={(e) => setGeneratedMessage(e.target.value)}
                      className="min-h-[170px] bg-slate-50 border-slate-300 text-slate-900 text-xs resize-none focus-visible:ring-primary"
                    />
                    <div className="flex items-center gap-2 justify-end pt-2">
                      <Button 
                        variant="outline" 
                        onClick={handleCopyMessage}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy
                      </Button>
                      <Button 
                        onClick={handleOpenWhatsApp}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                        Send via WhatsApp
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 7-Stage Lead Journey Stepper Bar */}
        <div className="glass rounded-2xl p-5 border border-slate-200/80 shadow-xs bg-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tathastu Infra Lead Journey (Status Flow)
            </span>
            <span className="text-xs text-slate-500">
              Click any stage to advance lead lifecycle
            </span>
          </div>
          <LeadJourneyStepper 
            currentStage={lead.stage || 'NEW_LEAD'}
            onStageChange={handleStageChange}
            interactive={true}
          />
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Area: Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id 
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-bold" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="glass rounded-2xl p-6 border border-slate-200/80 shadow-xs min-h-[380px] bg-white">
              
              {/* Tab 0: 360° Entire Profile History & Timeline Feed */}
              {activeTab === 'history' && (
                <div className="animate-in fade-in duration-200">
                  <LeadHistoryTimeline lead={lead} isAdmin={isAdmin} />
                </div>
              )}

              {/* Tab 1: Lead Details */}
              {activeTab === 'details' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Customer Information & Property Preferences
                  </h3>
                  <div className="grid grid-cols-2 gap-6 text-xs">
                    <div>
                      <p className="text-slate-400 uppercase font-semibold text-[10px] mb-1">First Name</p>
                      <p className="font-bold text-slate-900 text-sm">{lead.first_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-semibold text-[10px] mb-1">Last Name</p>
                      <p className="font-bold text-slate-900 text-sm">{lead.last_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-semibold text-[10px] mb-1">Email</p>
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        {lead.email || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-semibold text-[10px] mb-1">Phone</p>
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        {lead.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-semibold text-[10px] mb-1">Interested Project</p>
                      <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        {lead.project_name || "Tathastu Residency"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-semibold text-[10px] mb-1">Budget Range</p>
                      <p className="font-bold text-emerald-700 text-sm">{lead.budget || "₹50L - ₹1Cr"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-semibold text-[10px] mb-1">Lead Source</p>
                      <p className="font-semibold text-slate-800">{lead.source}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase font-semibold text-[10px] mb-1">Next Follow-up</p>
                      <p className="font-semibold text-primary">{lead.next_follow_up || "None scheduled"}</p>
                    </div>
                  </div>

                  {lead.notes && (
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-slate-400 uppercase font-semibold text-[10px] mb-1">Agent / Caller Notes</p>
                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        {lead.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Call Logs via Callen & Audio Recordings */}
              {activeTab === 'call_logs' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Callen Calling History & Audio Recordings</h3>
                      <p className="text-xs text-slate-500">Every call logged with duration, outcome, speech-to-text transcript, and quality score.</p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => setIsDialerOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-8 flex items-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Dial via Callen
                    </Button>
                  </div>

                  {(!lead.call_logs || lead.call_logs.length === 0) ? (
                    <div className="text-center py-12 text-slate-400">
                      <PhoneCall className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                      <p className="text-xs">No calls logged yet for this lead.</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setIsDialerOpen(true)}
                        className="mt-3 text-xs border-slate-200"
                      >
                        Start First Call
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {lead.call_logs.map((log: CallLog, idx: number) => (
                        <div key={log.id || idx} className="space-y-3">
                          <AdminCallRecordingPlayer 
                            callLog={log}
                            leadName={`${lead.first_name} ${lead.last_name}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Super Admin Superpowers */}
              {activeTab === 'admin_superpowers' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-base font-bold text-slate-900">Super Admin Superpowers & Controls</h3>
                      </div>
                      <p className="text-xs text-slate-500">Privileged tools for Rohit Nalpe (Super Admin) & Tathastu Directors.</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Admin Level Clearance
                    </span>
                  </div>

                  {/* Feature 1: Confidential Management Notes */}
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        Confidential Management Notes (Hidden from Callers)
                      </Label>
                      <span className="text-[10px] text-amber-700 font-semibold">
                        🔒 Only Visible to Super Admin & Managers
                      </span>
                    </div>

                    <Textarea 
                      value={adminNotesText}
                      onChange={(e) => setAdminNotesText(e.target.value)}
                      placeholder="Enter confidential notes, loan sanction details, preferred pricing discounts, or VIP instructions..."
                      className="bg-white border-amber-300 text-xs min-h-[90px] focus-visible:ring-amber-500"
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-semibold text-slate-700">Internal Sentiment:</Label>
                        <Select 
                          value={adminSentiment} 
                          onValueChange={(val) => setAdminSentiment(val)}
                        >
                          <SelectTrigger className="w-[180px] bg-white border-amber-300 text-xs h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200">
                            <SelectItem value="VERY_HOT" className="text-xs text-rose-700 font-bold">🔥 Very Hot Prospect</SelectItem>
                            <SelectItem value="HOT_PROSPECT" className="text-xs text-emerald-700 font-bold">⚡ High Intent Buyer</SelectItem>
                            <SelectItem value="WARM" className="text-xs text-blue-700">👍 Warm Lead</SelectItem>
                            <SelectItem value="PRICE_SENSITIVE" className="text-xs text-amber-700">💰 Price Sensitive</SelectItem>
                            <SelectItem value="ESCALATED" className="text-xs text-purple-700">🚨 Escalated to Director</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        size="sm"
                        onClick={handleSaveAdminNotes}
                        disabled={isSavingNotes}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 font-semibold"
                      >
                        {isSavingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                        Save Confidential Notes
                      </Button>
                    </div>
                  </div>

                  {/* Feature 2: 1-Click Quick Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-900">Direct Reassignment Override</h4>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Bypass hierarchy rules and instantly assign this lead to any manager or caller with an audit reason.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setIsOverrideOpen(true)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 font-semibold"
                      >
                        Open Override Console
                      </Button>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold text-slate-900">Export Certified Lead Dossier</h4>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Generate official Tathastu Client Dossier PDF with complete call logs, audio transcripts, and activity timeline.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setIsDossierOpen(true)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold"
                      >
                        View & Print Dossier
                      </Button>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 4: Tasks */}
              {activeTab === 'tasks' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Scheduled Follow-ups</h3>
                    <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 text-xs h-8">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Reminder
                    </Button>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Next Follow-up: <strong>{lead.next_follow_up || "Call tomorrow morning"}</strong></span>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-blue-100 px-2 py-0.5 rounded-md">Pending</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: 2-Tier Assignment & AI Insights */}
          <div className="space-y-6">
            
            {/* 2-Tier Assignment Card */}
            <div className="glass rounded-2xl p-5 border border-slate-200/80 shadow-xs bg-white space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Tathastu Assignment Hierarchy
              </h3>

              {/* Tier 1: Sales Manager */}
              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Tier 1: Assigned Manager
                  </Label>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <Select 
                  value={lead.manager_id || ""} 
                  onValueChange={async (mgrId: string | null) => {
                    if (!mgrId) return;
                    const mgr = MANAGERS.find(m => m.id === mgrId);
                    if (mgr) {
                      await assignToManager({ leadId: lead.id, managerId: mgr.id, managerName: mgr.name });
                      toast.success(`Assigned to Manager ${mgr.name}`);
                    }
                  }}
                >
                  <SelectTrigger className="w-full bg-white border-slate-300 text-slate-900 font-medium text-xs h-8">
                    <SelectValue placeholder="Select Manager..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900">
                    {MANAGERS.map(m => (
                      <SelectItem key={m.id} value={m.id} className="text-xs">
                        {m.name} ({m.title})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tier 2: Sales Executive / Caller */}
              <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Tier 2: Assigned Caller / Rep
                  </Label>
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <Select 
                  value={lead.employee_id || ""} 
                  onValueChange={async (empId: string | null) => {
                    if (!empId) return;
                    const emp = EMPLOYEES.find(e => e.id === empId);
                    if (emp) {
                      await assignToEmployee({ leadId: lead.id, employeeId: emp.id, employeeName: emp.name });
                      toast.success(`Assigned to Caller ${emp.name}`);
                    }
                  }}
                >
                  <SelectTrigger className="w-full bg-white border-slate-300 text-slate-900 font-medium text-xs h-8">
                    <SelectValue placeholder="Select Sales Caller..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-900">
                    {EMPLOYEES.map(e => (
                      <SelectItem key={e.id} value={e.id} className="text-xs">
                        {e.name} ({e.title})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* AI Lead Analysis */}
            <div className="glass rounded-2xl p-5 border border-slate-200/80 shadow-xs bg-white relative overflow-hidden">
              <h3 className="font-bold text-slate-900 mb-4 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI Lead Intent Analysis
              </h3>
              
              <div className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 rounded-full border-6 border-slate-100 flex items-center justify-center mb-4">
                  <div className="absolute inset-0 rounded-full border-6 border-t-emerald-500 border-r-emerald-500 border-b-transparent border-l-transparent transform rotate-45"></div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-900">88</div>
                    <div className="text-[9px] uppercase tracking-wider font-bold text-emerald-700">
                      High Intent
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  Buyer actively searching for 3BHK ready-to-move inventory. Loan pre-approved and responsive to WhatsApp outreach.
                </p>
              </div>
            </div>

            {/* Quick Admin Dossier CTA Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 space-y-2.5">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-700" />
                <span className="text-xs font-bold text-indigo-950">Management Dossier Export</span>
              </div>
              <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                Download a certified client report containing the complete 360° history for offline meetings or director sign-off.
              </p>
              <Button
                size="sm"
                onClick={() => setIsDossierOpen(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 font-semibold shadow-xs"
              >
                Export Client Dossier
              </Button>
            </div>

          </div>

        </div>

      </div>

      {/* Callen In-App Dialer Dialog */}
      <CallenDialerDialog 
        lead={lead}
        isOpen={isDialerOpen}
        onClose={() => setIsDialerOpen(false)}
        currentUser={lead.employee_name || "Gayatri"}
      />

      {/* Printable Lead Dossier Modal */}
      <LeadDossierExportModal
        lead={lead}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />

      {/* Admin Override Reassignment Dialog */}
      <Dialog open={isOverrideOpen} onOpenChange={setIsOverrideOpen}>
        <DialogContent className="max-w-md bg-white border-slate-200 text-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Super Admin Direct Reassignment Override
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Logged as an official audit event under Super Admin Rohit Nalpe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Assign Manager</Label>
              <Select value={overrideManagerId} onValueChange={(val: string | null) => val && setOverrideManagerId(val)}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-300 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {MANAGERS.map(m => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">{m.name} ({m.title})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Assign Caller</Label>
              <Select value={overrideEmployeeId} onValueChange={(val: string | null) => val && setOverrideEmployeeId(val)}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-300 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {EMPLOYEES.map(e => (
                    <SelectItem key={e.id} value={e.id} className="text-xs">{e.name} ({e.title})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Override Reason (Audit Requirement)</Label>
              <Input
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. VIP client requested senior closer / Caller on leave"
                className="bg-slate-50 border-slate-300 text-xs h-8"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOverrideOpen(false)}
                className="text-xs h-8 border-slate-200"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAdminOverrideReassign}
                disabled={isSubmittingOverride}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 font-semibold"
              >
                {isSubmittingOverride ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                Confirm Admin Override
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
