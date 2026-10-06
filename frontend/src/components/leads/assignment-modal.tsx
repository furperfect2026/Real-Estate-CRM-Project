"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserCheck, Users, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { Lead } from "@/lib/types";
import { useLeads } from "@/hooks/use-leads";
import { toast } from "sonner";

import { useUsers, TathastuUser, BASELINE_TATHASTU_USERS } from "@/hooks/use-users";

interface AssignmentModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  type: 'TO_MANAGER' | 'TO_EMPLOYEE';
  currentManagerId?: string;
}

export function AssignmentModal({ lead, isOpen, onClose, type, currentManagerId = "mgr_1" }: AssignmentModalProps) {
  const { assignToManager, assignToEmployee } = useLeads();
  const { useGetUsers } = useUsers();
  const { data: rawUsers } = useGetUsers();

  const allUsers: TathastuUser[] = (rawUsers && rawUsers.length > 0) ? rawUsers : BASELINE_TATHASTU_USERS;
  const managers = allUsers.filter(u => u.role === 'MANAGER');
  const callers = allUsers.filter(u => u.role === 'EMPLOYEE');

  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!lead) return null;

  const handleAssign = async () => {
    if (!selectedTarget) {
      toast.error("Please select a recipient");
      return;
    }

    setIsSubmitting(true);
    try {
      if (type === 'TO_MANAGER') {
        const mgr = managers.find(m => m.id === selectedTarget);
        if (mgr) {
          const mgrName = `${mgr.first_name} ${mgr.last_name}`.trim();
          await assignToManager({ leadId: lead.id, managerId: mgr.id, managerName: mgrName });
          toast.success(`Lead successfully assigned to Manager ${mgrName}`);
        }
      } else {
        const caller = callers.find(e => e.id === selectedTarget);
        if (caller) {
          const callerName = `${caller.first_name} ${caller.last_name}`.trim();
          await assignToEmployee({ leadId: lead.id, employeeId: caller.id, employeeName: callerName });
          toast.success(`Lead successfully assigned to Caller ${callerName}`);
        }
      }
      onClose();
    } catch (e) {
      toast.error("Failed to assign lead");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] bg-white border-slate-200 text-slate-900 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              {type === 'TO_MANAGER' ? <ShieldCheck className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {type === 'TO_MANAGER' ? 'Admin: Assign to Manager' : 'Manager: Distribute to Employee'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {type === 'TO_MANAGER' 
                  ? 'Dispatch lead to regional sales managers for team management.' 
                  : 'Assign lead to callers / sales executives for client outreach.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Lead Quick Preview Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Lead</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">{lead.first_name} {lead.last_name}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {lead.source}
              </span>
            </div>
            <p className="text-xs text-slate-500">{lead.phone} • Budget: {lead.budget}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {type === 'TO_MANAGER' ? 'Select Sales Manager' : 'Select Sales Executive / Caller'}
            </Label>
            <Select value={selectedTarget} onValueChange={(val) => setSelectedTarget(val || '')}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-300 text-slate-900 font-medium text-xs">
                <SelectValue placeholder={type === 'TO_MANAGER' ? "Choose manager..." : "Choose employee..."} />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                {type === 'TO_MANAGER' ? (
                  managers.map(mgr => (
                    <SelectItem key={mgr.id} value={mgr.id} className="cursor-pointer text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{mgr.first_name} {mgr.last_name} ({mgr.emp_id || 'MGR'})</span>
                        <span className="text-[10px] text-slate-500">{mgr.designation} • {mgr.team_name || 'Central'}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  callers.map(caller => (
                    <SelectItem key={caller.id} value={caller.id} className="cursor-pointer text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{caller.first_name} {caller.last_name} ({caller.emp_id || 'CLR'})</span>
                        <span className="text-[10px] text-slate-500">{caller.designation} • {caller.team_name || 'Sales Desk'}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={isSubmitting || !selectedTarget}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs text-xs font-medium px-5 py-2 flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              {isSubmitting ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
