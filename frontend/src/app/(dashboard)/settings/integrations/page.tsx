"use client";

import React, { useState } from "react";
import { useIntegrations } from "@/hooks/use-integrations";
import { Integration } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Share2, Globe, Link as LinkIcon, Home, Building2, Code } from "lucide-react";
import { toast } from "sonner";

const platformDetails = {
  facebook: {
    name: "Facebook Ads",
    description: "Sync leads from Facebook Lead Ads.",
    icon: Share2,
    color: "text-blue-600",
    bg: "bg-blue-50 border border-blue-100",
  },
  "99acres": {
    name: "99acres",
    description: "Receive property inquiries from 99acres.",
    icon: Building2,
    color: "text-amber-600",
    bg: "bg-amber-50 border border-amber-100",
  },
  magicbricks: {
    name: "MagicBricks",
    description: "Import leads directly from MagicBricks.",
    icon: Home,
    color: "text-rose-600",
    bg: "bg-rose-50 border border-rose-100",
  },
  housing: {
    name: "Housing.com",
    description: "Connect your Housing.com account for leads.",
    icon: LinkIcon,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border border-emerald-100",
  },
  website: {
    name: "Website",
    description: "Capture leads from your custom website.",
    icon: Globe,
    color: "text-purple-600",
    bg: "bg-purple-50 border border-purple-100",
  },
  custom: {
    name: "Custom API",
    description: "Build custom integrations via our API.",
    icon: Code,
    color: "text-slate-700",
    bg: "bg-slate-100 border border-slate-200",
  },
};

export default function IntegrationsPage() {
  const { useGetIntegrations, toggleIntegrationMutation, generateApiKeyMutation } = useIntegrations();
  const { data: integrations, isLoading, isError } = useGetIntegrations();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleToggle = (id: string, newStatus: boolean) => {
    toggleIntegrationMutation.mutate(
      { id, is_active: newStatus },
      {
        onSuccess: () => {
          toast.success(`Integration ${newStatus ? "enabled" : "disabled"} successfully.`);
        },
        onError: () => {
          toast.error("Failed to update integration status.");
        },
      }
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleGenerateKey = (id: string) => {
    generateApiKeyMutation.mutate(id, {
      onSuccess: () => {
        toast.success("API Key generated successfully.");
      },
      onError: () => {
        toast.error("Failed to generate API Key.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Lead Integrations</h3>
          <p className="text-sm text-muted-foreground">Manage your connections to external lead sources.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !integrations) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive">Failed to load integrations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Lead Integrations</h3>
        <p className="text-xs text-slate-500">
          Connect your favorite platforms to automatically sync leads into Tathastu Infra.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          const details = platformDetails[integration.platform as keyof typeof platformDetails] || {
            name: integration.platform,
            description: "Custom integration platform.",
            icon: Code,
            color: "text-slate-700",
            bg: "bg-slate-100 border border-slate-200",
          };
          const Icon = details.icon;

          return (
            <div
              key={integration.id}
              className={`glass rounded-2xl border p-5 shadow-xs cursor-pointer transition-all hover:shadow-md hover:border-slate-300 bg-white ${
                integration.is_active
                  ? "border-primary/40 ring-1 ring-primary/20"
                  : "border-slate-200/80"
              }`}
              onClick={() => {
                setSelectedIntegration(integration);
                setDialogOpen(true);
              }}
            >
              <div className="flex items-start justify-between pb-3">
                <div className={`p-2.5 rounded-xl ${details.bg} ${details.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={integration.is_active}
                    onCheckedChange={(checked) => handleToggle(integration.id, checked)}
                  />
                </div>
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 mb-1">{details.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 h-9">
                  {details.description}
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  integration.is_active 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300" 
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}>
                  {integration.is_active ? "Active" : "Inactive"}
                </span>
                <span className="text-xs font-medium text-primary hover:underline">
                  Configure →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-slate-200 text-slate-900 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Integration Details</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Configure the webhook and API key for {selectedIntegration ? platformDetails[selectedIntegration.platform as keyof typeof platformDetails]?.name : "this integration"}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-5 py-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Webhook URL</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    readOnly 
                    value={selectedIntegration.webhook_url || `https://api.tathastuinfra.com/api/v1/webhooks/${selectedIntegration.platform}/${selectedIntegration.organization_id}`} 
                    className="font-mono text-xs bg-slate-50 border-slate-300 text-slate-900"
                  />
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="border-slate-200 hover:bg-slate-50 text-slate-700 shrink-0"
                    onClick={() => handleCopy(selectedIntegration.webhook_url || "")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Use this URL in your {platformDetails[selectedIntegration.platform as keyof typeof platformDetails]?.name} dashboard to send leads to Tathastu Infra.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">API Key</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    readOnly 
                    type={selectedIntegration.api_key ? "text" : "password"}
                    value={selectedIntegration.api_key || "************************"} 
                    className="font-mono text-xs bg-slate-50 border-slate-300 text-slate-900"
                  />
                  {selectedIntegration.api_key && (
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="border-slate-200 hover:bg-slate-50 text-slate-700 shrink-0"
                      onClick={() => handleCopy(selectedIntegration.api_key || "")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => handleGenerateKey(selectedIntegration.id)}
                    disabled={generateApiKeyMutation.isPending}
                    className="shrink-0 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${generateApiKeyMutation.isPending ? "animate-spin" : ""}`} />
                    {selectedIntegration.api_key ? "Rotate Key" : "Generate Key"}
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Keep this key secret. It provides API access to this specific integration.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
