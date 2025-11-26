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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { getMyEmployee } from "@/lib/api/employees";
import type { Employee } from "@/lib/types/employee";
import { UserCircle, User, Mail, Shield, Calendar, Phone, MapPin, Building2, CreditCard, DollarSign, Briefcase, FileText } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const [employee, setEmployee] = React.useState<Employee | null>(null);
  const [loadingEmployee, setLoadingEmployee] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchEmployee = async () => {
      if (!user) return;
      
      setLoadingEmployee(true);
      setError(null);
      
      try {
        const employeeData = await getMyEmployee();
        setEmployee(employeeData);
      } catch (err: any) {
        // Jika 404, berarti user tidak memiliki data karyawan (Admin/Owner)
        if (err?.response?.status === 404) {
          setEmployee(null);
        } else {
          setError(err?.message || "Gagal memuat data karyawan");
        }
      } finally {
        setLoadingEmployee(false);
      }
    };

    if (user) {
      fetchEmployee();
    }
  }, [user]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === "aktif" ? "default" : "secondary";
  };

  const getStatusLabel = (status: string) => {
    return status === "aktif" ? "Aktif" : "Nonaktif";
  };

  const getKategoriLabel = (kategori: string) => {
    const labels: Record<string, string> = {
      tetap: "Tetap",
      kontrak: "Kontrak",
      freelance: "Freelance",
    };
    return labels[kategori] || kategori;
  };

  const getTipeGajiLabel = (tipe: string) => {
    const labels: Record<string, string> = {
      bulanan: "Bulanan",
      per_sesi: "Per Sesi",
    };
    return labels[tipe] || tipe;
  };

  if (authLoading || loadingEmployee) {
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
                  <BreadcrumbPage>Akun</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
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
                <BreadcrumbPage>Akun</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <UserCircle className="h-6 w-6" />
                Akun Saya
              </h1>
              <p className="text-muted-foreground">
                Informasi akun dan data pribadi Anda
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Informasi User */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pengguna</CardTitle>
                <CardDescription>Data akun pengguna Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nama</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.name || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Peran</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user?.roles && user.roles.length > 0 ? (
                        user.roles.map((role, index) => (
                          <Badge key={index} variant="secondary">
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Tidak ada peran</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tanggal Dibuat</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(user?.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informasi Karyawan - Hanya ditampilkan jika ada data karyawan */}
            {employee ? (
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Karyawan</CardTitle>
                  <CardDescription>Data karyawan Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Kode Karyawan</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.kode_karyawan || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Kategori</p>
                      <p className="text-sm text-muted-foreground">
                        {getKategoriLabel(employee.kategori_karyawan)}
                        {employee.subtipe_kontrak && employee.kategori_karyawan === "kontrak" && (
                          <span className="ml-2">
                            ({employee.subtipe_kontrak === "full_time" ? "Full Time" : "Part Time"})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Tipe Gaji</p>
                      <p className="text-sm text-muted-foreground">
                        {getTipeGajiLabel(employee.tipe_gaji)}
                      </p>
                    </div>
                  </div>
                  {employee.gaji_pokok !== null && employee.gaji_pokok !== undefined && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Gaji Pokok</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(employee.gaji_pokok)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Badge variant={getStatusBadgeVariant(employee.status)}>
                      {getStatusLabel(employee.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Karyawan</CardTitle>
                  <CardDescription>Data karyawan tidak tersedia</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Akun Anda tidak memiliki data karyawan. Data karyawan hanya tersedia untuk pengguna dengan peran Karyawan.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Informasi Detail Karyawan - Hanya ditampilkan jika ada data karyawan */}
          {employee && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Kontak</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.nomor_hp && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">No. Handphone</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.nomor_hp}
                        </p>
                      </div>
                    </div>
                  )}
                  {employee.alamat && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Alamat</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.alamat}
                        </p>
                      </div>
                    </div>
                  )}
                  {employee.tanggal_lahir && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Tanggal Lahir</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(employee.tanggal_lahir)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informasi Bank</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.bank_nama && (
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nama Bank</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.bank_nama}
                        </p>
                      </div>
                    </div>
                  )}
                  {employee.bank_no_rekening && (
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">No. Rekening</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.bank_no_rekening}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

