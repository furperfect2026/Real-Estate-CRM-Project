"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  MapPin, 
  FileCheck2, 
  CheckSquare, 
  Settings,
  ShieldCheck,
  PhoneCall,
  Sparkles
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";
import { useActiveRole } from "@/hooks/use-active-role";

const NAVIGATION = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Sales Pipeline", href: "/pipeline", icon: KanbanSquare },
  { name: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
  { name: "Site Visits", href: "/site-visits", icon: MapPin },
  { name: "Bookings & Clients", href: "/bookings", icon: FileCheck2 },
  { name: "Tasks & Calls", href: "/tasks", icon: CheckSquare },
  { name: "Settings", href: "/settings/general", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { settings } = useOrganization();
  const { currentUser, isAdmin, isManager, isEmployee } = useActiveRole();

  const getInitials = (name: string) => {
    if (!name) return "TI";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Role-specific navigation items
  const navigationItems = isAdmin
    ? [
        { name: "Executive Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "All Inbound Leads", href: "/leads", icon: Users },
        { name: "Property Inventory", href: "/properties", icon: Building2 },
        { name: "Sales Pipeline", href: "/pipeline", icon: KanbanSquare },
        { name: "AI Assistant Hub", href: "/ai-assistant", icon: Sparkles },
        { name: "Site Visits", href: "/site-visits", icon: MapPin },
        { name: "Bookings & Clients", href: "/bookings", icon: FileCheck2 },
        { name: "Tasks & Calls", href: "/tasks", icon: CheckSquare },
        { name: "Settings", href: "/settings/general", icon: Settings },
      ]
    : isManager
    ? [
        { name: "Team Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Team Leads", href: "/leads", icon: Users },
        { name: "Project Inventory", href: "/properties", icon: Building2 },
        { name: "Regional Pipeline", href: "/pipeline", icon: KanbanSquare },
        { name: "AI Sales Copilot", href: "/ai-assistant", icon: Sparkles },
        { name: "Team Site Visits", href: "/site-visits", icon: MapPin },
        { name: "Team Bookings", href: "/bookings", icon: FileCheck2 },
        { name: "Team Tasks", href: "/tasks", icon: CheckSquare },
      ]
    : [
        { name: "My Calling Desk", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Assigned Leads", href: "/leads", icon: Users },
        { name: "Properties & Matching", href: "/properties", icon: Building2 },
        { name: "My Pipeline", href: "/pipeline", icon: KanbanSquare },
        { name: "AI Smart Follow-Up", href: "/ai-assistant", icon: Sparkles },
        { name: "My Site Visits", href: "/site-visits", icon: MapPin },
        { name: "My Tasks", href: "/tasks", icon: CheckSquare },
      ];

  return (
    <div className="hidden md:flex h-full w-64 flex-col border-r border-slate-200/80 bg-white">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold tracking-tight text-base text-slate-900">
          {settings.logo_url ? (
            <img 
              src={settings.logo_url} 
              alt={settings.name} 
              className="w-8 h-8 rounded-xl object-cover shadow-xs border border-slate-200" 
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs text-white font-bold text-xs">
              {getInitials(settings.name)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="truncate max-w-[150px] leading-tight font-bold">{settings.name || "Tathastu Infra"}</span>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
              {currentUser.portal_title}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links - Filtered specifically per role */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
            {isAdmin ? "Admin Navigation" : isManager ? "Manager Navigation" : "Caller Navigation"}
          </p>
          <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
            {currentUser.emp_id}
          </span>
        </div>
        <nav className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-primary text-white shadow-xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Active User Footer Pill with Unique Employee ID */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${currentUser.avatar_color} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs`}>
            {currentUser.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 truncate">
                {currentUser.name}
              </span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {currentUser.emp_id}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
              {currentUser.role === 'ADMIN' ? (
                <ShieldCheck className="w-2.5 h-2.5 text-blue-600 shrink-0" />
              ) : currentUser.role === 'MANAGER' ? (
                <Building2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
              ) : (
                <PhoneCall className="w-2.5 h-2.5 text-purple-600 shrink-0" />
              )}
              <span className="truncate">{currentUser.designation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
