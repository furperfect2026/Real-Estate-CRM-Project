"use client";

import * as React from "react"
import { Search } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg transition-colors w-full md:w-64"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-300 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-500 shadow-2xs">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." className="border-none focus:ring-0 text-slate-900 placeholder:text-slate-400" />
        <CommandList className="bg-white text-slate-900 border-t border-slate-100">
          <CommandEmpty className="text-slate-500 text-sm py-6 text-center">No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions" className="text-slate-400 font-medium">
            <CommandItem className="text-slate-800 hover:bg-slate-100 hover:text-slate-900 cursor-pointer data-[selected=true]:bg-slate-100 data-[selected=true]:text-slate-900">
              Go to Dashboard
            </CommandItem>
            <CommandItem className="text-slate-800 hover:bg-slate-100 hover:text-slate-900 cursor-pointer data-[selected=true]:bg-slate-100 data-[selected=true]:text-slate-900">
              Create New Lead
            </CommandItem>
            <CommandItem className="text-slate-800 hover:bg-slate-100 hover:text-slate-900 cursor-pointer data-[selected=true]:bg-slate-100 data-[selected=true]:text-slate-900">
              View Pipeline
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
