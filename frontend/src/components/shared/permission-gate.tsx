import * as React from "react"

// In a real app, this would use a context or store
// For now, we simulate with a dummy permission hook/logic
const usePermissions = () => {
  return {
    hasPermission: (permission: string) => true // default mock
  }
}

interface PermissionGateProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = usePermissions()
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
