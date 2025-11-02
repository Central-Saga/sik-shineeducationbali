"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { RoleForm } from "@/components/roles/role-form";
import { Button } from "@/components/ui/button";
import { createRole } from "@/lib/api/roles";
import type { RoleFormData } from "@/lib/types/role";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function CreateRolePage() {
  const router = useRouter();

  const handleSubmit = async (data: RoleFormData) => {
    try {
      await createRole(data);
      toast.success("Role created successfully");
      router.push("/dashboard/roles");
    } catch (error: any) {
      // Error will be handled by RoleForm component
      throw error;
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
                <BreadcrumbLink href="/dashboard/roles">Roles</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/roles">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Create New Role
              </h1>
              <p className="text-muted-foreground">
                Add a new role and assign permissions
              </p>
            </div>
          </div>

          <div className="max-w-4xl">
            <RoleForm
              onSubmit={handleSubmit}
              onCancel={() => router.push("/dashboard/roles")}
              submitLabel="Create Role"
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

