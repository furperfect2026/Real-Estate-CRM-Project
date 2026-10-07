"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Plus, Sparkles } from "lucide-react";
import { Property, PropertyType, PossessionStatus } from "@/lib/types";
import { useProperties } from "@/hooks/use-properties";
import { useActiveRole } from "@/hooks/use-active-role";
import { toast } from "sonner";

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPropertyModal({ isOpen, onClose }: AddPropertyModalProps) {
  const { addPropertyMutation } = useProperties();
  const { currentUser } = useActiveRole();

  const [name, setName] = useState("");
  const [projectName, setProjectName] = useState("Tathastu Residency");
  const [location, setLocation] = useState("Kharadi, Pune");
  const [type, setType] = useState<PropertyType>("3 BHK");
  const [carpetArea, setCarpetArea] = useState("1,100 sq.ft.");
  const [priceInLakhs, setPriceInLakhs] = useState("95");
  const [possession, setPossession] = useState<PossessionStatus>("Dec 2026");
  const [reraNumber, setReraNumber] = useState("P521000" + Math.floor(10000 + Math.random() * 90000));
  const [highlights, setHighlights] = useState("East Facing, Near Metro Station, 2 Covered Parking, 40+ Amenities");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Property['status']>("AVAILABLE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a property name");
      return;
    }

    const numericPrice = parseFloat(priceInLakhs) * 100000;
    const priceDisplay =
      parseFloat(priceInLakhs) >= 100
        ? `₹${(parseFloat(priceInLakhs) / 100).toFixed(2)} Cr`
        : `₹${priceInLakhs} Lakhs`;

    const highlightsArray = highlights
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);

    const fullDesc = description.trim()
      ? description.trim()
      : `${type} unit in ${projectName}, ${location}. Offers ${carpetArea} usable carpet area with ${possession} possession. Features premium fittings, high floor view, and full amenities.`;

    setIsSubmitting(true);
    try {
      await addPropertyMutation.mutateAsync({
        name,
        project_name: projectName,
        location,
        city: "Pune",
        type,
        carpet_area: carpetArea,
        price: numericPrice,
        price_display: priceDisplay,
        possession,
        rera_number: reraNumber,
        description: fullDesc,
        key_highlights: highlightsArray,
        status,
        added_by: `${currentUser.name} (${currentUser.role === 'EMPLOYEE' ? 'Caller' : currentUser.role === 'MANAGER' ? 'Manager' : 'Admin'})`,
        added_by_role: currentUser.role,
      });

      toast.success(`Property "${name}" added to inventory successfully!`);
      onClose();
      // Reset
      setName("");
      setDescription("");
    } catch (e: any) {
      toast.error("Failed to add property: " + (e.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-white border-slate-200 text-slate-900 p-0 overflow-hidden shadow-2xl rounded-2xl max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Add Property to Inventory</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  Caller & Team Input
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Logged by {currentUser.name}. This property immediately enters the AI matching pool.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700">Property / Unit Title *</Label>
            <Input
              required
              placeholder="e.g. Tathastu Heights - Tower B (3 BHK Corner)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs bg-slate-50 border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700">Project Name *</Label>
              <Input
                required
                placeholder="e.g. Tathastu Residency"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-xs bg-slate-50 border-slate-300"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700">Location / Micro-Market *</Label>
              <Input
                required
                placeholder="e.g. Kharadi, Pune"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-xs bg-slate-50 border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700">Configuration *</Label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger className="text-xs bg-slate-50 border-slate-300">
                  <SelectValue placeholder="BHK" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-xs">
                  <SelectItem value="1 BHK">1 BHK</SelectItem>
                  <SelectItem value="2 BHK">2 BHK</SelectItem>
                  <SelectItem value="3 BHK">3 BHK</SelectItem>
                  <SelectItem value="4 BHK">4 BHK</SelectItem>
                  <SelectItem value="Penthouse">Penthouse</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Plot">Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700">Price (in Lakhs ₹) *</Label>
              <Input
                type="number"
                step="0.5"
                required
                placeholder="e.g. 85"
                value={priceInLakhs}
                onChange={(e) => setPriceInLakhs(e.target.value)}
                className="text-xs bg-slate-50 border-slate-300"
              />
              <span className="text-[10px] text-slate-400">
                = {parseFloat(priceInLakhs || "0") >= 100 ? `₹${(parseFloat(priceInLakhs || "0") / 100).toFixed(2)} Cr` : `₹${priceInLakhs || "0"} Lakhs`}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700">Carpet Area</Label>
              <Input
                placeholder="e.g. 1,050 sq.ft."
                value={carpetArea}
                onChange={(e) => setCarpetArea(e.target.value)}
                className="text-xs bg-slate-50 border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700">Possession Status</Label>
              <Select value={possession} onValueChange={(val: any) => setPossession(val)}>
                <SelectTrigger className="text-xs bg-slate-50 border-slate-300">
                  <SelectValue placeholder="Possession" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-xs">
                  <SelectItem value="Ready to Move">Ready to Move (OC Received)</SelectItem>
                  <SelectItem value="Immediate">Immediate Possession</SelectItem>
                  <SelectItem value="Dec 2025">Dec 2025</SelectItem>
                  <SelectItem value="Dec 2026">Dec 2026</SelectItem>
                  <SelectItem value="Mid 2027">Mid 2027</SelectItem>
                  <SelectItem value="Under Construction">Under Construction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700">MahaRERA Number</Label>
              <Input
                placeholder="P521000..."
                value={reraNumber}
                onChange={(e) => setReraNumber(e.target.value)}
                className="text-xs bg-slate-50 border-slate-300 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700">
              Key Highlights (Comma separated, shown to caller as selling points)
            </Label>
            <Input
              placeholder="e.g. East Facing, Near Metro, 2 Car Parking, Club House"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              className="text-xs bg-slate-50 border-slate-300"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700">
              Detailed Description & Amenities (Optional - AI will auto-format)
            </Label>
            <Textarea
              rows={3}
              placeholder="Describe floor level, river view, specifications, terrace deck..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs bg-slate-50 border-slate-300"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              {isSubmitting ? "Adding Property..." : "Add to Inventory"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
