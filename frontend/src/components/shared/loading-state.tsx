import * as React from "react"

interface LoadingStateProps {
  text?: string
}

export function LoadingState({ text = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-white/10" />
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin absolute" />
      </div>
      {text && <p className="mt-4 text-sm text-white/50 font-medium animate-pulse">{text}</p>}
    </div>
  )
}
