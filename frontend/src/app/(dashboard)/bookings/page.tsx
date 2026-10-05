"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useBookings, Booking } from "@/hooks/use-bookings";
import { useActiveRole } from "@/hooks/use-active-role";
import { useLeads } from "@/hooks/use-leads";
import { toast } from "sonner";
import {
  FileCheck2,
  Building2,
  TrendingUp,
  Coins,
  Plus,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck,
  Search
} from "lucide-react";

const PROJECTS = [
  "Tathastu Residency (Kharadi)",
  "Tathastu Heights (Wakad)",
  "Tathastu Greens (Baner)",
  "Tathastu Enclave (Viman Nagar)",
];

const UNIT_TYPES = [
  "2 BHK Premium",
  "3 BHK Luxury Suite",
  "4 BHK Penthouse",
  "4 BHK Signature Villa",
];

const STATUS_BADGES: Record<Booking["payment_status"], { label: string; color: string }> = {
  TOKEN_RECEIVED: { label: "Token Received (Booking Active)", color: "bg-amber-50 text-amber-800 border-amber-200" },
  AGREEMENT_DONE: { label: "Agreement for Sale Executed", color: "bg-blue-50 text-blue-700 border-blue-200" },
  REGISTRATION_COMPLETE: { label: "Registration Complete (Won)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function BookingsPage() {
  const { useGetBookings, createBooking, updateBookingStatus } = useBookings();
  const { data: bookings = [], isLoading } = useGetBookings();
  const { currentUser, isAdmin, isManager, isEmployee } = useActiveRole();
  const { leads, updateStage } = useLeads();

  const [activeTab, setActiveTab] = useState<"ALL" | Booking["payment_status"]>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Form State
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [project, setProject] = useState(PROJECTS[0]);
  const [unitNo, setUnitNo] = useState("Tower A - Flat 502");
  const [unitType, setUnitType] = useState(UNIT_TYPES[0]);
  const [carpetArea, setCarpetArea] = useState("1,150 sq.ft.");
  const [agreementValue, setAgreementValue] = useState("₹85,00,000");
  const [tokenAmount, setTokenAmount] = useState("₹5,00,000");
  const [notes, setNotes] = useState("");

  // Role Scoping
  const roleFilteredBookings = bookings.filter((b) => {
    if (isAdmin) return true;
    if (isManager) {
      return b.closing_manager_id === currentUser.team_id || b.closing_manager === currentUser.name;
    }
    if (isEmployee) {
      return b.closing_executive_id === currentUser.id || b.closing_executive === currentUser.name;
    }
    return true;
  });

  const displayedBookings = roleFilteredBookings.filter((b) => {
    const matchesTab = activeTab === "ALL" || b.payment_status === activeTab;
    const matchesSearch =
      b.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.unit_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.client_phone.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const handleLeadSelect = (leadId: string | null) => {
    if (!leadId) return;
    setSelectedLeadId(leadId);
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setClientName(`${lead.first_name} ${lead.last_name}`);
      setClientPhone(lead.phone);
      if (lead.email) setClientEmail(lead.email);
      if (lead.budget) setAgreementValue(lead.budget);
      if (lead.project_name) {
        const foundProject = PROJECTS.find((p) => p.includes(lead.project_name!));
        if (foundProject) setProject(foundProject);
      }
    }
  };

  const handleCreateBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !unitNo.trim() || !agreementValue.trim()) {
      toast.error("Please fill in the required booking details");
      return;
    }

    try {
      await createBooking({
        client_name: clientName,
        client_phone: clientPhone || "+91 98000 00000",
        client_email: clientEmail || "client@tathastuinfra.com",
        project_name: project,
        unit_no: unitNo,
        unit_type: unitType,
        carpet_area: carpetArea,
        agreement_value: agreementValue,
        booking_token_amount: tokenAmount,
        payment_status: "TOKEN_RECEIVED",
        closing_manager: isManager ? currentUser.name : "Anmol",
        closing_manager_id: isManager ? currentUser.team_id || "mgr_1" : "mgr_1",
        closing_executive: isEmployee ? currentUser.name : "Gayatri",
        closing_executive_id: isEmployee ? currentUser.id : "emp_1",
        notes,
      });

      // Advance lead to CONVERTED in pipeline
      if (selectedLeadId) {
        await updateStage({ leadId: selectedLeadId, stage: "CONVERTED" });
      }

      toast.success(`Booking confirmed for ${clientName}! Unit ${unitNo} allotted.`);
      setIsBookingOpen(false);
      setClientName("");
      setClientPhone("");
      setNotes("");
    } catch (err) {
      toast.error("Failed to register booking");
    }
  };

  const handleAdvanceStatus = async (booking: Booking) => {
    const nextStatus =
      booking.payment_status === "TOKEN_RECEIVED"
        ? "AGREEMENT_DONE"
        : "REGISTRATION_COMPLETE";

    await updateBookingStatus({
      bookingId: booking.id,
      status: nextStatus,
    });

    toast.success(`Booking updated to: ${STATUS_BADGES[nextStatus].label}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Bookings & Converted Clients
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track closed revenue, unit inventory allotments, and payment milestones for Tathastu Infra.
          </p>
        </div>

        <Button
          onClick={() => setIsBookingOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs text-xs font-semibold px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Booking
        </Button>
      </div>

      {/* KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-4 border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booked Value</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">₹3.99 Cr</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">+31.8% vs last month</p>
        </div>

        <div className="glass rounded-2xl p-4 border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Units Allotted</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{roleFilteredBookings.length} Units</div>
          <p className="text-[11px] text-slate-500 mt-1">Across 3 active projects</p>
        </div>

        <div className="glass rounded-2xl p-4 border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tokens Collected</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">₹42.50 L</div>
          <p className="text-[11px] text-slate-500 mt-1">Direct RTGS & Cheques</p>
        </div>

        <div className="glass rounded-2xl p-4 border border-slate-200/80 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Viewing Panel</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-2 truncate">{currentUser.name}</div>
          <p className="text-[11px] text-slate-500 truncate">{currentUser.designation}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl overflow-x-auto max-w-full">
          {[
            { id: "ALL", label: "All Bookings" },
            { id: "TOKEN_RECEIVED", label: "Token Received" },
            { id: "AGREEMENT_DONE", label: "Agreement Executed" },
            { id: "REGISTRATION_COMPLETE", label: "Registered" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-bold"
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
            placeholder="Search client, unit, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-primary/20 shadow-2xs h-9"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Client & Contact</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Unit & Project</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Agreement Value</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Token Advance</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Closing Team</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Milestone Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {displayedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    No booking records found matching this filter.
                  </td>
                </tr>
              ) : (
                displayedBookings.map((b) => {
                  const badge = STATUS_BADGES[b.payment_status] || STATUS_BADGES.TOKEN_RECEIVED;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-sm text-slate-900">{b.client_name}</div>
                        <div className="text-xs text-slate-500">{b.client_phone}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{b.booking_date}</div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                          {b.unit_no}
                        </div>
                        <div className="text-xs text-slate-600">{b.project_name}</div>
                        <div className="text-[11px] text-slate-400">{b.unit_type} • {b.carpet_area}</div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-sm text-emerald-700">{b.agreement_value}</div>
                        <div className="text-[10px] text-slate-400">Total Agreement</div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-xs text-indigo-700">{b.booking_token_amount}</div>
                        <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Advance Paid
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-800">{b.closing_executive}</div>
                        <div className="text-[10px] text-slate-400">Manager: {b.closing_manager}</div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.payment_status !== "REGISTRATION_COMPLETE" && (
                            <Button
                              size="sm"
                              onClick={() => handleAdvanceStatus(b)}
                              className="h-7 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-lg shadow-2xs"
                            >
                              Advance Milestone ➔
                            </Button>
                          )}
                          <a
                            href={`https://wa.me/${b.client_phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(
                              b.client_name
                            )},%20greetings%20from%20Tathastu%20Infra%20regarding%20your%20booking%20of%20${encodeURIComponent(
                              b.unit_no
                            )}.`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 text-teal-600 hover:bg-teal-50 transition-colors"
                            title="WhatsApp Buyer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
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

      {/* CREATE BOOKING MODAL */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-primary" />
              Register New Property Booking
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Confirm sale, allot apartment unit number, and log token advance payment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBookingSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Select Converted Lead (Auto-fill)</Label>
              <Select onValueChange={handleLeadSelect}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-300 text-xs">
                  <SelectValue placeholder="Pick a lead from pipeline..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={l.id} className="text-xs">
                      {l.first_name} {l.last_name} ({l.phone}) - Budget: {l.budget}
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
                  placeholder="e.g. Vikram Malhotra"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Client Phone *</Label>
                <Input
                  required
                  placeholder="+91 98200 12345"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Project *</Label>
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Allotted Unit / Flat No. *</Label>
                <Input
                  required
                  placeholder="Tower B - Flat 804"
                  value={unitNo}
                  onChange={(e) => setUnitNo(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Unit Type</Label>
                <Select value={unitType} onValueChange={(val) => setUnitType(val || UNIT_TYPES[0])}>
                  <SelectTrigger className="w-full bg-slate-50 border-slate-300 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {UNIT_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Carpet Area</Label>
                <Input
                  placeholder="1,250 sq.ft."
                  value={carpetArea}
                  onChange={(e) => setCarpetArea(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Agreement Value *</Label>
                <Input
                  required
                  placeholder="₹95,00,000"
                  value={agreementValue}
                  onChange={(e) => setAgreementValue(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Booking Token Paid</Label>
                <Input
                  placeholder="₹5,00,000"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Payment & Bank Details</Label>
              <Textarea
                placeholder="Bank loan details, payment milestones, RTGS reference..."
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
                onClick={() => setIsBookingOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4"
              >
                Confirm Booking & Allot Unit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
