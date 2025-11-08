"use client";

import { useAuth } from '@/hooks/use-auth';
import type { ReactNode } from 'react';

interface HasCanProps {
  role?: string | string[];
  permission?: string | string[];
  any?: boolean; // Jika true, cukup salah satu match (OR), jika false semua harus match (AND)
  children: ReactNode;
  fallback?: ReactNode;
}

export function HasCan({ 
  role, 
  permission, 
  any = false, 
  children, 
  fallback = null 
}: HasCanProps) {
  const { hasRole, hasPermission } = useAuth();

  // Jika tidak ada role atau permission yang di-check, render children
  if (!role && !permission) {
    return <>{children}</>;
  }

  let canAccess = false;

  if (any) {
    // OR logic: cukup salah satu match
    const roleMatch = role ? hasRole(role) : false;
    const permissionMatch = permission ? hasPermission(permission) : false;
    canAccess = roleMatch || permissionMatch;
  } else {
    // AND logic: semua harus match
    const roleMatch = role ? hasRole(role) : true;
    const permissionMatch = permission ? hasPermission(permission) : true;
    canAccess = roleMatch && permissionMatch;
  }

  return canAccess ? <>{children}</> : <>{fallback}</>;
}

