"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCurrentUser } from '@/lib/api/auth';
import type { User } from '@/lib/types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string | string[]) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setError(null);
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch user on mount, but don't block rendering
    fetchUser();
  }, [fetchUser]);

  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!user?.roles || user.roles.length === 0) return false;
    
    const rolesToCheck = Array.isArray(role) ? role : [role];
    return rolesToCheck.some(r => 
      user.roles?.some(userRole => 
        userRole.toLowerCase() === r.toLowerCase()
      )
    );
  }, [user]);

  const hasPermission = useCallback((permission: string | string[]): boolean => {
    if (!user?.permissions || user.permissions.length === 0) return false;
    
    const permissionsToCheck = Array.isArray(permission) ? permission : [permission];
    return permissionsToCheck.some(p => 
      user.permissions?.some(userPermission => 
        userPermission.toLowerCase() === p.toLowerCase()
      )
    );
  }, [user]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return hasRole(roles);
  }, [hasRole]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return hasPermission(permissions);
  }, [hasPermission]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        refetch: fetchUser,
        hasRole,
        hasPermission,
        hasAnyRole,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

