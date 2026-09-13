import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Lead, LeadStage, CallLog, LeadActivity } from '@/lib/types';
import { getStoredTathastuUsers } from '@/hooks/use-users';

// Mock data reflecting Tathastu Infra Lead Management Flow
let mockLeads: Lead[] = [
  {
    id: "1",
    first_name: "Abhi",
    last_name: "Sharma",
    email: "abhi@example.com",
    phone: "+91 98765 43210",
    source: "Facebook Ads",
    budget: "₹65,00,000",
    project_name: "Tathastu Residency",
    pipeline_stage_id: "5",
    stage: "SITE_VISIT",
    manager_id: "mgr_1",
    manager_name: "Anmol",
    employee_id: "emp_1",
    employee_name: "Gayatri",
    assigned_by: "Anmol (Manager)",
    assigned_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    last_contacted_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    next_follow_up: "Tomorrow at 11:00 AM",
    admin_notes: "SBI pre-approved loan of ₹60L. Highly interested in Tower B Unit 402 (East-Facing). Push builder discount of ₹1.5L if closed before month-end.",
    admin_sentiment: "HOT_PROSPECT",
    call_logs: [
      {
        id: "call_1",
        timestamp: new Date(Date.now() - 86400000 * 2.5).toISOString(),
        duration_seconds: 245,
        agent_name: "Gayatri",
        outcome: "CONNECTED",
        notes: "First follow-up call. Discussed 3BHK flat requirement, budget of 65L, and SBI home loan pre-approval.",
        recording_url: "simulated_recording_abhi_01.mp3",
        quality_score: 94,
        sentiment: "VERY_POSITIVE",
        is_first_call: true,
        transcript_snippet: "Gayatri: 'Namaskar Abhi ji, I am Gayatri calling from Tathastu Infra regarding your inquiry for Tathastu Residency...' Abhi: 'Yes, looking for a 3BHK ready-to-move unit with east entrance...' Gayatri: 'We have Unit 402 with 1180 sq.ft carpet area matching your exact preference.'",
      },
      {
        id: "call_2",
        timestamp: new Date(Date.now() - 86400000 * 1.2).toISOString(),
        duration_seconds: 180,
        agent_name: "Gayatri",
        outcome: "SCHEDULED_VISIT",
        notes: "Customer confirmed site visit for Saturday 11:30 AM with spouse. Arranging luxury AC cab pickup.",
        follow_up_date: "Saturday, 11:30 AM",
        recording_url: "simulated_recording_abhi_02.mp3",
        quality_score: 91,
        sentiment: "POSITIVE",
        is_first_call: false,
        transcript_snippet: "Gayatri: 'Good afternoon Abhi ji! Did you get a chance to review the floor plans on WhatsApp?' Abhi: 'Yes, my wife loved the layout. Can we visit this Saturday at 11:30 AM?' Gayatri: 'Confirmed, I will book your VIP site visit and arrange a complimentary cab.'",
      }
    ],
    activities: [
      {
        id: "act_1",
        lead_id: "1",
        type: "INTAKE",
        title: "Lead Captured & Ingested",
        description: "Inquiry received via Facebook Ads campaign (Campaign: Pune Luxury Living 3BHK). Client expressed interest in Tathastu Residency with budget ₹65,00,000.",
        performed_by: "System (Meta Ads Sync)",
        performed_by_role: "System Ingestion",
        timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
        badge: "Ingestion",
        metadata: { channel: "SYSTEM" }
      },
      {
        id: "act_2",
        lead_id: "1",
        type: "ASSIGNMENT",
        title: "Tier 1: Assigned to Sales Manager",
        description: "Super Admin Rohit Nalpe assigned incoming lead to Sales Manager Anmol for qualification & team allocation.",
        performed_by: "Rohit Nalpe",
        performed_by_role: "Super Admin",
        timestamp: new Date(Date.now() - 86400000 * 3.8).toISOString(),
        badge: "Admin Action",
        metadata: { assigned_from: "Rohit Nalpe", assigned_to: "Anmol (Manager)" }
      },
      {
        id: "act_3",
        lead_id: "1",
        type: "ASSIGNMENT",
        title: "Tier 2: Delegated to Caller Gayatri",
        description: "Manager Anmol delegated lead to Sales Executive & Caller Gayatri for immediate 15-minute phone outreach.",
        performed_by: "Anmol",
        performed_by_role: "Sales Manager",
        timestamp: new Date(Date.now() - 86400000 * 3.2).toISOString(),
        badge: "Manager Delegation",
        metadata: { assigned_from: "Anmol", assigned_to: "Gayatri (Caller)" }
      },
      {
        id: "act_4",
        lead_id: "1",
        type: "FIRST_CALL",
        title: "First Follow-Up Call Connected (4m 05s)",
        description: "Gayatri connected with Abhi Sharma. Customer verified requirement: 3BHK ready possession, pre-approved loan of ₹60L with SBI. Audio recording secured for audit.",
        performed_by: "Gayatri",
        performed_by_role: "Sales Caller",
        timestamp: new Date(Date.now() - 86400000 * 2.5).toISOString(),
        badge: "First Touchpoint",
        metadata: { duration_seconds: 245, call_outcome: "CONNECTED", recording_available: true }
      },
      {
        id: "act_5",
        lead_id: "1",
        type: "WHATSAPP",
        title: "Digital Brochure & Floor Plan Sent",
        description: "Dispatched Tathastu Residency high-res project brochure, carpet area breakdown, and sample walk-through video via WhatsApp API.",
        performed_by: "Gayatri",
        performed_by_role: "Sales Caller",
        timestamp: new Date(Date.now() - 86400000 * 2.3).toISOString(),
        badge: "WhatsApp",
        metadata: { channel: "WHATSAPP" }
      },
      {
        id: "act_6",
        lead_id: "1",
        type: "FOLLOW_UP_CALL",
        title: "Second Call & Site Visit Scheduled",
        description: "Follow-up conversation (3m 00s). Abhi Sharma confirmed visit with family. Agreed on Saturday 11:30 AM slot.",
        performed_by: "Gayatri",
        performed_by_role: "Sales Caller",
        timestamp: new Date(Date.now() - 86400000 * 1.2).toISOString(),
        badge: "Follow-up Call",
        metadata: { duration_seconds: 180, call_outcome: "SCHEDULED_VISIT", recording_available: true }
      },
      {
        id: "act_7",
        lead_id: "1",
        type: "SITE_VISIT",
        title: "VIP Site Visit Confirmed",
        description: "Inspection scheduled for Saturday 11:30 AM. Complimentary luxury cab dispatch arranged from Baner residence.",
        performed_by: "Gayatri",
        performed_by_role: "Sales Caller",
        timestamp: new Date(Date.now() - 86400000 * 1.1).toISOString(),
        badge: "Site Visit",
        metadata: { stage_from: "CALLING", stage_to: "SITE_VISIT" }
      }
    ],
    notes: "High intent buyer, looking for ready possession."
  },
  {
    id: "2",
    first_name: "Siddhi",
    last_name: "Verma",
    email: "siddhi@example.com",
    phone: "+91 91234 56789",
    source: "Website",
    budget: "₹95,00,000",
    project_name: "Tathastu Heights",
    pipeline_stage_id: "6",
    stage: "NEGOTIATION",
    manager_id: "mgr_2",
    manager_name: "Priya Sharma",
    employee_id: "emp_3",
    employee_name: "Vikram Malhotra",
    assigned_by: "Priya Sharma",
    assigned_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    last_contacted_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    next_follow_up: "Today at 4:00 PM",
    call_logs: [
      {
        id: "call_3",
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        duration_seconds: 340,
        agent_name: "Vikram Malhotra",
        outcome: "CONNECTED",
        notes: "Offer discussed: ₹92 Lakhs all inclusive. Awaiting builder confirmation on parking slot."
      }
    ]
  },
  {
    id: "3",
    first_name: "Ramesh",
    last_name: "Chawla",
    email: "ramesh.c@gmail.com",
    phone: "+91 99887 76655",
    source: "Google Ads",
    budget: "₹45,00,000",
    project_name: "Tathastu Greens",
    pipeline_stage_id: "1",
    stage: "NEW_LEAD",
    manager_id: null,
    manager_name: null,
    employee_id: null,
    employee_name: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: "Direct Google Search inquiry for 2BHK under 50L."
  },
  {
    id: "4",
    first_name: "Ananya",
    last_name: "Iyer",
    email: "ananya.iyer@outlook.com",
    phone: "+91 98112 33445",
    source: "99acres",
    budget: "₹1,20,00,000",
    project_name: "Tathastu Heights",
    pipeline_stage_id: "2",
    stage: "ASSIGNED",
    manager_id: "mgr_1",
    manager_name: "Anmol",
    employee_id: null,
    employee_name: null,
    assigned_by: "Rohit Nalpe (Admin)",
    assigned_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
    notes: "Assigned to Manager Anmol. Awaiting caller assignment."
  },
  {
    id: "5",
    first_name: "Rohan",
    last_name: "Mehra",
    email: "rohan.mehra@yahoo.com",
    phone: "+91 97654 32190",
    source: "MagicBricks",
    budget: "₹80,00,000",
    project_name: "Tathastu Residency",
    pipeline_stage_id: "3",
    stage: "CALLING",
    manager_id: "mgr_1",
    manager_name: "Anmol",
    employee_id: "emp_1",
    employee_name: "Gayatri",
    assigned_by: "Anmol",
    assigned_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    last_contacted_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    call_logs: [
      {
        id: "call_4",
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        duration_seconds: 45,
        agent_name: "Neha Joshi",
        outcome: "CALLBACK",
        notes: "Customer in a meeting. Requested callback in evening around 6:30 PM.",
        follow_up_date: "Today, 6:30 PM"
      }
    ]
  },
  {
    id: "6",
    first_name: "Pooja",
    last_name: "Bhatt",
    email: "pooja.b@gmail.com",
    phone: "+91 98223 44556",
    source: "Justdial",
    budget: "₹55,00,000",
    project_name: "Tathastu Enclave",
    pipeline_stage_id: "4",
    stage: "INTERESTED",
    manager_id: "mgr_2",
    manager_name: "Priya Sharma",
    employee_id: "emp_4",
    employee_name: "Sneha Kulkarni",
    assigned_by: "Priya Sharma",
    assigned_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    last_contacted_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    call_logs: [
      {
        id: "call_5",
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        duration_seconds: 290,
        agent_name: "Sneha Kulkarni",
        outcome: "CONNECTED",
        notes: "Customer interested in east-facing units on middle floors. Sent digital brochure via WhatsApp."
      }
    ]
  },
  {
    id: "7",
    first_name: "Manish",
    last_name: "Malhotra",
    email: "manish.m@malhotracorp.in",
    phone: "+91 99334 55667",
    source: "Walk-ins",
    budget: "₹1,40,00,000",
    project_name: "Tathastu Villa",
    pipeline_stage_id: "7",
    stage: "CONVERTED",
    manager_id: "mgr_2",
    manager_name: "Priya Sharma",
    employee_id: "emp_3",
    employee_name: "Vikram Malhotra",
    assigned_by: "Priya Sharma",
    assigned_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    last_contacted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: "Booking amount ₹5,00,000 received. Sale agreement scheduled for signing."
  },
  {
    id: "8",
    first_name: "Kunal",
    last_name: "Shah",
    email: "kunal.shah@gmail.com",
    phone: "+91 99887 76655", // duplicate phone matching Ramesh Chawla
    source: "Website",
    budget: "₹45,00,000",
    project_name: "Tathastu Greens",
    pipeline_stage_id: "1",
    stage: "NEW_LEAD",
    manager_id: null,
    manager_name: null,
    employee_id: null,
    employee_name: null,
    is_duplicate: true,
    duplicate_reason: "Same phone number as Ramesh Chawla (+91 99887 76655)",
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    notes: "Flagged by Tathastu Duplicate Detection Engine."
  }
];

