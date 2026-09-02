"use client";

import { Bell, Search, Menu, ChevronDown, ShieldCheck, Users, PhoneCall, Check } from "lucide-react";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActiveRole } from "@/hooks/use-active-role";
import { NotificationBell } from "@/components/layout/notification-bell";
import { toast } from "sonner";
import Link from "next/link";

export function Topbar() {
  const pathname = usePathname();
  const pageTitle = pathname.split("/").filter(Boolean)[0]?.replace("-", " ") || "Dashboard";
  const { currentUser, presetRoles, switchRole } = useActiveRole();

  const handleRoleChange = (roleId: string, roleName: string, designation: string) => {
    switchRole(roleId);
    toast.success(`Switched active view to: ${roleName} (${designation})`);
  };

  const getRoleIcon = (role: string) => {
    if (role === "ADMIN") return <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />;
    if (role === "MANAGER") return <Users className="w-3.5 h-3.5 text-emerald-600" />;
    return <PhoneCall className="w-3.5 h-3.5 text-purple-600" />;
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 backdrop-blur px-6 shadow-2xs">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold capitalize hidden sm:block text-slate-900 tracking-tight">
          {pageTitle}
        </h1>
        <div className="w-full max-w-xs relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            type="search"
            placeholder="Search leads, projects... (Cmd+K)"
            className="w-full bg-slate-50 border-slate-200 text-xs pl-9 focus-visible:bg-white text-slate-900 shadow-2xs h-8"
          />
        </div>
      </div>

      {/* Center/Right: Panel Switcher & Active User Profile */}
      <div className="flex items-center gap-3">
        {/* Active Role / Panel Selector with Distinct Employee ID */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-9 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs cursor-pointer focus:outline-hidden">
            {getRoleIcon(currentUser.role)}
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              {currentUser.emp_id}
            </span>
            <span className="hidden sm:inline font-bold">
              {currentUser.portal_title}:
            </span>
            <span className="text-slate-700 font-medium">{currentUser.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-500 ml-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-white border-slate-200 shadow-lg text-slate-900">
            <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Switch Active User & Perspective
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            {presetRoles.map((role) => (
              <DropdownMenuItem
                key={role.id}
                onClick={() => handleRoleChange(role.id, role.name, role.designation)}
                className={`flex items-center justify-between p-2.5 cursor-pointer text-xs rounded-lg transition-colors ${
                  currentUser.id === role.id ? "bg-blue-50/70 border border-blue-200 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${role.avatar_color} flex items-center justify-center text-white font-bold text-[10px] shrink-0`}
                  >
                    {role.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {role.name}
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-300">
                        {role.emp_id}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold border ${role.badge_color}`}>
                        {role.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{role.email}</div>
                    <div className="text-[10px] text-slate-400">{role.designation}</div>
                  </div>
                </div>
                {currentUser.id === role.id && <Check className="w-4 h-4 text-primary shrink-0" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Interactive Notification Bell */}
        <NotificationBell />

        {/* User Avatar */}
        <div
          className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${currentUser.avatar_color} flex items-center justify-center text-white font-bold text-xs shadow-2xs`}
          title={`${currentUser.name} - ${currentUser.designation}`}
        >
          {currentUser.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
      </div>
    </header>
  );
}
