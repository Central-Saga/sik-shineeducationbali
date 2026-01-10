"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEmployee } from "@/hooks/use-employee";
import { deleteEmployee } from "@/lib/api/employees";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Pencil, Trash2, User, Mail, Phone, MapPin, Calendar, Building2, CreditCard, DollarSign } from "lucide-react";

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  const { employee, loading, error } = useEmployee(employeeId);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!employee) return;

    try {
      setIsDeleting(true);
      await deleteEmployee(employee.id);
      toast.success("Karyawan berhasil dihapus");
      router.push("/dashboard/employees");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus karyawan";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const getKategoriLabel = (kategori: string) => {
    const labels: Record<string, string> = {
      tetap: 'Tetap',
      kontrak: 'Kontrak',
      freelance: 'Freelance',
    };
    return labels[kategori] || kategori;
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'aktif' ? 'default' : 'secondary';
  };

  const getStatusLabel = (status: string) => {
    return status === 'aktif' ? 'Aktif' : 'Nonaktif';
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
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
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:p-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Memuat data karyawan...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !employee) {
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
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Karyawan tidak ditemukan</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {error || "Karyawan yang Anda cari tidak ada."}
              </p>
              <Button asChild>
                <Link href="/dashboard/employees">Kembali ke Daftar Karyawan</Link>
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
                <BreadcrumbPage>Detail</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/employees">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Kembali</span>
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Detail Karyawan: {employee?.user?.name || `ID: ${employee?.id || 'N/A'}`}
                </h1>
                <p className="text-muted-foreground">
                  Informasi lengkap karyawan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/employees/${employee.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Informasi Personal */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Personal</CardTitle>
                <CardDescription>Data pribadi karyawan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nama</p>
                    <p className="text-sm text-muted-foreground">
                      {employee?.user?.name || '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {employee?.user?.email || '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">No. Handphone</p>
                    <p className="text-sm text-muted-foreground">
                      {employee?.nomor_hp || '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Alamat</p>
                    <p className="text-sm text-muted-foreground">
                      {employee?.alamat || '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tanggal Lahir</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(employee?.tanggal_lahir)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informasi Karyawan */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Karyawan</CardTitle>
                <CardDescription>Data pekerjaan dan status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Kode Karyawan</p>
                    <p className="text-sm font-mono text-muted-foreground">
                      {employee?.kode_karyawan || '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Kategori</p>
                    <Badge variant="outline" className="mt-1">
                      {getKategoriLabel(employee?.kategori_karyawan || '')}
                    </Badge>
                    {employee?.kategori_karyawan === 'kontrak' && employee?.subtipe_kontrak && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {employee.subtipe_kontrak === 'full_time' ? 'Full Time' : 'Part Time'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={getStatusBadgeVariant(employee?.status || '')} className="mt-1">
                      {getStatusLabel(employee?.status || '')}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tipe Gaji</p>
                    <p className="text-sm text-muted-foreground">
                      {employee?.tipe_gaji === 'bulanan' ? 'Bulanan' : 'Per Sesi'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Gaji Pokok</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(employee?.gaji_pokok)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informasi Bank */}
            {(employee?.bank_nama || employee?.bank_no_rekening) && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Informasi Bank</CardTitle>
                  <CardDescription>Data rekening bank</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nama Bank</p>
                        <p className="text-sm text-muted-foreground">
                          {employee?.bank_nama || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">No. Rekening</p>
                        <p className="text-sm font-mono text-muted-foreground">
                          {employee?.bank_no_rekening || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Karyawan</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus karyawan &quot;
                {employee?.user?.name || employee?.kode_karyawan || `ID: ${employee?.id}`}
                &quot;? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}

