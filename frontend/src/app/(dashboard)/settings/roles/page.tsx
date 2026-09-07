"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Plus, ShieldAlert, Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState([
    { name: 'Admin', isSystem: true },
    { name: 'Sales Manager', isSystem: true },
    { name: 'Sales Executive (Caller)', isSystem: true },
    { name: 'Viewer / Auditor', isSystem: false },
  ]);
  const [selectedRole, setSelectedRole] = useState('Admin');
  const modules = ['Properties', 'Leads', 'Pipeline', 'Callen Dialer', 'Reports', 'Settings'];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  // Matrix state
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  const isChecked = (mod: string, act: string) => {
    if (selectedRole === 'Admin') return true;
    const key = `${selectedRole}_${mod}_${act}`;
    if (permissions[key] !== undefined) return permissions[key];
    return act === 'view' || (selectedRole === 'Sales Manager' && act !== 'delete');
  };

  const togglePermission = (mod: string, act: string) => {
    if (selectedRole === 'Admin') return;
    const key = `${selectedRole}_${mod}_${act}`;
    const current = isChecked(mod, act);
    setPermissions(prev => ({
      ...prev,
      [key]: !current
    }));
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    if (roles.some(r => r.name.toLowerCase() === newRoleName.trim().toLowerCase())) {
      toast.error('A role with this name already exists');
      return;
    }
    setRoles(prev => [...prev, { name: newRoleName.trim(), isSystem: false }]);
    setSelectedRole(newRoleName.trim());
    setNewRoleName('');
    setIsCreateOpen(false);
    toast.success(`Role "${newRoleName.trim()}" created successfully!`);
  };

  const handleSavePermissions = () => {
    toast.success(`Permissions for "${selectedRole}" saved successfully!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Roles & Permissions" description="Define custom access tiers and configure granular module permissions." />
        
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs text-xs font-medium px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </Button>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Create Custom Role
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRole} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Role Name</Label>
                <Input 
                  placeholder="e.g. Telecaller Specialist" 
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs">
                  Create Role
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Roles List Sidebar */}
        <div className="md:col-span-1 border border-slate-200/80 rounded-2xl glass p-4 space-y-2 shadow-xs bg-white">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 px-2">Available Roles</h3>
          {roles.map((role) => (
            <div 
              key={role.name} 
              onClick={() => setSelectedRole(role.name)}
              className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition-colors border text-sm ${
                selectedRole === role.name 
                  ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold shadow-2xs' 
                  : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
              }`}
            >
               <span>{role.name}</span>
               <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                 role.isSystem ? 'bg-slate-200 text-slate-700' : 'bg-blue-50 text-blue-700 border border-blue-200'
               }`}>
                 {role.isSystem ? 'System' : 'Custom'}
               </span>
            </div>
          ))}
        </div>

        {/* Permission Matrix Main Area */}
        <div className="md:col-span-2 border border-slate-200/80 rounded-2xl p-6 glass shadow-xs space-y-6 bg-white">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedRole} Permissions</h3>
                  <p className="text-xs text-slate-500">Configure access levels and granular actions for this role.</p>
                </div>
             </div>

             {selectedRole !== 'Admin' && (
               <Button 
                 size="sm" 
                 onClick={handleSavePermissions}
                 className="bg-primary hover:bg-primary/90 text-white text-xs font-medium px-4 flex items-center gap-1.5"
               >
                 <Check className="w-3.5 h-3.5" />
                 Save Permissions
               </Button>
             )}
           </div>

           <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Module</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">View</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Create</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Edit</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Delete</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {modules.map((module) => (
                    <tr key={module} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium text-slate-900">{module}</td>
                      {['view', 'create', 'edit', 'delete'].map((action) => {
                        const checked = isChecked(module, action);
                        return (
                          <td key={action} className="px-5 py-3.5 whitespace-nowrap text-center">
                            <input 
                              type="checkbox" 
                              checked={checked}
                              disabled={selectedRole === 'Admin'} 
                              onChange={() => togglePermission(module, action)}
                              className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 cursor-pointer disabled:cursor-not-allowed accent-primary" 
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
