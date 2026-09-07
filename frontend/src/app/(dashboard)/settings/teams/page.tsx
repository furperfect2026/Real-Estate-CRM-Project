"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Plus, Users, ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function TeamsSettingsPage() {
  const [teams, setTeams] = useState([
    { name: 'Tathastu Sales Team', members: 4, manager: 'Anmol', description: 'Central sales operations, lead allocations, and site closure pipeline.' },
    { name: 'Direct Telecalling Desk', members: 3, manager: 'Gayatri', description: 'Inbound webhook lead dispatch, initial qualification, and dialer queue.' },
    { name: 'Executive Leadership & Strategy', members: 2, manager: 'Rohit Nalpe', description: 'Executive supervision, team performance governance, and revenue analytics.' },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const newTeam = {
      name: teamName.trim(),
      members: 1,
      manager: managerName.trim() || 'Unassigned',
      description: description.trim() || 'Regional property sales and customer outreach team.',
    };

    setTeams(prev => [newTeam, ...prev]);
    setTeamName('');
    setManagerName('');
    setDescription('');
    setIsCreateOpen(false);
    toast.success(`Team "${newTeam.name}" created successfully!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Teams & Departments" description="Organize your callers, managers, and regional desks for Tathastu Infra." />
        
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs text-xs font-medium px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </Button>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Create New Team
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Team Name *</Label>
                <Input 
                  placeholder="e.g. North Pune Luxury Sales" 
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Team Manager</Label>
                <Input 
                  placeholder="e.g. Anmol" 
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Description</Label>
                <Textarea 
                  placeholder="Focus areas, assigned projects, or desk responsibilities..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-slate-50 border-slate-300 text-xs resize-none h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs">
                  Create Team
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {teams.map((team, idx) => (
          <div key={idx} className="group relative glass rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {team.members} members
              </span>
            </div>
            
            <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
              {team.name}
            </h3>
            <div className="text-xs font-medium text-slate-600 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Manager: <span className="font-semibold text-slate-800">{team.manager}</span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 mb-4">
              {team.description}
            </p>
            
            <div className="flex -space-x-2 overflow-hidden mb-4">
              {[...Array(Math.min(team.members, 4))].map((_, i) => (
                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              {team.members > 4 && (
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                  +{team.members - 4}
                </div>
              )}
            </div>

            <div 
              onClick={() => toast.info(`Viewing roster for ${team.name}`)}
              className="flex items-center text-xs font-semibold text-primary group-hover:underline cursor-pointer"
            >
              View Members <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
