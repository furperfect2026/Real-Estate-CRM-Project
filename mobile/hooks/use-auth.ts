import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { api } from '../lib/api';

export interface MobileUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  role_title: string;
  team_name: string;
  avatar: string;
  badge_color: string;
}

export const PERSONAS: MobileUser[] = [
  {
    id: 'user-rohit',
    name: 'Rohit Nalpe',
    email: 'rohit.nalpe@tathastuinfra.com',
    role: 'admin',
    role_title: 'Managing Director & Admin',
    team_name: 'Executive Board',
    avatar: 'RN',
    badge_color: '#3b82f6',
  },
  {
    id: 'user-anmol',
    name: 'Anmol',
    email: 'anmol.sales@tathastuinfra.com',
    role: 'manager',
    role_title: 'Senior Sales Head',
    team_name: 'Sales Team East',
    avatar: 'AN',
    badge_color: '#10b981',
  },
  {
    id: 'user-gayatri',
    name: 'Gayatri',
    email: 'gayatri.caller@tathastuinfra.com',
    role: 'employee',
    role_title: 'Senior Telecaller / Pre-Sales',
    team_name: 'Inbound Calling Unit',
    avatar: 'GA',
    badge_color: '#a855f7',
  },
];

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<MobileUser>(PERSONAS[0]); // default to Rohit Nalpe (Admin)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUserId = await storage.getItem('active_user_id');
        if (savedUserId) {
          const match = PERSONAS.find((p) => p.id === savedUserId);
          if (match) setCurrentUser(match);
        }
      } catch (e) {
        // quiet fallback
      }
    };
    loadUser();
  }, []);

  const switchPersona = async (personaId: string) => {
    const target = PERSONAS.find((p) => p.id === personaId);
    if (target) {
      setCurrentUser(target);
      await storage.setItem('active_user_id', target.id);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const match = PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase()) || PERSONAS[0];
      setCurrentUser(match);
      await storage.setItem('active_user_id', match.id);
      await storage.setItem('token', 'demo-auth-token');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    await storage.deleteItem('token');
    await storage.deleteItem('active_user_id');
    setCurrentUser(PERSONAS[0]);
  };

  return {
    currentUser,
    user: currentUser,
    isAdmin: currentUser.role === 'admin',
    isManager: currentUser.role === 'manager',
    isEmployee: currentUser.role === 'employee',
    switchPersona,
    login,
    logout,
    isLoading,
    personas: PERSONAS,
  };
}
