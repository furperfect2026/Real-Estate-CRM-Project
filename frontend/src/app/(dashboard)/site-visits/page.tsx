"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSiteVisits, SiteVisit } from "@/hooks/use-site-visits";
import { useActiveRole } from "@/hooks/use-active-role";
import { useLeads } from "@/hooks/use-leads";
import { toast } from "sonner";
import {
  MapPin,
  Calendar,
  Clock,
  Plus,
  Car,
  CheckCircle2,
  Users,
  Building2,
  Phone,
  RotateCcw,
  Sparkles,
  Search,
  Filter
} from "lucide-react";

const PROJECTS = [
  "Tathastu Residency (Kharadi)",
  "Tathastu Heights (Wakad)",
  "Tathastu Greens (Baner)",
  "Tathastu Enclave (Viman Nagar)",
];

const STATUS_BADGES: Record<SiteVisit["status"], { label: string; color: string }> = {
  SCHEDULED: { label: "Scheduled", color: "bg-blue-50 text-blue-700 border-blue-200" },
  COMPLETED: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  RESCHEDULED: { label: "Rescheduled", color: "bg-amber-50 text-amber-800 border-amber-200" },
  CANCELLED: { label: "Cancelled", color: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function SiteVisitsPage() {
  const { useGetVisits, scheduleVisit, updateVisitStatus } = useSiteVisits();
  const { data: visits = [], isLoading } = useGetVisits();
  const { currentUser, isAdmin, isManager, isEmployee } = useActiveRole();
  const { leads, updateStage } = useLeads();

  const [activeTab, setActiveTab] = useState<"ALL" | "SCHEDULED" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Form State
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [project, setProject] = useState(PROJECTS[0]);
  const [visitDate, setVisitDate] = useState("2026-09-18");
  const [visitTime, setVisitTime] = useState("11:30 AM");
  const [assignedExecutive, setAssignedExecutive] = useState(
    isEmployee ? currentUser.name : "Gayatri"
  );
  const [pickupRequired, setPickupRequired] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Role Scoping
  const roleFilteredVisits = visits.filter((v) => {
    if (isAdmin) return true;
    if (isManager) {
      return v.assigned_manager_id === currentUser.team_id || v.assigned_manager === currentUser.name;
    }
    if (isEmployee) {
      return v.assigned_executive_id === currentUser.id || v.assigned_executive === currentUser.name;
    }
    return true;
  });

  const displayedVisits = roleFilteredVisits.filter((v) => {
    const matchesTab = activeTab === "ALL" || v.status === activeTab;
    const matchesSearch =
      v.lead_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.lead_phone.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const handleLeadSelect = (leadId: string | null) => {
    if (!leadId) return;
    setSelectedLeadId(leadId);
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setClientName(`${lead.first_name} ${lead.last_name}`);
      setClientPhone(lead.phone);
      if (lead.project_name) {
        const foundProject = PROJECTS.find((p) => p.includes(lead.project_name!));
        if (foundProject) setProject(foundProject);
      }
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      toast.error("Client Name and Phone are required");
      return;
    }

    try {
      await scheduleVisit({
        lead_id: selectedLeadId || `lead_${Date.now()}`,
        lead_name: clientName,
        lead_phone: clientPhone,
        project_name: project,
        visit_date: visitDate,
        visit_time: visitTime,
        assigned_executive: assignedExecutive,
        assigned_executive_id: isEmployee ? currentUser.id : "emp_1",
        assigned_manager: isManager ? currentUser.name : "Anmol",
        assigned_manager_id: isManager ? currentUser.team_id || "mgr_1" : "mgr_1",
        pickup_required: pickupRequired,
        pickup_location: pickupRequired ? pickupLocation : undefined,
        status: "SCHEDULED",
        notes,
      });

      // Advance lead to SITE_VISIT stage if lead exists
      if (selectedLeadId) {
        await updateStage({ leadId: selectedLeadId, stage: "SITE_VISIT" });
      }

      toast.success(`Site visit booked for ${clientName} at ${project}!`);
      setIsScheduleOpen(false);
      setClientName("");
      setClientPhone("");
      setNotes("");
      setPickupLocation("");
    } catch (e) {
      toast.error("Failed to schedule site visit");
    }
  };

  const handleCompleteVisit = async (visit: SiteVisit) => {
    await updateVisitStatus({
      visitId: visit.id,
      status: "COMPLETED",
      outcome_notes: "Tour completed. Prospect showed high interest in 3 BHK floorplan.",
    });

    if (visit.lead_id) {
      await updateStage({ leadId: visit.lead_id, stage: "NEGOTIATION" });
    }

    toast.success(`Visit marked Completed! Lead advanced to Negotiation stage.`);
  };

  // KPI Metrics
  const scheduledCount = roleFilteredVisits.filter((v) => v.status === "SCHEDULED").length;
  const completedCount = roleFilteredVisits.filter((v) => v.status === "COMPLETED").length;
  const pickupCount = roleFilteredVisits.filter((v) => v.pickup_required).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="glass rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Site Visits & Property Tours
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate client pick-ups, project walkthroughs, and closure momentum for Tathastu Infra.
          </p>
        </div>

        <Button
          onClick={() => setIsScheduleOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs text-xs font-semibold px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule Site Visit
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-4 border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Tours</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{scheduledCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Confirmed for this week</p>
        </div>

        <div className="glass rounded-2xl p-4 border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Tours</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{completedCount}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">75% closure conversion rate</p>
        </div>

        <div className="glass rounded-2xl p-4 border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cab / Pickups</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{pickupCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Client transport arranged</p>
        </div>

        <div className="glass rounded-2xl p-4 border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Scope</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-2 truncate">{currentUser.name}</div>
          <p className="text-[11px] text-slate-500 truncate">{currentUser.designation}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl">
          {[
            { id: "ALL", label: "All Visits" },
            { id: "SCHEDULED", label: "Upcoming / Scheduled" },
            { id: "COMPLETED", label: "Completed Tours" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search client, project, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-primary/20 shadow-2xs h-9"
          />
        </div>
      </div>

      {/* Visits Table / Cards */}
      <div className="glass rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Client Profile</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Target Project</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date & Time</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Assigned Executive</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {displayedVisits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                    No site visits found matching this filter.
                  </td>
                </tr>
              ) : (
                displayedVisits.map((v) => {
                  const badge = STATUS_BADGES[v.status] || STATUS_BADGES.SCHEDULED;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                            {v.lead_name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900">{v.lead_name}</div>
                            <div className="text-xs text-slate-500">{v.lead_phone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                          {v.project_name}
                        </div>
                        {v.pickup_required && (
                          <div className="text-[10px] text-amber-700 flex items-center gap-1 mt-0.5 font-medium">
                            <Car className="w-3 h-3 text-amber-600" />
                            Pickup: {v.pickup_location || "Requested"}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {v.visit_date}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {v.visit_time}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-800">{v.assigned_executive}</div>
                        <div className="text-[10px] text-slate-400">Mgr: {v.assigned_manager}</div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {v.status === "SCHEDULED" && (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteVisit(v)}
                              className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Mark Completed
                            </Button>
                          )}
                          <a
                            href={`tel:${v.lead_phone.replace(/[^0-9]/g, "")}`}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors"
                            title="Call Client"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULE SITE VISIT MODAL */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Schedule Client Site Visit
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Arrange sample flat viewing, site walkthrough, and optional pick-up assistance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleScheduleSubmit} className="space-y-4 pt-2">
            {/* Quick Lead Autofill */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Select Existing Lead (Optional)</Label>
              <Select onValueChange={handleLeadSelect}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-300 text-xs">
                  <SelectValue placeholder="Choose a lead to auto-fill details..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={l.id} className="text-xs">
                      {l.first_name} {l.last_name} ({l.phone}) - {l.project_name || "General"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Client Name *</Label>
                <Input
                  required
                  placeholder="e.g. Ramesh Chawla"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Client Phone *</Label>
                <Input
                  required
                  placeholder="+91 98887 66555"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Destination Project *</Label>
              <Select value={project} onValueChange={(val) => setProject(val || PROJECTS[0])}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-300 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {PROJECTS.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Date</Label>
                <Input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Time Slot</Label>
                <Input
                  placeholder="11:30 AM"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Cab Pickup Toggle */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={pickupRequired}
                  onChange={(e) => setPickupRequired(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <Car className="w-3.5 h-3.5 text-amber-600" />
                Arrange Cab / Escort Pickup for Client
              </label>

              {pickupRequired && (
                <div className="pt-1">
                  <Input
                    placeholder="Enter pickup address / metro station landmark..."
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="bg-white border-slate-300 text-xs"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Special Notes & Unit Preferences</Label>
              <Textarea
                placeholder="Floor preference, budget discussions, sample flat details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-50 border-slate-300 text-xs resize-none h-16"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsScheduleOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4"
              >
                Confirm Site Visit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
