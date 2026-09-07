import { useState, useEffect } from "react";

export interface OrganizationSettings {
  name: string;
  email: string;
  website: string;
  phone: string;
  address: string;
  city: string;
  currency: string;
  timezone: string;
  logo_url: string | null;
  auto_assign_leads: boolean;
  whatsapp_notifications: boolean;
}

export const DEFAULT_ORG_SETTINGS: OrganizationSettings = {
  name: "Tathastu Infra",
  email: "contact@tathastuinfra.com",
  website: "https://tathastuinfra.com",
  phone: "+91 98200 12345",
  address: "Tower 4, World Trade Centre, Kharadi",
  city: "Pune, Maharashtra 411014",
  currency: "INR (₹)",
  timezone: "Asia/Kolkata (IST)",
  logo_url: null,
  auto_assign_leads: true,
  whatsapp_notifications: true,
};

const STORAGE_KEY = "tathastu_org_settings";

export function useOrganization() {
  const [settings, setSettings] = useState<OrganizationSettings>(DEFAULT_ORG_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSettings({ ...DEFAULT_ORG_SETTINGS, ...JSON.parse(stored) });
        } else {
          setSettings(DEFAULT_ORG_SETTINGS);
        }
      } catch (e) {
        console.error("Failed to load organization settings from storage", e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setSettings({ ...DEFAULT_ORG_SETTINGS, ...JSON.parse(e.newValue) });
        } catch {}
      }
    };

    const handleCustomChange = () => {
      loadSettings();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("org-settings-updated", handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("org-settings-updated", handleCustomChange);
    };
  }, []);

  const updateSettings = (newSettings: Partial<OrganizationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("org-settings-updated"));
    } catch (e) {
      console.error("Failed to save organization settings", e);
    }
    return updated;
  };

  const resetSettings = () => {
    setSettings(DEFAULT_ORG_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("org-settings-updated"));
    } catch (e) {}
  };

  return {
    settings,
    isLoaded,
    updateSettings,
    resetSettings,
  };
}
