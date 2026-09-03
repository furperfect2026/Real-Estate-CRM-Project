import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusVariant = 
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: StatusVariant
  status?: string
  children?: React.ReactNode
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold",
  warning: "bg-amber-50 text-amber-800 border-amber-300 font-semibold",
  error: "bg-rose-50 text-rose-700 border-rose-300 font-semibold",
  info: "bg-blue-50 text-blue-700 border-blue-300 font-semibold",
  default: "bg-slate-100 text-slate-700 border-slate-300 font-semibold",
}

const mapStatusToVariant = (status: string): StatusVariant => {
  const s = status.toLowerCase();
  if (s.includes('completed') || s.includes('active') || s.includes('success')) return 'success';
  if (s.includes('progress') || s.includes('info')) return 'info';
  if (s.includes('high') || s.includes('urgent') || s.includes('missed') || s.includes('error') || s.includes('overdue')) return 'error';
  if (s.includes('medium') || s.includes('warning') || s.includes('pending')) return 'warning';
  return 'default';
};

export function StatusBadge({ variant, status, children, className, ...props }: StatusBadgeProps) {
  const finalVariant = variant || (status ? mapStatusToVariant(status) : "default");
  
  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm shadow-sm",
        variantStyles[finalVariant],
        className
      )}
      {...props}
    >
      {children || status}
    </div>
  )
}
