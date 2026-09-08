"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { useTasks } from "@/hooks/use-tasks";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["low", "medium", "high"]),
  assignee: z.string().min(1, "Assignee is required"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function TasksPage() {
  const { tasks, isLoading, addTask } = useTasks();
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: "medium",
    }
  });

  const onSubmit = async (data: TaskFormValues) => {
    try {
      await addTask(data);
      setIsDialogOpen(false);
      reset();
      toast.success("Task created successfully!");
    } catch (err) {
      toast.error("Failed to create task");
    }
  };

  const tabs = [
    { id: "all", label: "All Tasks", icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "today", label: "Today", icon: <Calendar className="w-4 h-4" /> },
    { id: "overdue", label: "Overdue", icon: <AlertCircle className="w-4 h-4" /> },
    { id: "completed", label: "Completed", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const columns = [
    { 
      header: "Title", 
      accessorKey: "title",
      cell: (info: any) => <span className="font-semibold text-slate-900">{info.getValue()}</span>
    },
    { 
      header: "Due Date", 
      accessorKey: "dueDate",
      cell: (info: any) => <span className="text-slate-600 text-xs font-mono">{info.getValue()}</span>
    },
    { 
      header: "Priority", 
      accessorKey: "priority", 
      cell: (info: any) => <StatusBadge status={info.getValue()} /> 
    },
    { 
      header: "Assignee", 
      accessorKey: "assignee",
      cell: (info: any) => <span className="text-slate-700 font-medium text-sm">{info.getValue()}</span>
    },
    { 
      header: "Status", 
      accessorKey: "status", 
      cell: (info: any) => <StatusBadge status={info.getValue()} /> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="glass rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <PageHeader 
            title="Task Management" 
            description="Organize, track, and manage your team's tasks effortlessly." 
          />
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-all shadow-xs text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl w-max overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id 
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-slate-900 placeholder-slate-400 outline-none text-sm transition-all"
              />
            </div>
            <button className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="glass rounded-2xl overflow-hidden shadow-xs relative">
          <div className="p-6 relative z-10">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 text-slate-400">Loading tasks...</div>
            ) : (
              <DataTable columns={columns} data={tasks} />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsDialogOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl transform transition-all">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Create New Task</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input 
                  {...register("title")}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea 
                  {...register("description")}
                  rows={3}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input 
                    type="date"
                    {...register("dueDate")}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors"
                  />
                  {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select 
                    {...register("priority")}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignee</label>
                <input 
                  {...register("assignee")}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-colors"
                />
                {errors.assignee && <p className="text-red-500 text-xs mt-1">{errors.assignee.message}</p>}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                <button 
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium text-sm transition-all shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
