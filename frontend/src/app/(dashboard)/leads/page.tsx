"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { useLeads } from "@/hooks/use-leads";
import { Lead, LeadStage } from "@/lib/types";
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Phone, 
  PhoneCall, 
  MessageCircle, 
  ShieldCheck, 
  UserCheck, 
  AlertTriangle, 
  Sparkles, 
  Eye, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  RefreshCw,
  CheckSquare,
  Square,
  Check,
  X,
  Layers,
  Copy,
  FileSpreadsheet
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CallenDialerDialog } from "@/components/leads/callen-dialer-dialog";
import { AssignmentModal } from "@/components/leads/assignment-modal";
import { LeadBulkImportModal } from "@/components/leads/lead-bulk-import-modal";
import { PropertyMatchModal } from "@/components/properties/property-match-modal";
import { useActiveRole } from "@/hooks/use-active-role";
import { useUsers, TathastuUser, BASELINE_TATHASTU_USERS } from "@/hooks/use-users";
import { generateSmartMessage, FollowUpOptions } from "@/hooks/use-ai";

const STAGE_LABELS: Record<LeadStage, { label: string; bg: string; text: string; border: string }> = {
  NEW_LEAD: { label: "New Lead", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  ASSIGNED: { label: "Assigned", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  CALLING: { label: "Calling", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  INTERESTED: { label: "Interested", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  SITE_VISIT: { label: "Site Visit", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  NEGOTIATION: { label: "Negotiation", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  CONVERTED: { label: "Converted", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  LOST: { label: "Lost", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  SPAM: { label: "Spam / Duplicate", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const leadSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(10, "Valid phone is required"),
  source: z.string().min(1, "Source is required"),
  budget: z.string().optional(),
  project_name: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function LeadsPage() {
  const { 
    leads, 
    isLoading, 
    addLead, 
    autoDistribute, 
    removeDuplicate,
    bulkAssignToManager,
    bulkAssignToEmployee 
  } = useLeads();

  const { currentUser, switchRole, isAdmin, isManager, isEmployee } = useActiveRole();
  const { useGetUsers } = useUsers();
  const { data: rawUsers } = useGetUsers();
  const activeTeamUsers: TathastuUser[] = (rawUsers && rawUsers.length > 0) ? rawUsers : BASELINE_TATHASTU_USERS;
  const managers = activeTeamUsers.filter(u => u.role === 'MANAGER');
  const callers = activeTeamUsers.filter(u => u.role === 'EMPLOYEE');

  const roleView = currentUser.role;
  const [activeStageFilter, setActiveStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Bulk Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isBulkManagerModalOpen, setIsBulkManagerModalOpen] = useState(false);
  const [isBulkCallerModalOpen, setIsBulkCallerModalOpen] = useState(false);
  const [bulkTargetManager, setBulkTargetManager] = useState<string>("mgr_1");
  const [bulkTargetCaller, setBulkTargetCaller] = useState<string>("emp_1");

  // Individual Lead Dialog states
  const [dialerLead, setDialerLead] = useState<Lead | null>(null);
  const [assignModal, setAssignModal] = useState<{ lead: Lead | null; type: 'TO_MANAGER' | 'TO_EMPLOYEE' }>({
    lead: null,
    type: 'TO_MANAGER'
  });

  // Bulk Ingestion & Distribution Modal state
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [propertyMatchLead, setPropertyMatchLead] = useState<Lead | null>(null);

  // AI Smart Follow-up Modal state
  const [aiFollowUpLead, setAiFollowUpLead] = useState<Lead | null>(null);
  const [aiFollowUpContext, setAiFollowUpContext] = useState<FollowUpOptions["context"]>("post_call");
  const [aiFollowUpTone, setAiFollowUpTone] = useState<FollowUpOptions["tone"]>("urgent");
  const [aiFollowUpDraft, setAiFollowUpDraft] = useState("");
  const [isAiFollowUpCopied, setIsAiFollowUpCopied] = useState(false);

  const openAiFollowUpModal = (lead: Lead, newContext?: FollowUpOptions["context"], newTone?: FollowUpOptions["tone"]) => {
    const c = newContext || aiFollowUpContext;
    const t = newTone || aiFollowUpTone;
    setAiFollowUpLead(lead);
    const text = generateSmartMessage({
      leadName: `${lead.first_name} ${lead.last_name}`,
      property: lead.project_name || "Tathastu Grandeur",
      budget: lead.budget || "₹95 Lakhs",
      context: c,
      tone: t,
      agentName: currentUser.name,
    });
    setAiFollowUpDraft(text);
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      source: "Google Ads",
      budget: "₹50,00,000",
      project_name: "Tathastu Residency",
    }
  });

  const handleCreateLead = async (data: LeadFormValues) => {
    try {
      await addLead(data);
      setIsCreateOpen(false);
      reset();
      toast.success("New lead created and added to the intake queue!");
    } catch (err) {
      toast.error("Failed to create lead");
    }
  };

  const handleAutoDistribute = async () => {
    if (roleView === 'ADMIN') {
      await autoDistribute({ type: 'TO_MANAGERS' });
      toast.success("All unassigned leads distributed evenly to Managers!");
    } else {
      await autoDistribute({ type: 'TO_EMPLOYEES', managerId: 'mgr_1' });
      toast.success("All team leads distributed evenly to sales callers!");
    }
  };

  // Filter leads based on selected role perspective
  const roleFilteredLeads = leads.filter(lead => {
    if (isManager) {
      // Show leads assigned to Manager Anmol (mgr_1)
      return lead.manager_id === currentUser.team_id || lead.manager_name === currentUser.name;
    }
    if (isEmployee) {
      // Show leads assigned to Caller Gayatri (emp_1)
      return lead.employee_id === currentUser.id || lead.employee_name === currentUser.name;
    }
    return true; // Admin sees all
  });

  // Filter by stage & search query
  const displayedLeads = roleFilteredLeads.filter(lead => {
    const matchesStage = activeStageFilter === 'ALL' || lead.stage === activeStageFilter;
    const fullName = `${lead.first_name} ${lead.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          lead.phone.includes(searchQuery) ||
                          lead.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  // Unassigned leads in current view
  const unassignedLeads = displayedLeads.filter(l => !l.manager_id);

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedLeadIds.length === displayedLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(displayedLeads.map(l => l.id));
    }
  };

  const handleSelectUnassigned = () => {
    setSelectedLeadIds(unassignedLeads.map(l => l.id));
    toast.info(`Selected ${unassignedLeads.length} unassigned leads for batch allocation`);
  };

  const handleBulkAssignToManagerConfirm = async () => {
    if (selectedLeadIds.length === 0) return;
    const mgr = managers.find(m => m.id === bulkTargetManager) || managers[0] || { id: "mgr_1", first_name: "Anmol", last_name: "" };
    const mgrName = `${mgr.first_name} ${mgr.last_name}`.trim();
    
    await bulkAssignToManager({
      leadIds: selectedLeadIds,
      managerId: mgr.id,
      managerName: mgrName,
    });

    toast.success(`Successfully assigned ${selectedLeadIds.length} leads to Manager ${mgrName}!`);
    setSelectedLeadIds([]);
    setIsBulkManagerModalOpen(false);
  };

  const handleBulkAssignToCallerConfirm = async () => {
    if (selectedLeadIds.length === 0) return;
    const caller = callers.find(e => e.id === bulkTargetCaller) || callers[0] || { id: "emp_1", first_name: "Gayatri", last_name: "" };
    const callerName = `${caller.first_name} ${caller.last_name}`.trim();

    await bulkAssignToEmployee({
      leadIds: selectedLeadIds,
      employeeId: caller.id,
      employeeName: callerName,
    });

    toast.success(`Successfully assigned ${selectedLeadIds.length} leads to Caller ${callerName}!`);
    setSelectedLeadIds([]);
    setIsBulkCallerModalOpen(false);
  };

  const handleBulkAutoSplit = async () => {
    if (selectedLeadIds.length === 0) return;

    if (managers.length > 1) {
      const chunkSize = Math.ceil(selectedLeadIds.length / managers.length);
      for (let i = 0; i < managers.length; i++) {
        const mgr = managers[i];
        const slice = selectedLeadIds.slice(i * chunkSize, (i + 1) * chunkSize);
        if (slice.length > 0) {
          await bulkAssignToManager({
            leadIds: slice,
            managerId: mgr.id,
            managerName: `${mgr.first_name} ${mgr.last_name}`.trim(),
          });
        }
      }
      toast.success(`Split ${selectedLeadIds.length} leads across ${managers.length} Sales Managers!`);
    } else {
      const defaultMgr = managers[0] || { id: "mgr_1", first_name: "Anmol", last_name: "" };
      const defaultMgrName = `${defaultMgr.first_name} ${defaultMgr.last_name}`.trim();
      await bulkAssignToManager({
        leadIds: selectedLeadIds,
        managerId: defaultMgr.id,
        managerName: defaultMgrName,
      });
      toast.success(`Allocated ${selectedLeadIds.length} leads to Manager ${defaultMgrName}!`);
    }

    setSelectedLeadIds([]);
  };

  // Find duplicate leads for Admin alert
  const duplicateLead = leads.find(l => l.is_duplicate);

  const columns = [
    {
      id: "select",
      header: () => (
        <div className="flex items-center justify-center pl-2">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary cursor-pointer"
            checked={displayedLeads.length > 0 && selectedLeadIds.length === displayedLeads.length}
            onChange={handleSelectAll}
            title="Select all displayed leads"
          />
        </div>
      ),
      cell: (info: any) => {
        const lead: Lead = info.row.original;
        const isChecked = selectedLeadIds.includes(lead.id);
        return (
          <div className="flex items-center justify-center pl-2">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary accent-primary cursor-pointer"
              checked={isChecked}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedLeadIds(prev => [...prev, lead.id]);
                } else {
                  setSelectedLeadIds(prev => prev.filter(id => id !== lead.id));
                }
              }}
            />
          </div>
        );
      }
    },
    { 
      header: "Lead Profile", 
      accessorKey: "first_name",
      cell: (info: any) => {
        const lead: Lead = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0">
              {lead.first_name?.[0]}{lead.last_name?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">{lead.first_name} {lead.last_name}</span>
                {lead.is_duplicate && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-700 border border-rose-300 rounded-md">
                    Duplicate
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{lead.phone}</span>
                <span>•</span>
                <span className="font-medium text-slate-700">{lead.project_name || "Tathastu Infra"}</span>
              </div>
            </div>
          </div>
        );
      }
    },
    { 
      header: "Source", 
      accessorKey: "source", 
      cell: (info: any) => {
        const source = info.getValue() || "Direct";
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
            {source}
          </span>
        );
      }
    },
    { 
      header: "Status / Stage", 
      accessorKey: "stage", 
      cell: (info: any) => {
        const stage: LeadStage = info.getValue() || 'NEW_LEAD';
        const conf = STAGE_LABELS[stage] || STAGE_LABELS.NEW_LEAD;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${conf.bg} ${conf.text} ${conf.border}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {conf.label}
          </span>
        );
      }
    },
    {
      header: "Assigned Manager",
      id: "manager",
      cell: (info: any) => {
        const lead: Lead = info.row.original;
        if (lead.manager_name) {
          return (
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">{lead.manager_name}</span>
            </div>
          );
        }
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAssignModal({ lead, type: 'TO_MANAGER' })}
            className="h-7 text-xs border-dashed border-blue-300 text-blue-700 bg-blue-50/50 hover:bg-blue-100/60"
          >
            + Assign Manager
          </Button>
        );
      }
    },
    {
      header: "Assigned Caller",
      id: "employee",
      cell: (info: any) => {
        const lead: Lead = info.row.original;
        if (lead.employee_name) {
          return (
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-medium text-slate-800">{lead.employee_name}</span>
            </div>
          );
        }
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAssignModal({ lead, type: 'TO_EMPLOYEE' })}
            className="h-7 text-xs border-dashed border-purple-300 text-purple-700 bg-purple-50/50 hover:bg-purple-100/60"
          >
            + Assign Caller
          </Button>
        );
      }
    },
    { 
      header: "Callen & Contact", 
      id: "actions",
      cell: (info: any) => {
        const lead: Lead = info.row.original;
        return (
          <div className="flex items-center gap-1.5">
            {/* Callen Dialer Simulation Trigger */}
            <Button
              size="sm"
              onClick={() => setDialerLead(lead)}
              className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs"
              title="Launch Callen Cloud Dialer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Callen</span>
            </Button>

            {/* WhatsApp */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`, '_blank')}
              className="h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
              title="Open WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
            </Button>

            {/* 🪄 AI Smart Follow-Up */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAiFollowUpModal(lead)}
              className="h-7 px-2 border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 font-semibold"
              title="Generate AI Follow-Up Pitch"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            </Button>

            {/* 🎯 AI Property Matcher */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPropertyMatchLead(lead)}
              className="h-7 px-2 border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100 hover:text-amber-900 font-semibold flex items-center gap-1 shadow-2xs"
              title="AI Property Matcher: View matching properties & direct phone pitch"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden xl:inline text-[11px]">Match</span>
            </Button>

            {/* View Details */}
            <Link href={`/leads/${lead.id}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                title="View Full Lead Details"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        );
      }
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header with Title & Create Lead Button */}
      <div className="glass rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <PageHeader 
          title={
            isAdmin 
              ? "Tathastu Infra Lead Management Flow" 
              : isManager 
              ? `Team East Inbound Leads Pool (${currentUser.name})`
              : `My Assigned Calling Queue (${currentUser.name})`
          } 
          description={
            isAdmin 
              ? "Capture ➔ Deduplicate ➔ Assign to Manager Anmol ➔ Monitor Conversions." 
              : isManager 
              ? "Lead intake pool. Allocate prospects to telecaller Gayatri."
              : "Your designated prospect queue. Dial directly with Callen or launch 1-click WhatsApp follow-ups."
          } 
        />
        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <Button 
              onClick={handleAutoDistribute}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/5 text-xs font-semibold rounded-xl flex items-center gap-1.5 h-9 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              ⚡ Auto-Distribute to Managers
            </Button>
          )}

          {isManager && (
            <Button 
              onClick={handleAutoDistribute}
              variant="outline"
              className="border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 h-9 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              ⚡ Auto-Distribute to Callers
            </Button>
          )}

          {isEmployee && displayedLeads.length > 0 && (
            <Button 
              onClick={() => setDialerLead(displayedLeads[0])}
              variant="outline"
              className="border-purple-600/30 text-purple-700 bg-purple-50/60 hover:bg-purple-100 text-xs font-semibold rounded-xl flex items-center gap-1.5 h-9 shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              🎧 Start Callen Dialer
            </Button>
          )}

          {/* 📥 Bulk Import & Distribute Button */}
          <Button 
            onClick={() => setIsBulkImportOpen(true)}
            variant="outline"
            className="border-indigo-300/80 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 h-9 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>📥 Bulk Import & Distribute</span>
          </Button>

          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all shadow-xs text-xs h-9 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {isEmployee ? "Add Personal Lead" : "Capture / Add Lead"}
          </Button>
        </div>
      </div>

      {/* Role-Based Perspective Switcher (Admin vs Manager vs Employee) */}
      <div className="bg-slate-100/80 border border-slate-200 p-1.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-3">
            Active Role View:
          </span>
          <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => switchRole('admin_1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                roleView === 'ADMIN' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin (Full Intake & Assignment)
            </button>
            <button
              type="button"
              onClick={() => switchRole('mgr_1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                roleView === 'MANAGER' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Manager (Anmol)
            </button>
            <button
              type="button"
              onClick={() => switchRole('emp_1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                roleView === 'EMPLOYEE' 
                  ? 'bg-purple-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Caller / Executive (Gayatri)
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium px-3">
          Showing <span className="font-bold text-slate-900">{displayedLeads.length}</span> active leads for this view
        </div>
      </div>

      {/* Duplicate / Spam Warning Banner (Admin responsibility from Image 2) */}
      {roleView === 'ADMIN' && duplicateLead && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-amber-900">
                1 Duplicate Lead Detected: {duplicateLead.first_name} {duplicateLead.last_name} ({duplicateLead.phone})
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {duplicateLead.duplicate_reason || "Matching phone number already exists in CRM. Remove or merge to prevent duplicate outreach."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              variant="outline"
              onClick={async () => {
                await removeDuplicate(duplicateLead.id);
                toast.success("Duplicate lead removed from intake queue.");
              }}
              className="h-8 text-xs border-amber-300 text-amber-900 hover:bg-amber-100 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Duplicate
            </Button>
          </div>
        </div>
      )}

      {/* 7-Stage Pipeline Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl overflow-x-auto max-w-full">
          {[
            { id: 'ALL', label: 'All Leads' },
            { id: 'NEW_LEAD', label: '1. New Lead' },
            { id: 'ASSIGNED', label: '2. Assigned' },
            { id: 'CALLING', label: '3. Calling' },
            { id: 'INTERESTED', label: '4. Interested' },
            { id: 'SITE_VISIT', label: '5. Site Visit' },
            { id: 'NEGOTIATION', label: '6. Negotiation' },
            { id: 'CONVERTED', label: '7. Converted' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStageFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeStageFilter === tab.id 
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-bold" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Quick Unassigned Batch Filter */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          {unassignedLeads.length > 0 && roleView === 'ADMIN' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectUnassigned}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 text-xs font-semibold rounded-xl h-9 shrink-0 shadow-2xs flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              Select All Unassigned ({unassignedLeads.length})
            </Button>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, phone, project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-slate-900 placeholder:text-slate-400 shadow-2xs h-9"
            />
          </div>
        </div>
      </div>

      {/* 🚀 BULK ACTIONS FLOATING TOOLBAR */}
      {selectedLeadIds.length > 0 && (
        <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold text-xs">
              {selectedLeadIds.length}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{selectedLeadIds.length} Leads Selected</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400">Choose a batch operation to assign them at once</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Admin Bulk Actions */}
            {isAdmin && (
              <>
                <Button
                  size="sm"
                  onClick={() => setIsBulkManagerModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 h-8 rounded-xl flex items-center gap-1.5 shadow-xs border border-blue-500/40"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Assign to Manager ({selectedLeadIds.length})
                </Button>

                <Button
                  size="sm"
                  onClick={() => setIsBulkCallerModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3.5 h-8 rounded-xl flex items-center gap-1.5 shadow-xs border border-purple-500/40"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Assign to Caller
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkAutoSplit}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs font-medium px-3 h-8 rounded-xl flex items-center gap-1.5"
                  title="Evenly distribute selected leads between East and West Managers"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Split 50/50 (East & West)
                </Button>
              </>
            )}

            {/* Manager Bulk Actions */}
            {isManager && (
              <Button
                size="sm"
                onClick={() => setIsBulkCallerModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 h-8 rounded-xl flex items-center gap-1.5 shadow-xs border border-emerald-500/40"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Assign to Team Caller ({selectedLeadIds.length})
              </Button>
            )}

            {/* Caller Bulk Actions */}
            {isEmployee && (
              <Button
                size="sm"
                onClick={() => {
                  toast.success(`Marked ${selectedLeadIds.length} leads as contacted!`);
                  setSelectedLeadIds([]);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3.5 h-8 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Mark Contacted ({selectedLeadIds.length})
              </Button>
            )}

            {/* Clear Selection */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedLeadIds([])}
              className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs h-8 px-2.5 rounded-xl"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Main Leads Table */}
      <div className="glass rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs bg-white">
        <DataTable 
          columns={columns} 
          data={displayedLeads} 
          loading={isLoading}
        />
      </div>

      {/* 📦 MODAL: BULK ASSIGN TO MANAGER */}
      <Dialog open={isBulkManagerModalOpen} onOpenChange={setIsBulkManagerModalOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Bulk Assign to Manager
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Allocate all <span className="font-bold text-slate-900">{selectedLeadIds.length} selected leads</span> to a Regional Sales Manager.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Destination Manager
              </label>
              <div className="grid gap-2.5">
                {managers.map((mgr) => (
                  <div
                    key={mgr.id}
                    onClick={() => setBulkTargetManager(mgr.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      bulkTargetManager === mgr.id
                        ? "bg-blue-50/80 border-blue-500 text-blue-900 shadow-2xs"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${mgr.avatar_color || 'from-emerald-600 to-teal-600'} text-white font-bold text-xs flex items-center justify-center`}>
                        {(mgr.first_name[0] || '') + (mgr.last_name[0] || '')}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{mgr.first_name} {mgr.last_name}</div>
                        <div className="text-xs text-slate-500">{mgr.designation}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {mgr.emp_id || 'MGR'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Batch Processing Summary:</p>
              <p>• {selectedLeadIds.length} leads will be transferred to selected manager's queue.</p>
              <p>• New leads will automatically advance to <span className="font-bold text-purple-700">ASSIGNED</span> status.</p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBulkManagerModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleBulkAssignToManagerConfirm}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4"
              >
                Confirm Bulk Assignment ({selectedLeadIds.length} Leads)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 📦 MODAL: BULK ASSIGN TO CALLER / REP */}
      <Dialog open={isBulkCallerModalOpen} onOpenChange={setIsBulkCallerModalOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              Bulk Assign to Sales Caller / Rep
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Assign all <span className="font-bold text-slate-900">{selectedLeadIds.length} selected leads</span> to an individual executive for immediate Callen outreach.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Destination Caller
              </label>
              <div className="grid gap-2">
                {callers.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => setBulkTargetCaller(emp.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      bulkTargetCaller === emp.id
                        ? "bg-purple-50/80 border-purple-500 text-purple-900 shadow-2xs"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${emp.avatar_color || 'from-purple-600 to-indigo-600'} text-white font-bold text-xs flex items-center justify-center`}>
                        {(emp.first_name[0] || '') + (emp.last_name[0] || '')}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{emp.first_name} {emp.last_name}</div>
                        <div className="text-[11px] text-slate-500">{emp.designation} • {emp.team_name || 'Desk'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                        {emp.emp_id || 'CLR'}
                      </span>
                      {bulkTargetCaller === emp.id && (
                        <Check className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBulkCallerModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleBulkAssignToCallerConfirm}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4"
              >
                Assign {selectedLeadIds.length} Leads
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CREATE LEAD MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-slate-900">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Capture New Property Lead
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Enter customer details to ingest into Tathastu Infra intake pipeline.
            </p>

            <form onSubmit={handleSubmit(handleCreateLead)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">First Name *</label>
                  <input 
                    {...register("first_name")} 
                    placeholder="e.g. Ramesh" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.first_name && <p className="text-[10px] text-rose-500">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Last Name *</label>
                  <input 
                    {...register("last_name")} 
                    placeholder="e.g. Chawla" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.last_name && <p className="text-[10px] text-rose-500">{errors.last_name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Phone Number *</label>
                  <input 
                    {...register("phone")} 
                    placeholder="+91 98887 66555" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.phone && <p className="text-[10px] text-rose-500">{errors.phone.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <input 
                    {...register("email")} 
                    placeholder="ramesh@example.com" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Lead Source *</label>
                  <select 
                    {...register("source")} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Google Ads">Google Ads</option>
                    <option value="Facebook Ads">Facebook Ads</option>
                    <option value="99acres">99acres</option>
                    <option value="MagicBricks">MagicBricks</option>
                    <option value="Website">Website Form</option>
                    <option value="Walk-in">Direct Walk-in</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Target Project</label>
                  <input 
                    {...register("project_name")} 
                    placeholder="Tathastu Residency" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Approx. Budget</label>
                <input 
                  {...register("budget")} 
                  placeholder="e.g. ₹75,00,000 - ₹1.2 Cr" 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-medium px-4 py-2 shadow-xs"
                >
                  Save & Ingest Lead
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Callen Dialer In-App Dialog */}
      <CallenDialerDialog 
        lead={dialerLead} 
        isOpen={!!dialerLead} 
        onClose={() => setDialerLead(null)}
        currentUser={roleView === 'EMPLOYEE' ? "Gayatri" : "Anmol"}
      />

      {/* 2-Tier Assignment Modal */}
      <AssignmentModal 
        lead={assignModal.lead}
        isOpen={!!assignModal.lead}
        onClose={() => setAssignModal({ lead: null, type: 'TO_MANAGER' })}
        type={assignModal.type}
      />

      {/* 🪄 Smart AI Follow-Up Modal */}
      <Dialog open={!!aiFollowUpLead} onOpenChange={(open) => !open && setAiFollowUpLead(null)}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-xl">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                AI Smart Follow-Up Generator
              </DialogTitle>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                Tathastu AI
              </span>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Personalized WhatsApp & call pitch tailored to {aiFollowUpLead?.first_name} {aiFollowUpLead?.last_name}.
            </DialogDescription>
          </DialogHeader>

          {aiFollowUpLead && (
            <div className="space-y-4 pt-2">
              {/* Lead Context Snapshot */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Prospect</span>
                  <strong className="text-slate-900 truncate block">{aiFollowUpLead.first_name} {aiFollowUpLead.last_name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Project Interest</span>
                  <strong className="text-slate-900 truncate block">
                    {aiFollowUpLead.project_name || "Tathastu Grandeur"}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Budget</span>
                  <strong className="text-slate-900 truncate block">{aiFollowUpLead.budget || "₹95 Lakhs"}</strong>
                </div>
              </div>

              {/* Scenario & Tone Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Follow-Up Scenario
                  </label>
                  <Select
                    value={aiFollowUpContext}
                    onValueChange={(val: any) => {
                      setAiFollowUpContext(val);
                      openAiFollowUpModal(aiFollowUpLead, val, aiFollowUpTone);
                    }}
                  >
                    <SelectTrigger className="text-xs h-9 bg-white border-slate-200">
                      <SelectValue placeholder="Select Scenario" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-xs">
                      <SelectItem value="post_call">📞 Post-Call Summary</SelectItem>
                      <SelectItem value="intro">🚀 New Inbound Intro & Brochure</SelectItem>
                      <SelectItem value="site_visit_invite">🚗 Site Visit + Cab Offer</SelectItem>
                      <SelectItem value="post_visit_close">🤝 Post-Visit Decision</SelectItem>
                      <SelectItem value="limited_offer">⚡ 48h Launch Incentive</SelectItem>
                      <SelectItem value="cold_revival">❄️ Cold Lead Revival</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Communication Tone
                  </label>
                  <Select
                    value={aiFollowUpTone}
                    onValueChange={(val: any) => {
                      setAiFollowUpTone(val);
                      openAiFollowUpModal(aiFollowUpLead, aiFollowUpContext, val);
                    }}
                  >
                    <SelectTrigger className="text-xs h-9 bg-white border-slate-200">
                      <SelectValue placeholder="Select Tone" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-xs">
                      <SelectItem value="urgent">🔥 Urgent & Time-Sensitive</SelectItem>
                      <SelectItem value="short_whatsapp">📱 Short & Direct WhatsApp</SelectItem>
                      <SelectItem value="consultative">🤝 Warm & Consultative</SelectItem>
                      <SelectItem value="vip">👑 VIP Luxury Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Editable Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Generated Pitch
                  </label>
                  <span className="text-[10px] text-slate-400">{aiFollowUpDraft.length} characters</span>
                </div>
                <Textarea
                  value={aiFollowUpDraft}
                  onChange={(e) => setAiFollowUpDraft(e.target.value)}
                  rows={6}
                  className="w-full text-xs text-slate-900 bg-slate-50/50 border-slate-200 rounded-xl p-3 resize-none focus-visible:ring-indigo-600 focus-visible:bg-white"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(aiFollowUpDraft);
                    setIsAiFollowUpCopied(true);
                    toast.success("Pitch copied to clipboard!");
                    setTimeout(() => setIsAiFollowUpCopied(false), 2000);
                  }}
                  className="text-xs border-slate-200 text-slate-700 h-9 rounded-xl"
                >
                  {isAiFollowUpCopied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {isAiFollowUpCopied ? "Copied" : "Copy Text"}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.success(`Follow-up task scheduled for ${aiFollowUpLead.first_name} on tomorrow's calendar!`);
                      setAiFollowUpLead(null);
                    }}
                    className="text-xs text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100 h-9 rounded-xl"
                  >
                    Log as CRM Task
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const cleanPhone = aiFollowUpLead.phone.replace(/[^0-9]/g, "");
                      const encoded = encodeURIComponent(aiFollowUpDraft);
                      window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
                      toast.success("Launching WhatsApp...");
                      setAiFollowUpLead(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 h-9 rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send via WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 📥 Bulk Excel / CSV / Raw Pile Import & Distribution Modal */}
      <LeadBulkImportModal 
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />

      {/* 🎯 AI Property Matcher Modal */}
      <PropertyMatchModal
        lead={propertyMatchLead}
        isOpen={!!propertyMatchLead}
        onClose={() => setPropertyMatchLead(null)}
        onLaunchDialer={(l) => setDialerLead(l)}
      />

    </div>
  );
}
