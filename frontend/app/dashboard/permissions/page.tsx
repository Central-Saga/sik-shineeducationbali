"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/use-permissions";
import { Search, Shield } from "lucide-react";

export default function PermissionsPage() {
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

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Izin</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Izin
            </h1>
            <p className="text-muted-foreground">
              Lihat semua izin yang tersedia di sistem
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari izin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Izin
              </div>
              <div className="text-2xl font-bold mt-1">
                {loading ? "..." : permissions.length}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Grup Sumber Daya
              </div>
              <div className="text-2xl font-bold mt-1">
                {loading ? "..." : Object.keys(groupedPermissions).length}
              </div>
            </div>
          </div>

          {/* Permissions by Resource */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-8 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : Object.keys(filteredGroupedPermissions).length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Tidak ada izin ditemukan
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? `Tidak ada izin yang cocok dengan "${searchQuery}"`
                      : "Tidak ada izin yang tersedia"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(filteredGroupedPermissions).map(
                ([resource, perms]) => (
                  <Card key={resource}>
                    <CardHeader>
                      <CardTitle className="text-lg capitalize flex items-center justify-between">
                        <span>{resource}</span>
                        <Badge variant="secondary">{perms.length} izin</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {perms.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center gap-2 rounded-md border p-2 bg-muted/30"
                          >
                            <code className="text-xs font-mono">
                              {permission.name}
                            </code>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {permission.guard_name}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

