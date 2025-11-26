"use client";

import * as React from "react";
import Link from "next/link";
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
import { UserTable } from "@/components/users/user-table";
import { useUsers } from "@/hooks/use-users";
import { Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const { users, loading, error, refetch, removeUser } = useUsers();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user?.name?.toLowerCase().includes(query) ||
        user?.email?.toLowerCase().includes(query) ||
        user?.roles?.some((r) => r.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  const handleDelete = async (id: number | string) => {
    try {
      await removeUser(id);
      toast.success("Pengguna berhasil dihapus");
      await refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus pengguna";
      toast.error(errorMessage);
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
                <BreadcrumbPage>Pengguna</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <Users className="h-6 w-6" />
                Pengguna
              </h1>
              <p className="text-muted-foreground">
                Kelola pengguna dan peran mereka
              </p>
            </div>
            <Button asChild variant="success">
              <Link href="/dashboard/users/create">
                <Plus className="h-4 w-4" />
                Tambah Pengguna
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
              placeholder="Cari pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Pengguna
              </div>
              <div className="text-2xl font-bold mt-1">
                {loading ? "..." : users.length}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Pengguna Tersaring
              </div>
              <div className="text-2xl font-bold mt-1">
                {loading ? "..." : filteredUsers.length}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <UserTable
            users={filteredUsers}
            allUsers={users}
            loading={loading}
            onDelete={handleDelete}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

