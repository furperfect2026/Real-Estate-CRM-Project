"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUsers, TathastuUser } from "@/hooks/use-users";
import { Plus, Users, Shield, Phone, Mail, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UsersSettingsPage() {
  const { useGetUsers, createUserMutation } = useUsers();
  const { data: users, isLoading } = useGetUsers();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MANAGER" | "EMPLOYEE">("EMPLOYEE");
  const [teamName, setTeamName] = useState("Tathastu Sales Team");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      toast.error("Please fill in the required fields");
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        role,
        team_name: teamName,
        designation: role === "ADMIN" ? "Administrator" : role === "MANAGER" ? "Sales Manager" : "Sales Executive (Caller)",
      });
      setIsAddOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      toast.success(`User ${firstName} ${lastName} added to Tathastu Infra!`);
    } catch (err) {
      toast.error("Failed to add user");
    }
  };

  const columns = [
    {
      header: "User",
      accessorKey: "name",
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${row.avatar_color || "from-blue-600 to-indigo-600"} flex items-center justify-center font-bold text-xs text-white shadow-2xs`}>
              {(row.first_name?.[0] || "") + (row.last_name?.[0] || "")}
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900">
                {row.first_name} {row.last_name}
              </div>
              <div className="text-xs text-slate-500">{row.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: (info: any) => {
        const role = info.row.original.role;
        const colorMap: Record<string, string> = {
          ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
          MANAGER: "bg-blue-50 text-blue-700 border-blue-200",
          EMPLOYEE: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
        return (
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colorMap[role] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
            {role === "ADMIN" ? "Admin" : role === "MANAGER" ? "Manager" : "Caller / Exec"}
          </span>
        );
      },
    },
    {
      header: "Designation & Team",
      accessorKey: "designation",
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div>
            <div className="text-xs font-medium text-slate-800">{row.designation}</div>
            <div className="text-[11px] text-slate-400">{row.team_name || "General"}</div>
          </div>
        );
      },
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: (info: any) => (
        <span className="text-xs text-slate-600 font-mono">
          {info.row.original.phone || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: () => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="User Management"
          description="Manage access, team assignments, and callers for Tathastu Infra."
        />

        <Button 
          onClick={() => setIsAddOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs text-xs font-medium px-4 py-2 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                Add New Team Member
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">First Name *</Label>
                  <Input
                    required
                    placeholder="e.g. Ramesh"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-slate-50 border-slate-300 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Last Name</Label>
                  <Input
                    placeholder="e.g. Shinde"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-slate-50 border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Email Address *</Label>
                <Input
                  required
                  type="email"
                  placeholder="ramesh@tathastuinfra.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Phone Number</Label>
                <Input
                  placeholder="+91 98200 99999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">System Role</Label>
                  <Select value={role} onValueChange={(val: any) => setRole(val)}>
                    <SelectTrigger className="w-full bg-slate-50 border-slate-300 text-xs">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="EMPLOYEE" className="text-xs">Caller / Rep</SelectItem>
                      <SelectItem value="MANAGER" className="text-xs">Manager</SelectItem>
                      <SelectItem value="ADMIN" className="text-xs">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Assigned Team</Label>
                  <Select value={teamName} onValueChange={(val) => setTeamName(val || "")}>
                    <SelectTrigger className="w-full bg-slate-50 border-slate-300 text-xs">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="Sales Team East" className="text-xs">Sales Team East</SelectItem>
                      <SelectItem value="Sales Team West" className="text-xs">Sales Team West</SelectItem>
                      <SelectItem value="Direct Calling Desk" className="text-xs">Calling Desk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createUserMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white text-xs"
                >
                  {createUserMutation.isPending ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs bg-white">
        <DataTable
          columns={columns}
          data={users || []}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
