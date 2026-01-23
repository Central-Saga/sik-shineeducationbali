"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleTable } from "@/components/roles/role-table";
import { useRoles } from "@/hooks/use-roles";
import { Plus, Search, Shield } from "lucide-react";
import { toast } from "sonner";

export default function RolesPage() {
  const router = useRouter();
  const { roles, loading, error, refetch, removeRole } = useRoles();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter roles based on search query
  const filteredRoles = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return roles;
    }

    const query = searchQuery.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        role.guard_name.toLowerCase().includes(query) ||
        role.permissions.some((p) => p.toLowerCase().includes(query))
    );
  }, [roles, searchQuery]);

  const handleDelete = async (id: number | string) => {
    try {
      await removeRole(id);
      toast.success("Peran berhasil dihapus");
      await refetch();
    } catch (error: any) {
      toast.error(error?.message || "Gagal menghapus peran");
    }
  };

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
                <BreadcrumbPage>Peran</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Peran & Izin
              </h1>
              <p className="text-muted-foreground">
                Kelola peran dan izin mereka
              </p>
            </div>
            <Button asChild variant="success">
              <Link href="/dashboard/roles/create">
                <Plus className="h-4 w-4" />
                Buat Peran
              </Link>
            </Button>
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
              placeholder="Cari peran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Peran
              </div>
              <div className="text-2xl font-bold mt-1">
                {loading ? "..." : roles.length}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Izin
              </div>
              <div className="text-2xl font-bold mt-1">
                {loading
                  ? "..."
                  : roles.reduce(
                      (sum, role) => sum + role.permissions_count,
                      0
                    )}
              </div>
            </div>
          </div>

          {/* Roles Table */}
          <RoleTable
            roles={filteredRoles}
            loading={loading}
            onDelete={handleDelete}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

