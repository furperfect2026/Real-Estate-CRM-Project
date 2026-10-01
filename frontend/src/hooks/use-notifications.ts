"use client";

import { useState, useEffect, useMemo } from "react";
import { useActiveRole } from "@/hooks/use-active-role";

export type NotificationType =
  | "MISSED_FOLLOW_UP"
  | "SITE_VISIT_TODAY"
  | "POST_VISIT_FEEDBACK"
  | "LEAD_ASSIGNED"
  | "DEAL_AT_RISK";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  client_name?: string;
  client_phone?: string;
  project_name?: string;
  lead_id?: string;
  site_visit_id?: string;
  pickup_required?: boolean;
  pickup_location?: string;
  urgency: "HIGH" | "MEDIUM" | "NORMAL";
  read: boolean;
  time_label: string;
  created_at: string;
  target_role: "ALL" | "EMPLOYEE" | "MANAGER" | "ADMIN";
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif_1",
    type: "MISSED_FOLLOW_UP",
    title: "Missed Follow-Up: Vikram Rao",
    description: "Scheduled follow-up call was due today at 10:30 AM for Pride World City. Client is looking for 3 BHK under ₹1.4 Cr.",
    client_name: "Vikram Rao",
    client_phone: "+91 97654 32190",
    project_name: "Pride World City",
    lead_id: "5",
    urgency: "HIGH",
    read: false,
    time_label: "Overdue by 1 hr",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    target_role: "EMPLOYEE",
  },
  {
    id: "notif_2",
    type: "SITE_VISIT_TODAY",
    title: "Site Visit Today at 11:00 AM: Arun Deshmukh",
    description: "Scheduled tour for Tathastu Residency. Cab pickup required at Kalyani Nagar Metro Station at 10:30 AM.",
    client_name: "Arun Deshmukh",
    client_phone: "+91 98765 43210",
    project_name: "Tathastu Residency",
    site_visit_id: "sv_1",
    lead_id: "1",
    pickup_required: true,
    pickup_location: "Kalyani Nagar Metro Station",
    urgency: "HIGH",
    read: false,
    time_label: "Today at 11:00 AM",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    target_role: "ALL",
  },
  {
    id: "notif_3",
    type: "POST_VISIT_FEEDBACK",
    title: "Action Needed: Ananya Iyer Site Visit Completed",
    description: "Client completed visit for Tathastu Greens on Sep 14. Liked clubhouse layout; log price negotiation notes.",
    client_name: "Ananya Iyer",
    client_phone: "+91 98112 33445",
    project_name: "Tathastu Greens",
    site_visit_id: "sv_3",
    lead_id: "4",
    urgency: "MEDIUM",
    read: false,
    time_label: "Pending Negotiation",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    target_role: "ALL",
  },
  {
    id: "notif_4",
    type: "LEAD_ASSIGNED",
    title: "New Leads Allocated by Manager Anmol",
    description: "4 verified inbound leads from MagicBricks & 99acres routed to your calling desk.",
    client_name: "Batch Intake",
    client_phone: "+91 98201 92831",
    project_name: "Tathastu Heights",
    urgency: "NORMAL",
    read: false,
    time_label: "25 mins ago",
    created_at: new Date(Date.now() - 1500000).toISOString(),
    target_role: "EMPLOYEE",
  },
  {
    id: "notif_5",
    type: "DEAL_AT_RISK",
    title: "Team SLA Warning: 2 Leads Uncalled > 3 Hours",
    description: "Inbound leads in Kharadi cluster have not received initial connection. Reassign or prompt callers.",
    client_name: "Inbound Pool",
    project_name: "Tathastu Central",
    urgency: "HIGH",
    read: false,
    time_label: "SLA Alert",
    created_at: new Date(Date.now() - 1800000).toISOString(),
    target_role: "MANAGER",
  },
  {
    id: "notif_6",
    type: "SITE_VISIT_TODAY",
    title: "Site Visit Tomorrow: Siddhi Verma",
    description: "Family tour scheduled for Tathastu Heights tomorrow at 03:30 PM. Needs sample flat tour guide.",
    client_name: "Siddhi Verma",
    client_phone: "+91 91234 56789",
    project_name: "Tathastu Heights",
    site_visit_id: "sv_2",
    lead_id: "2",
    pickup_required: false,
    urgency: "NORMAL",
    read: true,
    time_label: "Tomorrow, 3:30 PM",
    created_at: new Date(Date.now() - 10800000).toISOString(),
    target_role: "ALL",
  },
];

const NOTIFICATIONS_STORAGE_KEY = "tathastu_notifications";

export function useNotifications() {
  const { currentUser } = useActiveRole();
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        setNotifications(INITIAL_NOTIFICATIONS);
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      }
    } catch (e) {
      setNotifications(INITIAL_NOTIFICATIONS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage helper
  const persistNotifications = (updated: AppNotification[]) => {
    setNotifications(updated);
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  // Filter based on active role perspective
  const roleFilteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (n.target_role === "ALL") return true;
      if (currentUser.role === "ADMIN") return true; // Admin sees everything
      if (currentUser.role === "MANAGER") {
        return n.target_role === "MANAGER";
      }
      if (currentUser.role === "EMPLOYEE") {
        return n.target_role === "EMPLOYEE";
      }
      return true;
    });
  }, [notifications, currentUser.role]);

  const unreadCount = useMemo(() => {
    return roleFilteredNotifications.filter((n) => !n.read).length;
  }, [roleFilteredNotifications]);

  const urgentCount = useMemo(() => {
    return roleFilteredNotifications.filter((n) => !n.read && n.urgency === "HIGH").length;
  }, [roleFilteredNotifications]);

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    persistNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    persistNotifications(updated);
  };

  const dismissNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    persistNotifications(updated);
  };

  const resetSampleNotifications = () => {
    persistNotifications(INITIAL_NOTIFICATIONS);
  };

  return {
    notifications: roleFilteredNotifications,
    allNotifications: notifications,
    unreadCount,
    urgentCount,
    isLoaded,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    resetSampleNotifications,
  };
}
