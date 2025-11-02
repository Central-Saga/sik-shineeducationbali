"use client";

import * as React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface PermissionSelectorProps {
  selectedPermissions: string[];
  onSelectionChange: (permissions: string[]) => void;
  className?: string;
}

export function PermissionSelector({
  selectedPermissions,
  onSelectionChange,
  className,
}: PermissionSelectorProps) {
  const { permissions, groupedPermissions, loading, error } = usePermissions();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter permissions based on search query
  const filteredGroupedPermissions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedPermissions;
    }

    const query = searchQuery.toLowerCase();
    const filtered: typeof groupedPermissions = {};

    Object.entries(groupedPermissions).forEach(([resource, perms]) => {
      const matchingPerms = perms.filter(
        (perm) =>
          perm.name.toLowerCase().includes(query) ||
          resource.toLowerCase().includes(query)
      );

      if (matchingPerms.length > 0) {
        filtered[resource] = matchingPerms;
      }
    });

    return filtered;
  }, [groupedPermissions, searchQuery]);

  const handlePermissionToggle = (permissionName: string) => {
    const isSelected = selectedPermissions.includes(permissionName);
    if (isSelected) {
      onSelectionChange(
        selectedPermissions.filter((p) => p !== permissionName)
      );
    } else {
      onSelectionChange([...selectedPermissions, permissionName]);
    }
  };

  const handleSelectAllInGroup = (resource: string) => {
    const groupPermissions = filteredGroupedPermissions[resource] || [];
    const groupPermissionNames = groupPermissions.map((p) => p.name);
    const allSelected = groupPermissionNames.every((name) =>
      selectedPermissions.includes(name)
    );

    if (allSelected) {
      // Deselect all in group
      onSelectionChange(
        selectedPermissions.filter((p) => !groupPermissionNames.includes(p))
      );
    } else {
      // Select all in group
      const newSelection = [
        ...selectedPermissions.filter((p) => !groupPermissionNames.includes(p)),
        ...groupPermissionNames,
      ];
      onSelectionChange(newSelection);
    }
  };

  const handleSelectAll = () => {
    const allPermissionNames = permissions.map((p) => p.name);
    const allSelected = allPermissionNames.every((name) =>
      selectedPermissions.includes(name)
    );

    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allPermissionNames);
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-destructive", className)}>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const allPermissionNames = permissions.map((p) => p.name);
  const allSelected = allPermissionNames.length > 0 && allPermissionNames.every((name) =>
    selectedPermissions.includes(name)
  );
  const someSelected = selectedPermissions.length > 0 && !allSelected;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search permissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Select All */}
      <div className="flex items-center space-x-2 rounded-lg border p-3">
        <Checkbox
          id="select-all"
          checked={allSelected}
          ref={(el) => {
            if (el) {
              (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someSelected;
            }
          }}
          onCheckedChange={handleSelectAll}
        />
        <label
          htmlFor="select-all"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Select All Permissions
        </label>
        <Badge variant="secondary" className="ml-auto">
          {selectedPermissions.length} / {permissions.length}
        </Badge>
      </div>

      {/* Grouped Permissions */}
      <div className="space-y-4">
        {Object.entries(filteredGroupedPermissions).map(([resource, perms]) => {
          const groupPermissionNames = perms.map((p) => p.name);
          const allGroupSelected = groupPermissionNames.every((name) =>
            selectedPermissions.includes(name)
          );
          const someGroupSelected =
            groupPermissionNames.some((name) =>
              selectedPermissions.includes(name)
            ) && !allGroupSelected;

          return (
            <Card key={resource}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${resource}`}
                    checked={allGroupSelected}
                    ref={(el) => {
                      if (el) {
                        (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someGroupSelected;
                      }
                    }}
                    onCheckedChange={() => handleSelectAllInGroup(resource)}
                  />
                  <CardTitle className="text-base capitalize">
                    {resource}
                  </CardTitle>
                  <Badge variant="outline" className="ml-auto">
                    {groupPermissionNames.filter((name) =>
                      selectedPermissions.includes(name)
                    ).length}{" "}
                    / {perms.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {perms.map((permission) => {
                    const isSelected = selectedPermissions.includes(
                      permission.name
                    );
                    return (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2 rounded-md border p-2 hover:bg-accent transition-colors"
                      >
                        <Checkbox
                          id={`perm-${permission.id}`}
                          checked={isSelected}
                          onCheckedChange={() =>
                            handlePermissionToggle(permission.name)
                          }
                        />
                        <label
                          htmlFor={`perm-${permission.id}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {permission.name.replace(`${resource}.`, "")}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Object.keys(filteredGroupedPermissions).length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground">
              No permissions found matching "{searchQuery}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

