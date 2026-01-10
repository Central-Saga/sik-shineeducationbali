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
import { EmployeeForm } from "@/components/employees/employee-form";
import { Button } from "@/components/ui/button";
import { createEmployee } from "@/lib/api/employees";
import type { EmployeeFormData } from "@/lib/types/employee";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function CreateEmployeePage() {
  const router = useRouter();

  const handleSubmit = async (data: EmployeeFormData) => {
    try {
      await createEmployee(data);
      toast.success("Karyawan berhasil ditambahkan");
      router.push("/dashboard/employees");
    } catch (error: any) {
      // Error will be handled by EmployeeForm component
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
                <BreadcrumbLink href="/dashboard/employees">Karyawan</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Tambah</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/employees">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Kembali</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Tambah Karyawan Baru
              </h1>
              <p className="text-muted-foreground">
                Tambahkan karyawan baru beserta akun login
              </p>
            </div>
          </div>

          <EmployeeForm
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/employees")}
            submitLabel="Tambah Karyawan"
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

