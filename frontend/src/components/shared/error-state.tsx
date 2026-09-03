import * as React from "react"
import { AlertCircle } from "lucide-react"

interface ErrorStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function ErrorState({ 
  title = "Something went wrong", 
  description = "An error occurred while loading this content.",
  action 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass rounded-xl border border-rose-500/20 bg-rose-500/5 min-h-[300px]">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 mb-4">
        <AlertCircle className="h-8 w-8 text-rose-500" />
      </div>
      <h3 className="text-lg font-semibold text-rose-100 mb-2">{title}</h3>
      <p className="text-sm text-rose-200/70 max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
