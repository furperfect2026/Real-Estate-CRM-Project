import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/lib/types';

export interface TathastuUser {
  id: string;
  organization_id: string;
  emp_id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  designation: string;
  manager_id?: string | null;
  team_name?: string;
  avatar_color: string;
  created_at?: string;
}

export const BASELINE_TATHASTU_USERS: TathastuUser[] = [
  { 
    id: "admin_1", 
    emp_id: "ADM-001",
    organization_id: "org_1", 
    email: "rohit.nalpe@tathastuinfra.com", 
    first_name: "Rohit", 
    last_name: "Nalpe", 
    phone: "+91 98765 00001", 
    role: "ADMIN", 
    designation: "Head of Sales / System Admin", 
    avatar_color: "from-blue-600 to-indigo-600" 
  },
  { 
    id: "mgr_1", 
    emp_id: "MGR-001",
    organization_id: "org_1", 
    email: "anmol@tathastuinfra.com", 
    first_name: "Anmol", 
    last_name: "", 
    phone: "+91 98765 00002", 
    role: "MANAGER", 
    designation: "Sales Manager", 
    team_name: "Tathastu Central Sales", 
    avatar_color: "from-emerald-600 to-teal-600" 
  },
  { 
    id: "emp_1", 
    emp_id: "CLR-001",
    organization_id: "org_1", 
    email: "gayatri@tathastuinfra.com", 
    first_name: "Gayatri", 
    last_name: "", 
    phone: "+91 98765 00003", 
    role: "EMPLOYEE", 
    designation: "Sales Executive & Caller", 
    manager_id: "mgr_1", 
    team_name: "Tathastu Central Sales", 
    avatar_color: "from-purple-600 to-indigo-600" 
  },
];

const STORAGE_KEY = "tathastu_users_roster_v2";

export function getStoredTathastuUsers(): TathastuUser[] {
  if (typeof window === "undefined") return BASELINE_TATHASTU_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(BASELINE_TATHASTU_USERS));
      return BASELINE_TATHASTU_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : BASELINE_TATHASTU_USERS;
  } catch (e) {
    return BASELINE_TATHASTU_USERS;
  }
}

export function saveStoredTathastuUsers(users: TathastuUser[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event("tathastu-users-updated"));
  } catch (e) {}
}

export function useUsers() {
  const queryClient = useQueryClient();

  const useGetUsers = () => {
    return useQuery({
      queryKey: ['users'],
      queryFn: async () => {
        try {
          const { data } = await api.get<User[]>('/users');
          if (data && data.length > 0) return data;
        } catch (e) {
          // Backend offline or fallback
        }
        return getStoredTathastuUsers() as any;
      },
      staleTime: 1000 * 60,
    });
  };

  const useGetUser = (id: string) => {
    return useQuery({
      queryKey: ['users', id],
      queryFn: async () => {
        try {
          const { data } = await api.get<User>(`/users/${id}`);
          return data;
        } catch (e) {
          const all = getStoredTathastuUsers();
          return all.find(u => u.id === id) || null;
        }
      },
      enabled: !!id,
    });
  };

  const createUserMutation = useMutation({
    mutationFn: async (userData: Partial<TathastuUser> & { first_name: string; last_name?: string; email: string }) => {
      const currentRoster = getStoredTathastuUsers();
      const role = userData.role || 'EMPLOYEE';
      const countInRole = currentRoster.filter(u => u.role === role).length + 1;
      const prefix = role === 'ADMIN' ? 'ADM' : role === 'MANAGER' ? 'MGR' : 'CLR';
      const emp_id = `${prefix}-${String(countInRole).padStart(3, '0')}`;

      const avatarColors = [
        "from-blue-600 to-indigo-600",
        "from-purple-600 to-pink-600",
        "from-emerald-600 to-teal-600",
        "from-amber-600 to-orange-600",
        "from-rose-600 to-red-600",
        "from-cyan-600 to-blue-600"
      ];
      const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

      const newUser: TathastuUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        emp_id,
        organization_id: "org_1",
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name || "",
        phone: userData.phone || "+91 98000 00000",
        role: role,
        designation: userData.designation || (role === 'ADMIN' ? 'Administrator' : role === 'MANAGER' ? 'Sales Manager' : 'Sales Executive & Caller'),
        team_name: userData.team_name || (role === 'MANAGER' ? 'Regional Team' : 'Sales Calling Desk'),
        manager_id: userData.manager_id || (role === 'EMPLOYEE' ? 'mgr_1' : null),
        avatar_color: randomColor,
        created_at: new Date().toISOString(),
      };

      try {
        await api.post('/users', newUser);
      } catch (e) {
        // Fallback for demo/offline
      }

      const updatedRoster = [...currentRoster, newUser];
      saveStoredTathastuUsers(updatedRoster);
      return newUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }: Partial<TathastuUser> & { id: string }) => {
      try {
        await api.put(`/users/${id}`, userData);
      } catch (e) {}

      const currentRoster = getStoredTathastuUsers();
      const updated = currentRoster.map(u => u.id === id ? { ...u, ...userData } : u);
      saveStoredTathastuUsers(updated);
      return updated.find(u => u.id === id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`/users/${id}`);
      } catch (e) {}

      const currentRoster = getStoredTathastuUsers();
      // Protect baseline admin
      if (id === 'admin_1') {
        throw new Error("Cannot delete primary Super Admin Rohit Nalpe");
      }
      const updated = currentRoster.filter(u => u.id !== id);
      saveStoredTathastuUsers(updated);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    useGetUsers,
    useGetUser,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
  };
}

