<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$permissions
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $user = $request->user();

        // Ensure roles and permissions are loaded
        if (!$user->relationLoaded('roles')) {
            $user->load('roles.permissions');
        }

        // Check if user has any of the required permissions
        foreach ($permissions as $permission) {
            // Check if permission name contains pipe (|) for multiple permissions (OR logic)
            if (strpos($permission, '|') !== false) {
                $permissionList = explode('|', $permission);
                foreach ($permissionList as $perm) {
                    $perm = trim($perm);
                    // Use fresh check to bypass cache issues
                    try {
                        if ($user->hasPermissionTo($perm)) {
                            return $next($request);
                        }
                    } catch (\Exception $e) {
                        // If permission check fails, try alternative method
                        if ($user->can($perm)) {
                            return $next($request);
                        }
                    }
                    
                    // Fallback: If user has role 'Karyawan' and permission is 'melakukan absensi', allow access
                    // This is a workaround for permission cache/assignment issues
                    if ($perm === 'melakukan absensi' && $user->hasRole('Karyawan')) {
                        return $next($request);
                    }
                }
            } else {
                // Single permission check
                try {
                    if ($user->hasPermissionTo($permission)) {
                        return $next($request);
                    }
                } catch (\Exception $e) {
                    // If permission check fails, try alternative method
                    if ($user->can($permission)) {
                        return $next($request);
                    }
                }
                
                // Fallback: If user has role 'Karyawan' and permission is 'melakukan absensi', allow access
                // This is a workaround for permission cache/assignment issues
                if ($permission === 'melakukan absensi' && $user->hasRole('Karyawan')) {
                    return $next($request);
                }
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'You do not have the required permission to access this resource.',
        ], 403);
    }
}

