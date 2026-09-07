"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Users, Shield, UsersRound, Webhook } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarNavItems = [
  {
    title: "General",
    href: "/settings/general",
    icon: Settings,
  },
  {
    title: "Users",
    href: "/settings/users",
    icon: Users,
  },
  {
    title: "Roles",
    href: "/settings/roles",
    icon: Shield,
  },
  {
    title: "Teams",
    href: "/settings/teams",
    icon: UsersRound,
  },
  {
    title: "Integrations",
    href: "/settings/integrations",
    icon: Webhook,
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-8 p-6 md:p-8 max-w-7xl mx-auto">
      <aside className="w-full md:w-60 shrink-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h2>
          <p className="text-xs text-slate-500 mt-1">Manage your account and organization settings.</p>
        </div>
        <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold border border-slate-200/80 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-400")} />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 w-full glass rounded-2xl shadow-xs border border-slate-200/80 p-6 md:p-8 min-h-[500px] bg-white">
        {children}
      </main>
    </div>
  );
}
