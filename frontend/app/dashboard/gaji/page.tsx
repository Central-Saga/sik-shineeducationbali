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
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { DollarSign, Download, Printer } from "lucide-react";
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
  const [tahunFilter, setTahunFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("semua");
  const [updatingStatus, setUpdatingStatus] = React.useState<number | null>(null);

  const { hasRole, hasPermission, user } = useAuth();
  const isKaryawan = hasRole("Karyawan");
  const canViewGaji = hasPermission("melihat gaji") || hasPermission("mengelola gaji");

  const params = React.useMemo(() => {
    const filters: Record<string, string> = {};
    // Untuk Karyawan: tidak filter periode di backend, akan filter di frontend berdasarkan tahun
    if (!isKaryawan && periodeFilter) {
      // Untuk Admin/Owner: filter berdasarkan periode YYYY-MM
      filters.periode = periodeFilter;
    }
    if (statusFilter !== "semua") {
      filters.status = statusFilter;
    }
    return filters;
  }, [periodeFilter, statusFilter, isKaryawan]);

  const { gaji: allGaji, loading, error, updateStatus, refetch } = useGaji(
    Object.keys(params).length > 0 ? params : undefined
  );

  // Filter gaji berdasarkan tahun untuk Karyawan dan defense in depth filter
  const gaji = React.useMemo(() => {
    let filtered = allGaji;
    
    // Defense in depth: Untuk Karyawan, pastikan hanya gaji mereka yang ditampilkan
    // (Backend sudah memfilter, ini hanya untuk memastikan)
    if (isKaryawan && filtered.length > 0) {
      // Ambil karyawan_id dari gaji pertama (karena backend sudah memfilter, semua gaji seharusnya milik karyawan yang sama)
      const firstKaryawanId = filtered[0]?.karyawan_id;
      if (firstKaryawanId) {
        // Filter untuk memastikan hanya gaji dengan karyawan_id yang sama
        filtered = filtered.filter((item) => item.karyawan_id === firstKaryawanId);
      }
    }
    
    // Filter berdasarkan tahun untuk Karyawan
    if (isKaryawan && tahunFilter) {
      filtered = filtered.filter((item) => {
        const [year] = item.periode.split("-");
        return year === tahunFilter;
      });
    }
    
    return filtered;
  }, [allGaji, tahunFilter, isKaryawan]);

  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Helper function untuk format periode
  const formatPeriode = (periode: string): string => {
    if (isKaryawan) {
      // Untuk Karyawan: tampilkan hanya nama bulan (Januari, Februari, dst)
      const [year, month] = periode.split("-");
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const monthIndex = parseInt(month, 10) - 1;
      return monthNames[monthIndex] || periode;
    }
    // Untuk Admin/Owner: tampilkan format asli YYYY-MM
    return periode;
  };

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

  const handleExportToCSV = () => {
    if (gaji.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    // Prepare CSV data
    const headers = [
      "Periode",
      "Karyawan",
      "Hari Cuti",
      "Potongan Cuti",
      "Total Gaji",
      "Status",
    ];

    const csvRows = [
      headers.join(","),
      ...gaji.map((item) =>
        [
          formatPeriode(item.periode),
          `"${item.employee?.user?.name || `Karyawan #${item.karyawan_id}`}"`,
          item.hari_cuti,
          item.potongan_cuti,
          item.total_gaji,
          getStatusLabel(item.status),
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `gaji-${periodeFilter || "all"}-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Laporan berhasil diekspor");
  };

  const handleStatusChange = async (gajiId: number, newStatus: string) => {
    try {
      setUpdatingStatus(gajiId);
      await updateStatus(gajiId, newStatus as "draft" | "disetujui" | "dibayar");
      toast.success("Status gaji berhasil diubah");
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status gaji");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handlePrint = () => {
    if (gaji.length === 0) {
      toast.error("Tidak ada data untuk dicetak");
      return;
    }

    // Create print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Tidak dapat membuka jendela cetak. Pastikan pop-up tidak diblokir.");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Gaji</title>
          <style>
            @media print {
              @page {
                margin: 1cm;
              }
              .print-button {
                display: none;
              }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            .print-button {
              margin-bottom: 20px;
              padding: 10px 20px;
              background-color: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
            }
            .print-button:hover {
              background-color: #0056b3;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
            }
            .info {
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .text-right {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">Cetak / Print</button>
          <h1>Laporan Gaji</h1>
          <div class="info">
            <p><strong>Periode:</strong> ${isKaryawan ? (tahunFilter || "Semua Tahun") : (periodeFilter || "Semua Periode")}</p>
            <p><strong>Status:</strong> ${statusFilter !== "semua" ? getStatusLabel(statusFilter) : "Semua Status"}</p>
            <p><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString("id-ID")}</p>
            <p><strong>Jumlah Data:</strong> ${gaji.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Periode</th>
                <th>Karyawan</th>
                <th>Hari Cuti</th>
                <th class="text-right">Potongan Cuti</th>
                <th class="text-right">Total Gaji</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${gaji
                .map(
                  (item) => `
                <tr>
                  <td>${formatPeriode(item.periode)}</td>
                  <td>${item.employee?.user?.name || `Karyawan #${item.karyawan_id}`}</td>
                  <td>${item.hari_cuti}</td>
                  <td class="text-right">${new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(item.potongan_cuti)}</td>
                  <td class="text-right">${new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(item.total_gaji)}</td>
                  <td>${getStatusLabel(item.status)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
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
            {(hasRole("Owner") || hasRole("Admin")) && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  disabled={gaji.length === 0}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak Laporan
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportToCSV}
                  disabled={gaji.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {isKaryawan && canViewGaji ? (
              <Select value={tahunFilter || "semua"} onValueChange={(value) => setTahunFilter(value === "semua" ? "" : value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Tahun</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-[200px]">
              <input
                type="month"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Filter periode (YYYY-MM)"
                value={periodeFilter}
                onChange={(e) => setPeriodeFilter(e.target.value)}
              />
            </div>
            )}
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
                      <TableCell>{formatPeriode(item.periode)}</TableCell>
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
                        {hasRole("Owner") ? (
                          <Select
                            value={item.status}
                            onValueChange={(value) => handleStatusChange(item.id, value)}
                            disabled={updatingStatus === item.id}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="disetujui">Disetujui</SelectItem>
                              <SelectItem value="dibayar">Dibayar</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={getStatusBadgeVariant(item.status)}>
                            {getStatusLabel(item.status)}
                          </Badge>
                        )}
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

