"use client";

import { useState, useEffect } from "react";
import { getStoredTathastuUsers, TathastuUser } from "./use-users";

export type RoleType = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface ActiveUserRole {
  role: RoleType;
  id: string;
  emp_id: string;
  email: string;
  name: string;
  designation: string;
  portal_title: string;
  team_id?: string;
  team_name?: string;
  avatar_color: string;
  badge_color: string;
}

export const PRESET_ROLES: ActiveUserRole[] = [
  {
    role: "ADMIN",
    id: "admin_1",
    emp_id: "ADM-001",
    email: "rohit.nalpe@tathastuinfra.com",
    name: "Rohit Nalpe",
    designation: "Head of Sales / System Admin",
    portal_title: "Super Admin Portal",
    avatar_color: "from-blue-600 to-indigo-600",
    badge_color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    role: "MANAGER",
    id: "mgr_1",
    emp_id: "MGR-001",
    email: "anmol@tathastuinfra.com",
    name: "Anmol",
    designation: "Sales Manager",
    portal_title: "Manager Portal",
    team_id: "mgr_1",
    team_name: "Tathastu Central Sales",
    avatar_color: "from-emerald-600 to-teal-600",
    badge_color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    role: "EMPLOYEE",
    id: "emp_1",
    emp_id: "CLR-001",
    email: "gayatri@tathastuinfra.com",
    name: "Gayatri",
    designation: "Sales Executive / Caller",
    portal_title: "Caller Workbench",
    team_id: "mgr_1",
    team_name: "Tathastu Central Sales",
    avatar_color: "from-purple-600 to-indigo-600",
    badge_color: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

const STORAGE_KEY = "tathastu_active_role";

function mapUserToActiveRole(u: TathastuUser): ActiveUserRole {
  const badgeColor =
    u.role === "ADMIN"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : u.role === "MANAGER"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-purple-50 text-purple-700 border-purple-200";

  const portalTitle =
    u.role === "ADMIN"
      ? "Super Admin Portal"
      : u.role === "MANAGER"
      ? "Manager Portal"
      : "Caller Workbench";

  return {
    role: u.role,
    id: u.id,
    emp_id: u.emp_id || (u.role === "ADMIN" ? "ADM-001" : u.role === "MANAGER" ? "MGR-001" : "CLR-001"),
    email: u.email,
    name: `${u.first_name} ${u.last_name || ""}`.trim(),
    designation: u.designation,
    portal_title: portalTitle,
    team_id: u.manager_id || "mgr_1",
    team_name: u.team_name || "Tathastu Sales Team",
    avatar_color: u.avatar_color || "from-blue-600 to-indigo-600",
    badge_color: badgeColor,
  };
}

export function useActiveRole() {
  const [currentUser, setCurrentUser] = useState<ActiveUserRole>(PRESET_ROLES[0]);
  const [availableRoles, setAvailableRoles] = useState<ActiveUserRole[]>(PRESET_ROLES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadRolesAndUser = () => {
      try {
        const storedUsers = getStoredTathastuUsers();
        const mappedRoles = storedUsers.map(mapUserToActiveRole);
        setAvailableRoles(mappedRoles);

        const storedId = localStorage.getItem(STORAGE_KEY);
        if (storedId) {
          const matched = mappedRoles.find((r) => r.id === storedId);
          if (matched) {
            setCurrentUser(matched);
            return;
          }
        }
        setCurrentUser(mappedRoles[0] || PRESET_ROLES[0]);
      } catch (e) {
        setCurrentUser(PRESET_ROLES[0]);
      } finally {
        setIsLoaded(true);
      }
    };

    loadRolesAndUser();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        loadRolesAndUser();
      }
    };

    const handleCustomChange = () => {
      loadRolesAndUser();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("active-role-updated", handleCustomChange);
    window.addEventListener("tathastu-users-updated", handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("active-role-updated", handleCustomChange);
      window.removeEventListener("tathastu-users-updated", handleCustomChange);
    };
  }, []);

  const switchRole = (userId: string) => {
    const matched = availableRoles.find((r) => r.id === userId);
    if (matched) {
      setCurrentUser(matched);
      try {
        localStorage.setItem(STORAGE_KEY, matched.id);
        window.dispatchEvent(new Event("active-role-updated"));
      } catch (e) {}
    }
  };

  return {
    currentUser,
    isLoaded,
    switchRole,
    presetRoles: availableRoles,
    isAdmin: currentUser.role === "ADMIN",
    isManager: currentUser.role === "MANAGER",
    isEmployee: currentUser.role === "EMPLOYEE",
  };
}

