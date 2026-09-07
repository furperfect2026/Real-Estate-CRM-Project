"use client";

import React, { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization, OrganizationSettings } from "@/hooks/use-organization";
import { toast } from "sonner";
import { 
  Building2, 
  Upload, 
  Check, 
  RotateCcw, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Coins, 
  Clock, 
  Trash2,
  Sparkles,
  ShieldCheck
} from "lucide-react";

export default function GeneralSettingsPage() {
  const { settings, isLoaded, updateSettings, resetSettings } = useOrganization();

  const [formData, setFormData] = useState<OrganizationSettings>(settings);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(settings.logo_url);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form data when stored settings load
  useEffect(() => {
    if (isLoaded) {
      setFormData(settings);
      setAvatarPreview(settings.logo_url);
    }
  }, [isLoaded, settings]);

  const handleChange = (field: keyof OrganizationSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatarPreview(base64);
      handleChange("logo_url", base64);
      toast.success("Avatar preview loaded! Click 'Save Changes' to apply.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    handleChange("logo_url", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Avatar reset to default initials");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Organization Name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Contact Email is required");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      updateSettings(formData);
      setIsSaving(false);
      toast.success("Organization profile saved successfully!");
    }, 300);
  };

  const handleCancel = () => {
    setFormData(settings);
    setAvatarPreview(settings.logo_url);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Form reverted to saved settings");
  };

  const getInitials = (name: string) => {
    if (!name) return "TI";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="General Settings"
        description="Update your organization details and preferences."
      />

      <div className="glass rounded-2xl p-8 border border-slate-200/80 shadow-xs max-w-3xl bg-white">
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Section 1: Organization Profile */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-900">
                  Organization Profile
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Organization
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="orgName" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  Organization Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="orgName"
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Tathastu Infra"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="orgEmail" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Contact Email <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="orgEmail"
                  type="email"
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="contact@tathastuinfra.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="website" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Website
                </Label>
                <Input
                  id="website"
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://tathastuinfra.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Support Phone
                </Label>
                <Input
                  id="phone"
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+91 98200 12345"
                />
              </div>
            </div>

            {/* Organization Logo & Avatar Picker */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold text-slate-700">Organization Logo</Label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative group">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Organization Logo"
                      className="h-16 w-16 rounded-2xl object-cover border-2 border-primary/30 shadow-xs"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-xs border border-slate-200">
                      {getInitials(formData.name)}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    className="hidden"
                    onChange={handleAvatarFile}
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Change Avatar
                  </Button>

                  {avatarPreview && (
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Recommended: Square PNG, JPG or SVG, minimum 256x256 pixels (Max 2MB).
              </p>
            </div>
          </div>

          {/* Section 2: Regional & Operational Details */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Headquarters & Regional Settings
            </h4>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-semibold text-slate-700">
                  Office Address
                </Label>
                <Input
                  id="address"
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Tower 4, World Trade Centre"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-semibold text-slate-700">
                  City & Postal Code
                </Label>
                <Input
                  id="city"
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Pune, Maharashtra 411014"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="currency" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-slate-400" />
                  Default Currency
                </Label>
                <Input
                  id="currency"
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white"
                  value={formData.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="timezone" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Timezone
                </Label>
                <Input
                  id="timezone"
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white"
                  value={formData.timezone}
                  onChange={(e) => handleChange("timezone", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: CRM Automation Toggles */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Lead Routing & Notifications
            </h4>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Round-Robin Auto-Distribution
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Automatically distribute incoming webhook leads to regional managers
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.auto_assign_leads}
                  onChange={(e) => handleChange("auto_assign_leads", e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    WhatsApp Executive Alerts
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Send real-time alerts to assigned callers upon new inquiry intake
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.whatsapp_notifications}
                  onChange={(e) => handleChange("whatsapp_notifications", e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={resetSettings}
              className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Defaults
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={handleCancel}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs text-xs font-medium px-5 py-2 flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
