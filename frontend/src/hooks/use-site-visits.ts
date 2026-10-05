"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface SiteVisit {
  id: string;
  lead_id: string;
  lead_name: string;
  lead_phone: string;
  project_name: string;
  visit_date: string; // YYYY-MM-DD
  visit_time: string; // e.g. 11:30 AM
  assigned_executive: string;
  assigned_executive_id: string;
  assigned_manager: string;
  assigned_manager_id: string;
  pickup_required: boolean;
  pickup_location?: string;
  status: "SCHEDULED" | "COMPLETED" | "RESCHEDULED" | "CANCELLED";
  notes?: string;
  outcome_notes?: string;
  created_at: string;
}

let mockSiteVisits: SiteVisit[] = [
  {
    id: "sv_1",
    lead_id: "1",
    lead_name: "Arun Deshmukh",
    lead_phone: "+91 98765 43210",
    project_name: "Tathastu Residency",
    visit_date: "2026-09-17",
    visit_time: "11:00 AM",
    assigned_executive: "Gayatri",
    assigned_executive_id: "emp_1",
    assigned_manager: "Anmol",
    assigned_manager_id: "mgr_1",
    pickup_required: true,
    pickup_location: "Kalyani Nagar Metro Station",
    status: "SCHEDULED",
    notes: "Interested in top floor 3 BHK with East-facing balcony.",
    created_at: "2026-09-15T10:00:00Z",
  },
  {
    id: "sv_2",
    lead_id: "2",
    lead_name: "Siddhi Verma",
    lead_phone: "+91 91234 56789",
    project_name: "Tathastu Heights",
    visit_date: "2026-09-18",
    visit_time: "03:30 PM",
    assigned_executive: "Gayatri",
    assigned_executive_id: "emp_1",
    assigned_manager: "Anmol",
    assigned_manager_id: "mgr_1",
    pickup_required: false,
    status: "SCHEDULED",
    notes: "Visiting with family. Needs sample flat tour.",
    created_at: "2026-09-15T11:30:00Z",
  },
  {
    id: "sv_3",
    lead_id: "4",
    lead_name: "Ananya Iyer",
    lead_phone: "+91 98112 33445",
    project_name: "Tathastu Greens",
    visit_date: "2026-09-14",
    visit_time: "02:00 PM",
    assigned_executive: "Gayatri",
    assigned_executive_id: "emp_1",
    assigned_manager: "Anmol",
    assigned_manager_id: "mgr_1",
    pickup_required: true,
    pickup_location: "Magarpatta South Gate",
    status: "COMPLETED",
    outcome_notes: "Liked the layout and clubhouse. Ready to negotiate on pricing.",
    notes: "Customer loved the master bedroom layout.",
    created_at: "2026-09-13T14:00:00Z",
  },
  {
    id: "sv_4",
    lead_id: "5",
    lead_name: "Rohan Mehra",
    lead_phone: "+91 97654 32190",
    project_name: "Tathastu Residency",
    visit_date: "2026-09-19",
    visit_time: "10:30 AM",
    assigned_executive: "Gayatri",
    assigned_executive_id: "emp_1",
    assigned_manager: "Anmol",
    assigned_manager_id: "mgr_1",
    pickup_required: false,
    status: "SCHEDULED",
    notes: "First-time home buyer looking for 2 BHK budget under 65L.",
    created_at: "2026-09-15T12:00:00Z",
  },
];

export function useSiteVisits() {
  const queryClient = useQueryClient();

  const useGetVisits = () => {
    return useQuery({
      queryKey: ["site-visits"],
      queryFn: async () => {
        return [...mockSiteVisits];
      },
    });
  };

  const scheduleVisitMutation = useMutation({
    mutationFn: async (newVisit: Omit<SiteVisit, "id" | "created_at">) => {
      const visit: SiteVisit = {
        ...newVisit,
        id: `sv_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      mockSiteVisits = [visit, ...mockSiteVisits];
      return visit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-visits"] });
    },
  });

  const updateVisitStatusMutation = useMutation({
    mutationFn: async ({
      visitId,
      status,
      outcome_notes,
    }: {
      visitId: string;
      status: SiteVisit["status"];
      outcome_notes?: string;
    }) => {
      mockSiteVisits = mockSiteVisits.map((v) => {
        if (v.id === visitId) {
          return {
            ...v,
            status,
            outcome_notes: outcome_notes || v.outcome_notes,
          };
        }
        return v;
      });
      return mockSiteVisits;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-visits"] });
    },
  });

  return {
    useGetVisits,
    scheduleVisit: scheduleVisitMutation.mutateAsync,
    updateVisitStatus: updateVisitStatusMutation.mutateAsync,
  };
}