// Stage mapping to pipeline ID
const STAGE_TO_PIPELINE_MAP: Record<LeadStage, string> = {
  'NEW_LEAD': '1',
  'ASSIGNED': '2',
  'CALLING': '3',
  'INTERESTED': '4',
  'SITE_VISIT': '5',
  'NEGOTIATION': '6',
  'CONVERTED': '7',
  'LOST': '1',
  'SPAM': '1',
};

export function useLeads() {
  const queryClient = useQueryClient();

  const useGetLeads = () => {
    return useQuery({
      queryKey: ['leads'],
      queryFn: async () => {
        return { items: [...mockLeads] };
      },
    });
  };

  const useGetLead = (id: string) => {
    return useQuery({
      queryKey: ['leads', id],
      queryFn: async () => {
        return mockLeads.find(l => l.id === id);
      },
      enabled: !!id,
    });
  };

  const createLeadMutation = useMutation({
    mutationFn: async (leadData: Partial<Lead>) => {
      const newLead: Lead = {
        id: Math.random().toString(36).substring(2, 9),
        first_name: leadData.first_name || "New",
        last_name: leadData.last_name || "Lead",
        email: leadData.email || "",
        phone: leadData.phone || "",
        source: leadData.source || "Website",
        budget: leadData.budget || "₹50,00,000",
        project_name: leadData.project_name || "Tathastu Residency",
        stage: "NEW_LEAD",
        pipeline_stage_id: "1",
        manager_id: null,
        manager_name: null,
        employee_id: null,
        employee_name: null,
        created_at: new Date().toISOString(),
        call_logs: [],
        ...leadData,
      };

      // Check duplicate phone
      const duplicate = mockLeads.find(l => l.phone && l.phone.replace(/[^0-9]/g, '') === newLead.phone.replace(/[^0-9]/g, ''));
      if (duplicate) {
        newLead.is_duplicate = true;
        newLead.duplicate_reason = `Matches phone number with ${duplicate.first_name} ${duplicate.last_name}`;
      }

      mockLeads = [newLead, ...mockLeads];
      return newLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, ...leadData }: Partial<Lead> & { id: string }) => {
      const index = mockLeads.findIndex(l => l.id === id);
      if (index !== -1) {
        mockLeads[index] = { ...mockLeads[index], ...leadData };
        return mockLeads[index];
      }
      throw new Error("Lead not found");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    },
  });

  // Assign to Manager (Admin responsibility)
  const assignToManagerMutation = useMutation({
    mutationFn: async ({ leadId, managerId, managerName }: { leadId: string; managerId: string; managerName: string }) => {
      const index = mockLeads.findIndex(l => l.id === leadId);
      if (index !== -1) {
        mockLeads[index] = {
          ...mockLeads[index],
          manager_id: managerId,
          manager_name: managerName,
          assigned_by: "Admin (Rohit Nalpe)",
          assigned_at: new Date().toISOString(),
          stage: mockLeads[index].stage === 'NEW_LEAD' ? 'ASSIGNED' : mockLeads[index].stage,
          pipeline_stage_id: mockLeads[index].stage === 'NEW_LEAD' ? '2' : mockLeads[index].pipeline_stage_id,
        };
        return mockLeads[index];
      }
      throw new Error("Lead not found");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.leadId] });
    },
  });

  // Assign to Employee (Manager responsibility)
  const assignToEmployeeMutation = useMutation({
    mutationFn: async ({ leadId, employeeId, employeeName }: { leadId: string; employeeId: string; employeeName: string }) => {
      const index = mockLeads.findIndex(l => l.id === leadId);
      if (index !== -1) {
        mockLeads[index] = {
          ...mockLeads[index],
          employee_id: employeeId,
          employee_name: employeeName,
          assigned_to: employeeId,
          assigned_at: new Date().toISOString(),
          stage: mockLeads[index].stage === 'NEW_LEAD' ? 'ASSIGNED' : mockLeads[index].stage,
          pipeline_stage_id: mockLeads[index].stage === 'NEW_LEAD' ? '2' : mockLeads[index].pipeline_stage_id,
        };
        return mockLeads[index];
      }
      throw new Error("Lead not found");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.leadId] });
    },
  });

  // Update Lead Stage / Status
  const updateStageMutation = useMutation({
    mutationFn: async ({ leadId, stage }: { leadId: string; stage: LeadStage }) => {
      const index = mockLeads.findIndex(l => l.id === leadId);
      if (index !== -1) {
        mockLeads[index] = {
          ...mockLeads[index],
          stage,
          pipeline_stage_id: STAGE_TO_PIPELINE_MAP[stage] || '1',
          updated_at: new Date().toISOString(),
        };
        return mockLeads[index];
      }
      throw new Error("Lead not found");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.leadId] });
    },
  });

  // Log Call via Callen
  const logCallMutation = useMutation({
    mutationFn: async ({ leadId, callLog, nextStage }: { leadId: string; callLog: CallLog; nextStage?: LeadStage }) => {
      const index = mockLeads.findIndex(l => l.id === leadId);
      if (index !== -1) {
        const existingLogs = mockLeads[index].call_logs || [];
        const isFirstCall = existingLogs.length === 0;
        const enhancedCallLog: CallLog = {
          ...callLog,
          is_first_call: isFirstCall,
          recording_url: callLog.recording_url || `simulated_call_${Date.now()}.mp3`,
          quality_score: callLog.quality_score || 92,
          sentiment: callLog.sentiment || (callLog.outcome === 'SCHEDULED_VISIT' ? 'VERY_POSITIVE' : callLog.outcome === 'CONNECTED' ? 'POSITIVE' : 'NEUTRAL'),
          transcript_snippet: callLog.transcript_snippet || `${callLog.agent_name}: "Calling regarding your property requirement with Tathastu Infra..." Notes: ${callLog.notes}`,
        };

        const newStage = nextStage || (mockLeads[index].stage === 'NEW_LEAD' || mockLeads[index].stage === 'ASSIGNED' ? 'CALLING' : mockLeads[index].stage);
        
        // Add timeline activity
        const newActivity: LeadActivity = {
          id: `act_${Date.now()}`,
          lead_id: leadId,
          type: isFirstCall ? 'FIRST_CALL' : 'FOLLOW_UP_CALL',
          title: isFirstCall ? `First Follow-Up Call (${Math.floor(enhancedCallLog.duration_seconds / 60)}m ${enhancedCallLog.duration_seconds % 60}s)` : `Follow-Up Call (${Math.floor(enhancedCallLog.duration_seconds / 60)}m ${enhancedCallLog.duration_seconds % 60}s)`,
          description: `${enhancedCallLog.agent_name} logged call disposition: ${enhancedCallLog.outcome}. ${enhancedCallLog.notes}`,
          performed_by: enhancedCallLog.agent_name,
          performed_by_role: "Sales Executive / Caller",
          timestamp: enhancedCallLog.timestamp,
          badge: isFirstCall ? "First Touchpoint" : "Follow-up",
          metadata: {
            duration_seconds: enhancedCallLog.duration_seconds,
            call_outcome: enhancedCallLog.outcome,
            recording_available: true,
          }
        };

        const existingActivities = mockLeads[index].activities || [];

        mockLeads[index] = {
          ...mockLeads[index],
          stage: newStage,
          pipeline_stage_id: STAGE_TO_PIPELINE_MAP[newStage] || mockLeads[index].pipeline_stage_id,
          last_contacted_at: enhancedCallLog.timestamp,
          next_follow_up: enhancedCallLog.follow_up_date || mockLeads[index].next_follow_up,
          call_logs: [enhancedCallLog, ...existingLogs],
          activities: [newActivity, ...existingActivities],
        };
        return mockLeads[index];
      }
      throw new Error("Lead not found");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.leadId] });
    },
  });

  // Admin Superpower: Update Confidential Admin Notes & Sentiment Score
  const updateAdminNotesMutation = useMutation({
    mutationFn: async ({ 
      leadId, 
      adminNotes, 
      adminSentiment 
    }: { 
      leadId: string; 
      adminNotes: string; 
      adminSentiment?: Lead['admin_sentiment'] 
    }) => {
      const index = mockLeads.findIndex(l => l.id === leadId);
      if (index !== -1) {
        const existingActivities = mockLeads[index].activities || [];
        const noteActivity: LeadActivity = {
          id: `act_admin_note_${Date.now()}`,
          lead_id: leadId,
          type: "NOTE",
          title: "Confidential Admin Note Added",
          description: `Super Admin Rohit Nalpe updated private management notes: "${adminNotes}"`,
          performed_by: "Rohit Nalpe",
          performed_by_role: "Super Admin",
          timestamp: new Date().toISOString(),
          badge: "Confidential",
          metadata: { channel: "ADMIN" }
        };

        mockLeads[index] = {
          ...mockLeads[index],
          admin_notes: adminNotes,
          admin_sentiment: adminSentiment || mockLeads[index].admin_sentiment,
          activities: [noteActivity, ...existingActivities],
          updated_at: new Date().toISOString(),
        };
        return mockLeads[index];
      }
      throw new Error("Lead not found");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.leadId] });
    },
  });

  // Admin Superpower: 1-Click Direct Admin Reassignment Override
  const adminOverrideReassignMutation = useMutation({
    mutationFn: async ({
      leadId,
      managerId,
      managerName,
      employeeId,
      employeeName,
      reason
    }: {
      leadId: string;
      managerId?: string;
      managerName?: string;
      employeeId?: string;
      employeeName?: string;
      reason: string;
    }) => {
      const index = mockLeads.findIndex(l => l.id === leadId);
      if (index !== -1) {
        const lead = mockLeads[index];
        const prevMgr = lead.manager_name || "Unassigned";
        const prevEmp = lead.employee_name || "Unassigned";
        const newMgr = managerName || lead.manager_name;
        const newEmp = employeeName || lead.employee_name;

        const overrideActivity: LeadActivity = {
          id: `act_override_${Date.now()}`,
          lead_id: leadId,
          type: "ADMIN_OVERRIDE",
          title: "Super Admin Direct Reassignment Override",
          description: `Reassigned by Rohit Nalpe: Manager (${prevMgr} ➔ ${newMgr}), Caller (${prevEmp} ➔ ${newEmp}). Reason: ${reason}`,
          performed_by: "Rohit Nalpe",
          performed_by_role: "Super Admin",
          timestamp: new Date().toISOString(),
          badge: "Admin Override",
          metadata: {
            assigned_from: `${prevMgr} / ${prevEmp}`,
            assigned_to: `${newMgr} / ${newEmp}`,
            reason
          }
        };

        const existingActivities = lead.activities || [];

        mockLeads[index] = {
          ...lead,
          manager_id: managerId || lead.manager_id,
          manager_name: managerName || lead.manager_name,
          employee_id: employeeId || lead.employee_id,
          employee_name: employeeName || lead.employee_name,
          assigned_by: "Rohit Nalpe (Super Admin Override)",
          assigned_at: new Date().toISOString(),
          activities: [overrideActivity, ...existingActivities],
          updated_at: new Date().toISOString(),
        };
        return mockLeads[index];
      }
      throw new Error("Lead not found");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.leadId] });
    },
  });

  // Smart Auto-Distribution
  const autoDistributeMutation = useMutation({
    mutationFn: async ({ type, managerId }: { type: 'TO_MANAGERS' | 'TO_EMPLOYEES'; managerId?: string }) => {
      const allUsers = getStoredTathastuUsers();

      if (type === 'TO_MANAGERS') {
        const managers = allUsers.filter(u => u.role === 'MANAGER');
        if (managers.length === 0) return mockLeads;
        let mgrIdx = 0;
        mockLeads = mockLeads.map(lead => {
          if (!lead.manager_id && lead.stage === 'NEW_LEAD' && !lead.is_duplicate) {
            const assignedMgr = managers[mgrIdx % managers.length];
            mgrIdx++;
            const mgrName = `${assignedMgr.first_name} ${assignedMgr.last_name}`.trim();
            return {
              ...lead,
              manager_id: assignedMgr.id,
              manager_name: mgrName,
              assigned_by: "Auto-Distribution Engine (Super Admin Rohit Nalpe)",
              assigned_at: new Date().toISOString(),
              stage: 'ASSIGNED',
              pipeline_stage_id: '2',
            };
          }
          return lead;
        });
      } else {
        // Distribute to active callers/employees
        const callers = allUsers.filter(u => u.role === 'EMPLOYEE');
        if (callers.length === 0) return mockLeads;
        let empIdx = 0;
        mockLeads = mockLeads.map(lead => {
          // If managerId specified, match that manager, otherwise distribute any assigned lead without employee
          const matchManager = managerId ? lead.manager_id === managerId : !!lead.manager_id;
          if (matchManager && !lead.employee_id && lead.stage !== 'LOST' && lead.stage !== 'SPAM') {
            const emp = callers[empIdx % callers.length];
            empIdx++;
            const empName = `${emp.first_name} ${emp.last_name}`.trim();
            return { 
              ...lead, 
              employee_id: emp.id, 
              employee_name: empName, 
              assigned_to: emp.id,
              stage: (lead.stage === 'NEW_LEAD' || lead.stage === 'ASSIGNED') ? 'CALLING' : lead.stage,
              pipeline_stage_id: (lead.stage === 'NEW_LEAD' || lead.stage === 'ASSIGNED') ? '3' : lead.pipeline_stage_id,
              updated_at: new Date().toISOString()
            };
          }
          return lead;
        });
      }
      return mockLeads;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  // Bulk Assign to Manager
  const bulkAssignToManagerMutation = useMutation({
    mutationFn: async ({ leadIds, managerId, managerName }: { leadIds: string[]; managerId: string; managerName: string }) => {
      mockLeads = mockLeads.map(lead => {
        if (leadIds.includes(lead.id)) {
          const nextStage: LeadStage = lead.stage === 'NEW_LEAD' ? 'ASSIGNED' : lead.stage;
          return {
            ...lead,
            manager_id: managerId,
            manager_name: managerName,
            stage: nextStage,
            pipeline_stage_id: STAGE_TO_PIPELINE_MAP[nextStage],
            assigned_by: "Admin (Bulk Assignment)",
            assigned_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        return lead;
      });
      return mockLeads;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  // Bulk Assign to Employee
  const bulkAssignToEmployeeMutation = useMutation({
    mutationFn: async ({ leadIds, employeeId, employeeName }: { leadIds: string[]; employeeId: string; employeeName: string }) => {
      mockLeads = mockLeads.map(lead => {
        if (leadIds.includes(lead.id)) {
          return {
            ...lead,
            employee_id: employeeId,
            employee_name: employeeName,
            assigned_to: employeeId,
            updated_at: new Date().toISOString(),
          };
        }
        return lead;
      });
      return mockLeads;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  // Bulk Create Leads (from Excel / CSV / Raw Pile) with Instant Distribution
  const bulkCreateLeadsMutation = useMutation({
    mutationFn: async ({
      leads,
      distribution
    }: {
      leads: Array<{
        first_name: string;
        last_name?: string;
        phone: string;
        email?: string;
        budget?: string;
        project_name?: string;
        source?: string;
        notes?: string;
      }>;
      distribution: {
        mode: 'UNASSIGNED' | 'TO_MANAGER' | 'TO_CALLER' | 'AUTO_SPLIT';
        managerId?: string;
        managerName?: string;
        employeeId?: string;
        employeeName?: string;
      };
    }) => {
      const now = new Date().toISOString();
      const newCreatedLeads: Lead[] = leads.map((input, idx) => {
        const cleanPhone = input.phone.trim();
        const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
        
        let formattedPhone = cleanPhone;
        if (!cleanPhone.startsWith("+") && digitsOnly.length === 10) {
          formattedPhone = `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`;
        }

        // Check duplicate phone against existing mockLeads
        const existingMatch = mockLeads.find(l => {
          const lDigits = (l.phone || '').replace(/[^0-9]/g, '');
          return lDigits.length >= 10 && digitsOnly.length >= 10 && lDigits.slice(-10) === digitsOnly.slice(-10);
        });

        const isDuplicate = !!existingMatch;
        const duplicateReason = existingMatch 
          ? `Duplicate match with existing lead: ${existingMatch.first_name} ${existingMatch.last_name} (${existingMatch.phone})` 
          : undefined;

        let manager_id: string | null = null;
        let manager_name: string | null = null;
        let employee_id: string | null = null;
        let employee_name: string | null = null;
        let stage: LeadStage = "NEW_LEAD";
        let pipeline_stage_id = "1";
        let assigned_by: string | undefined = undefined;

        if (!isDuplicate) {
          if (distribution.mode === 'TO_MANAGER') {
            manager_id = distribution.managerId || "mgr_1";
            manager_name = distribution.managerName || "Anmol";
            assigned_by = "Admin Bulk Importer (Rohit Nalpe)";
            stage = "ASSIGNED";
            pipeline_stage_id = "2";
          } else if (distribution.mode === 'TO_CALLER') {
            manager_id = distribution.managerId || "mgr_1";
            manager_name = distribution.managerName || "Anmol";
            employee_id = distribution.employeeId || "emp_1";
            employee_name = distribution.employeeName || "Gayatri";
            assigned_by = "Direct Bulk Importer (Tathastu CRM)";
            stage = "CALLING";
            pipeline_stage_id = "3";
          } else if (distribution.mode === 'AUTO_SPLIT') {
            const allUsers = getStoredTathastuUsers();
            const callers = allUsers.filter(u => u.role === 'EMPLOYEE');
            const managers = allUsers.filter(u => u.role === 'MANAGER');
            const defaultMgr = managers[0] || { id: 'mgr_1', first_name: 'Anmol', last_name: '' };
            
            manager_id = defaultMgr.id;
            manager_name = `${defaultMgr.first_name} ${defaultMgr.last_name}`.trim();
            assigned_by = "Auto-Split Round Robin Engine (Tathastu CRM)";

            if (callers.length > 0) {
              const assignedCaller = callers[idx % callers.length];
              employee_id = assignedCaller.id;
              employee_name = `${assignedCaller.first_name} ${assignedCaller.last_name}`.trim();
              stage = "CALLING";
              pipeline_stage_id = "3";
            } else {
              stage = "ASSIGNED";
              pipeline_stage_id = "2";
            }
          }
        }

        return {
          id: Math.random().toString(36).substring(2, 10),
          first_name: input.first_name || "Prospect",
          last_name: input.last_name || "",
          phone: formattedPhone,
          email: input.email || "",
          budget: input.budget || "₹65 L - ₹1.2 Cr",
          project_name: input.project_name || "Tathastu Residency",
          source: (input.source || "Excel/CSV Bulk Import") as any,
          stage,
          pipeline_stage_id,
          manager_id,
          manager_name,
          employee_id,
          employee_name,
          assigned_by,
          assigned_at: (manager_id || employee_id) ? now : undefined,
          is_duplicate: isDuplicate,
          duplicate_reason: duplicateReason,
          created_at: now,
          notes: input.notes || "Imported via bulk client contacts batch.",
          call_logs: [],
        };
      });

      mockLeads = [...newCreatedLeads, ...mockLeads];
      return newCreatedLeads;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  // Remove duplicate/spam
  const removeDuplicateMutation = useMutation({
    mutationFn: async (leadId: string) => {
      mockLeads = mockLeads.filter(l => l.id !== leadId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const { data: leadsData, isLoading } = useGetLeads();

  return {
    leads: leadsData?.items || [],
    isLoading,
    addLead: createLeadMutation.mutateAsync,
    bulkCreateLeads: bulkCreateLeadsMutation.mutateAsync,
    updateLead: updateLeadMutation.mutateAsync,
    assignToManager: assignToManagerMutation.mutateAsync,
    assignToEmployee: assignToEmployeeMutation.mutateAsync,
    bulkAssignToManager: bulkAssignToManagerMutation.mutateAsync,
    bulkAssignToEmployee: bulkAssignToEmployeeMutation.mutateAsync,
    updateStage: updateStageMutation.mutateAsync,
    logCall: logCallMutation.mutateAsync,
    autoDistribute: autoDistributeMutation.mutateAsync,
    removeDuplicate: removeDuplicateMutation.mutateAsync,
    updateAdminNotes: updateAdminNotesMutation.mutateAsync,
    adminOverrideReassign: adminOverrideReassignMutation.mutateAsync,
    useGetLeads,
    useGetLead,
    createLeadMutation,
    updateLeadMutation,
    assignLeadMutation: assignToEmployeeMutation, // backward compat
  };
}
