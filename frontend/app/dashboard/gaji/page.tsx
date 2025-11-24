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
import { Button } from "@/components/ui/button";
import { useGaji } from "@/hooks/use-gaji";
import { toast } from "sonner";
import { DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function GajiPage() {
  const [periodeFilter, setPeriodeFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("semua");

  const params = React.useMemo(() => {
    const filters: Record<string, string> = {};
    if (periodeFilter) {
      filters.periode = periodeFilter;
    }
    if (statusFilter !== "semua") {
      filters.status = statusFilter;
    }
    return filters;
  }, [periodeFilter, statusFilter]);

  const { gaji, loading, error } = useGaji(
    Object.keys(params).length > 0 ? params : undefined
  );

  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "disetujui":
        return "default";
      case "dibayar":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Draft";
      case "disetujui":
        return "Disetujui";
      case "dibayar":
        return "Dibayar";
      default:
        return status;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Gaji</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Gaji</h1>
              <p className="text-muted-foreground">
                Daftar gaji karyawan
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="month"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Filter periode (YYYY-MM)"
                value={periodeFilter}
                onChange={(e) => setPeriodeFilter(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="disetujui">Disetujui</SelectItem>
                <SelectItem value="dibayar">Dibayar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p>Memuat data...</p>
            </div>
          ) : gaji.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Belum ada data gaji.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Hari Cuti</TableHead>
                    <TableHead>Potongan Cuti</TableHead>
                    <TableHead>Total Gaji</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gaji.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.periode}</TableCell>
                      <TableCell>
                        {item.employee?.user?.name || `Karyawan #${item.karyawan_id}`}
                      </TableCell>
                      <TableCell>{item.hari_cuti}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(item.potongan_cuti)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(item.total_gaji)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/gaji/${item.id}`}>
                          <Button variant="outline" size="sm">
                            Detail
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

