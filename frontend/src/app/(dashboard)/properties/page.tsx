"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Search,
  Sparkles,
  MapPin,
  Tag,
  Home,
  Users,
  CheckCircle2,
  Calendar,
  MessageCircle,
  PhoneCall,
  Trash2,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Property, Lead } from "@/lib/types";
import { useProperties } from "@/hooks/use-properties";
import { useLeads } from "@/hooks/use-leads";
import { useActiveRole } from "@/hooks/use-active-role";
import { AddPropertyModal } from "@/components/properties/add-property-modal";
import { PropertyMatchModal } from "@/components/properties/property-match-modal";
import { toast } from "sonner";

export default function PropertiesPage() {
  const { useGetProperties, deletePropertyMutation } = useProperties();
  const { data: properties = [], isLoading } = useGetProperties();
  const { leads } = useLeads();
  const { currentUser, isEmployee } = useActiveRole();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLeadForMatch, setSelectedLeadForMatch] = useState<Lead | null>(null);
  const [matchingProperty, setMatchingProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Filtering
  const filteredProperties = properties.filter((p) => {
    if (selectedType !== "ALL" && p.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.project_name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate leads that match this specific property
  const getMatchingLeadsForProperty = (prop: Property) => {
    return leads.filter((l) => {
      const lProject = (l.project_name || "").toLowerCase();
      const pProject = prop.project_name.toLowerCase();
      const pName = prop.name.toLowerCase();
      const lNotes = (l.notes || "").toLowerCase();

      if (lProject && (pName.includes(lProject) || pProject.includes(lProject))) return true;
      if (lNotes.includes(prop.type.toLowerCase())) return true;
      return false;
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
      await deletePropertyMutation.mutateAsync(id);
      toast.success(`Property "${name}" removed from inventory`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Property & Project Inventory"
          description={
            isEmployee
              ? "Caller Property Desk: Add new units, browse inventory, and view AI-matched clients for direct phone pitch."
              : "Company-wide Property Portfolio: Manage units, pricing, RERA disclosures, and client matching demand."
          }
        />

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs text-xs font-semibold px-4 h-9 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Property</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Properties</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{properties.length}</div>
          <p className="text-[11px] text-slate-400">Available across Pune</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Inventory</span>
            <Home className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            {properties.filter((p) => p.status === "AVAILABLE").length}
          </div>
          <p className="text-[11px] text-slate-400">Ready for site visits</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Client Demand</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700">{leads.length}</div>
          <p className="text-[11px] text-slate-400">Inbound active prospects</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">AI Copilot</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">Active</div>
          <p className="text-[11px] text-slate-400">Real-time matching table</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by project, Kharadi, 3 BHK, price..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs pl-9 h-9 bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
          {["ALL", "2 BHK", "3 BHK", "4 BHK"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                selectedType === type
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {type === "ALL" ? "All Configurations" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProperties.map((prop) => {
          const matchingLeads = getMatchingLeadsForProperty(prop);

          return (
            <div
              key={prop.id}
              className="bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col overflow-hidden"
            >
              {/* Card Banner */}
              <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 uppercase tracking-wider">
                      {prop.type}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1.5 leading-snug">
                      {prop.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{prop.location}</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      prop.status === "AVAILABLE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {prop.status === "AVAILABLE" ? "Available" : "Few Left"}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Investment</span>
                      <span className="font-extrabold text-sm text-blue-700">{prop.price_display}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Carpet Area</span>
                      <span className="font-bold text-slate-800 text-xs">{prop.carpet_area}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Possession</span>
                      <span className="font-medium text-slate-700 text-[11px]">{prop.possession}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">RERA</span>
                      <span className="font-mono text-slate-600 text-[10px] truncate block">{prop.rera_number || "Verified"}</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selling Highlights</span>
                    <div className="flex flex-wrap gap-1">
                      {prop.key_highlights.slice(0, 3).map((h, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md font-medium">
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Match & Action strip */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {/* Matching Client Counter */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/70 border border-purple-100">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-900">
                        {matchingLeads.length} Matching Clients in CRM
                      </span>
                    </div>
                    {matchingLeads.length > 0 && (
                      <button
                        onClick={() => setSelectedLeadForMatch(matchingLeads[0])}
                        className="text-[11px] text-purple-700 font-bold hover:underline flex items-center gap-0.5"
                      >
                        Pitch Lead <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Added by {prop.added_by}</span>
                    <button
                      onClick={() => handleDelete(prop.id, prop.name)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Remove property"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Property Match Modal (When viewing matches for a client) */}
      <PropertyMatchModal
        lead={selectedLeadForMatch}
        isOpen={!!selectedLeadForMatch}
        onClose={() => setSelectedLeadForMatch(null)}
      />
    </div>
  );
}
