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
import { getGajiById } from "@/lib/api/gaji";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useKomponenGaji } from "@/hooks/use-komponen-gaji";
import { usePembayaranGaji } from "@/hooks/use-pembayaran-gaji";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GajiDetailPage({ params }: { params: { id: string } }) {
  const [gaji, setGaji] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { komponenGaji, loading: loadingKomponen } = useKomponenGaji(params.id);
  const { pembayaranGaji, loading: loadingPembayaran } = usePembayaranGaji(params.id);

  React.useEffect(() => {
    const loadGaji = async () => {
      try {
        setLoading(true);
        const data = await getGajiById(params.id);
        setGaji(data);
      } catch (err: any) {
        toast.error(err.message || "Gagal memuat data gaji");
      } finally {
        setLoading(false);
      }
    };
    loadGaji();
  }, [params.id]);

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

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <p>Memuat data...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!gaji) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <p>Data gaji tidak ditemukan</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
                <BreadcrumbLink href="/dashboard/gaji">Gaji</BreadcrumbLink>
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
              <Link href="/dashboard/gaji">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Detail Gaji</h1>
                <p className="text-muted-foreground">
                  Periode: {gaji.periode}
                </p>
              </div>
            </div>
            <Badge variant={getStatusBadgeVariant(gaji.status)}>
              {getStatusLabel(gaji.status)}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Gaji</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Karyawan</p>
                  <p className="font-medium">
                    {gaji.employee?.user?.name || `Karyawan #${gaji.karyawan_id}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Periode</p>
                  <p className="font-medium">{gaji.periode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hari Cuti</p>
                  <p className="font-medium">{gaji.hari_cuti}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Potongan Cuti</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(gaji.potongan_cuti)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Gaji</p>
                  <p className="font-bold text-lg">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(gaji.total_gaji)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Komponen Gaji</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingKomponen ? (
                  <p>Memuat komponen...</p>
                ) : komponenGaji.length === 0 ? (
                  <p className="text-muted-foreground">Tidak ada komponen gaji</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Komponen</TableHead>
                        <TableHead className="text-right">Nominal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {komponenGaji.map((komponen) => (
                        <TableRow key={komponen.id}>
                          <TableCell>{komponen.nama_komponen}</TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(komponen.nominal)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pembayaran Gaji</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPembayaran ? (
                <p>Memuat pembayaran...</p>
              ) : pembayaranGaji.length === 0 ? (
                <p className="text-muted-foreground">Belum ada pembayaran</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal Transfer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bukti Transfer</TableHead>
                      <TableHead>Catatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pembayaranGaji.map((pembayaran) => (
                      <TableRow key={pembayaran.id}>
                        <TableCell>{pembayaran.tanggal_transfer}</TableCell>
                        <TableCell>
                          <Badge>{pembayaran.status_pembayaran}</Badge>
                        </TableCell>
                        <TableCell>{pembayaran.bukti_transfer || "-"}</TableCell>
                        <TableCell>{pembayaran.catatan || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

