"use client";

import React, { useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useTasks } from "@/hooks/use-tasks";
import { 
  Calendar, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  MoreVertical
} from "lucide-react";

export default function MyTasksPage() {
  const { tasks, isLoading } = useTasks();

  // Simple grouping logic assuming dueDate exists and is a valid date string
  const groupedTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue: any[] = [];
    const dueToday: any[] = [];
    const upcoming: any[] = [];

    (tasks || []).forEach((task: any) => {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (task.status === "completed") return; // Skip completed tasks here or put them in their own group

      if (dueDate < today) {
        overdue.push(task);
      } else if (dueDate.getTime() === today.getTime()) {
        dueToday.push(task);
      } else {
        upcoming.push(task);
      }
    });

    return { overdue, dueToday, upcoming };
  }, [tasks]);

  const TaskCard = ({ task }: { task: any }) => (
    <div className="group relative p-5 glass rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-xs">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
          {task.title}
        </h3>
        <button className="text-slate-400 hover:text-slate-700 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-4 line-clamp-2">
        {task.description || "No description provided."}
      </p>
      <div className="flex items-center justify-between">
        <StatusBadge status={task.priority} />
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
          {task.assignee}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <PageHeader 
          title="My Tasks" 
          description="Your personal workload at a glance." 
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-slate-500 text-sm">Loading your tasks...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Overdue Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Overdue</h2>
                <span className="ml-auto bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {groupedTasks.overdue.length}
                </span>
              </div>
              <div className="space-y-3">
                {groupedTasks.overdue.length > 0 ? (
                  groupedTasks.overdue.map((task) => (
                    <TaskCard key={task.id || task.title} task={task} />
                  ))
                ) : (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                    <CheckCircle2 className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">No overdue tasks!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Today Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Today</h2>
                <span className="ml-auto bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {groupedTasks.dueToday.length}
                </span>
              </div>
              <div className="space-y-3">
                {groupedTasks.dueToday.length > 0 ? (
                  groupedTasks.dueToday.map((task) => (
                    <TaskCard key={task.id || task.title} task={task} />
                  ))
                ) : (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                    <Calendar className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">You are all caught up for today.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Upcoming</h2>
                <span className="ml-auto bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  {groupedTasks.upcoming.length}
                </span>
              </div>
              <div className="space-y-3">
                {groupedTasks.upcoming.length > 0 ? (
                  groupedTasks.upcoming.map((task) => (
                    <TaskCard key={task.id || task.title} task={task} />
                  ))
                ) : (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                    <p className="text-slate-500 text-xs">Nothing on the horizon.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
