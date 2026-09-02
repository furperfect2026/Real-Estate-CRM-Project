"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  PhoneCall,
  MessageCircle,
  Car,
  AlertTriangle,
  Clock,
  ExternalLink,
  Trash2,
  PhoneMissed,
  Sparkles,
  Inbox,
  ShieldAlert,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNotifications, AppNotification } from "@/hooks/use-notifications";
import { useActiveRole } from "@/hooks/use-active-role";
import { CallenDialerDialog } from "@/components/leads/callen-dialer-dialog";
import { toast } from "sonner";
import Link from "next/link";

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    urgentCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    resetSampleNotifications,
  } = useNotifications();

  const { currentUser } = useActiveRole();
  const [activeFilter, setActiveFilter] = useState<"ALL" | "FOLLOW_UP" | "SITE_VISIT">("ALL");
  const [dialerLead, setDialerLead] = useState<any | null>(null);

  const filteredList = notifications.filter((n) => {
    if (activeFilter === "FOLLOW_UP") {
      return n.type === "MISSED_FOLLOW_UP" || n.type === "DEAL_AT_RISK";
    }
    if (activeFilter === "SITE_VISIT") {
      return n.type === "SITE_VISIT_TODAY" || n.type === "POST_VISIT_FEEDBACK";
    }
    return true;
  });

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "MISSED_FOLLOW_UP":
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <PhoneMissed className="w-4 h-4" />
          </div>
        );
      case "SITE_VISIT_TODAY":
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Car className="w-4 h-4" />
          </div>
        );
      case "POST_VISIT_FEEDBACK":
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case "LEAD_ASSIGNED":
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case "DEAL_AT_RISK":
        return (
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const handleLaunchCallen = (n: AppNotification) => {
    const fakeLead = {
      id: n.lead_id || "1",
      first_name: n.client_name?.split(" ")[0] || "Client",
      last_name: n.client_name?.split(" ").slice(1).join(" ") || "",
      phone: n.client_phone || "+91 98765 43210",
      project_name: n.project_name || "Tathastu Residency",
      budget: "₹95 Lakhs",
      stage: "CALLING" as any,
    };
    markAsRead(n.id);
    setDialerLead(fakeLead);
  };

  const handleLaunchWhatsApp = (n: AppNotification) => {
    markAsRead(n.id);
    const cleanPhone = (n.client_phone || "9876543210").replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Hello ${n.client_name || "Sir/Madam"}! 👋 Gayatri here from Tathastu Infra. I am following up regarding your query for ${n.project_name || "our properties"}. When would be a convenient time for a quick 2-minute call?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
    toast.success(`Opening WhatsApp for ${n.client_name}...`);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-hidden cursor-pointer"
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center pointer-events-none">
              {urgentCount > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              )}
              <span className="relative inline-flex items-center justify-center px-1 h-4 min-w-4 text-[10px] font-extrabold text-white bg-rose-600 rounded-full shadow-xs">
                {unreadCount}
              </span>
            </span>
          )}
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-[420px] max-w-[95vw] p-0 bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px] font-bold px-1.5 py-0.2">
                  {unreadCount} Unread
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-7 px-2 font-semibold flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </Button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pt-2.5 pb-1 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeFilter === "ALL"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("FOLLOW_UP")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeFilter === "FOLLOW_UP"
                    ? "bg-rose-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <PhoneMissed className="w-3 h-3" />
                <span>Follow-Ups</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("SITE_VISIT")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeFilter === "SITE_VISIT"
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Car className="w-3 h-3" />
                <span>Site Visits</span>
              </button>
            </div>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredList.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center text-slate-400">
                <Inbox className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-medium text-slate-600">No active alerts in this tab</p>
                <p className="text-[11px] text-slate-400 mt-0.5">You're all caught up with your follow-ups!</p>
              </div>
            ) : (
              filteredList.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition-colors hover:bg-slate-50/80 ${
                    !n.read ? "bg-blue-50/30" : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(n.type)}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {n.time_label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {n.description}
                      </p>

                      {/* Pickup / Context Pill */}
                      {n.pickup_required && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          <Car className="w-3 h-3 text-amber-600" />
                          <span>Cab Pickup: {n.pickup_location}</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-1.5">
                        {n.client_phone && (
                          <Button
                            size="sm"
                            onClick={() => handleLaunchCallen(n)}
                            className="h-6 px-2 text-[10px] font-bold bg-primary hover:bg-primary/90 text-white rounded-md flex items-center gap-1 shadow-2xs"
                          >
                            <PhoneCall className="w-2.5 h-2.5" />
                            <span>Call (Callen)</span>
                          </Button>
                        )}

                        {n.client_phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLaunchWhatsApp(n)}
                            className="h-6 px-2 text-[10px] font-bold border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 rounded-md flex items-center gap-1"
                          >
                            <MessageCircle className="w-2.5 h-2.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </Button>
                        )}

                        {n.site_visit_id && (
                          <Link href="/site-visits">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(n.id)}
                              className="h-6 px-2 text-[10px] font-bold border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 rounded-md flex items-center gap-1"
                            >
                              <ExternalLink className="w-2.5 h-2.5 text-blue-600" />
                              <span>View Tour</span>
                            </Button>
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => dismissNotification(n.id)}
                          className="ml-auto text-[10px] text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
                          title="Dismiss notification"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Targeted for: <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.portal_title})
            </span>
            <button
              type="button"
              onClick={resetSampleNotifications}
              className="text-[10px] text-indigo-600 hover:underline font-semibold"
            >
              Reset Demo Alerts
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Embedded Callen Cloud Dialer for 1-Click Calls */}
      <CallenDialerDialog
        lead={dialerLead}
        isOpen={!!dialerLead}
        onClose={() => setDialerLead(null)}
        currentUser={currentUser.name}
      />
    </>
  );
}
