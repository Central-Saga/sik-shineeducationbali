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
import { useRekapBulanan } from "@/hooks/use-rekap-bulanan";
import { useGaji } from "@/hooks/use-gaji";
import { useAuth } from "@/hooks/use-auth";
import { HasCan } from "@/components/has-can";
import { toast } from "sonner";
import { Calendar, Plus, DollarSign, Printer, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function RekapBulananPage() {
  const [periodeFilter, setPeriodeFilter] = React.useState<string>("");
  const [generateDialogOpen, setGenerateDialogOpen] = React.useState(false);
  const [periodeInput, setPeriodeInput] = React.useState<string>(
    format(new Date(), "yyyy-MM")
  );
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isGeneratingGaji, setIsGeneratingGaji] = React.useState<number | null>(null);

  const params = React.useMemo(() => {
    const filters: Record<string, string> = {};
    if (periodeFilter) {
      filters.periode = periodeFilter;
    }
    return filters;
  }, [periodeFilter]);

  const { rekapBulanan, loading, error, refetch, generate } = useRekapBulanan(
    Object.keys(params).length > 0 ? params : undefined
  );
  const { generateFromRekap: generateGajiFromRekap } = useGaji();
  const { hasPermission, hasRole } = useAuth();

  const handleGenerate = async () => {
    if (!periodeInput.match(/^\d{4}-\d{2}$/)) {
      toast.error("Format periode tidak valid. Gunakan format YYYY-MM");
      return;
    }

    try {
      setIsGenerating(true);
      await generate({ periode: periodeInput });
      toast.success("Rekap bulanan berhasil di-generate");
      setGenerateDialogOpen(false);
      setPeriodeFilter(periodeInput);
    } catch (err: any) {
      toast.error(err.message || "Gagal generate rekap bulanan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateGaji = async (rekapId: number) => {
    try {
      setIsGeneratingGaji(rekapId);
      await generateGajiFromRekap(rekapId);
      toast.success("Gaji berhasil di-generate dari rekap bulanan");
    } catch (err: any) {
      toast.error(err.message || "Gagal generate gaji");
    } finally {
      setIsGeneratingGaji(null);
    }
  };

  const handleGenerateAllGaji = async () => {
    if (rekapBulanan.length === 0) {
      toast.error("Tidak ada rekap bulanan untuk di-generate");
      return;
    }

    try {
      setIsGeneratingGaji(-1); // Use -1 to indicate "all"
      let successCount = 0;
      let errorCount = 0;

      for (const rekap of rekapBulanan) {
        try {
          await generateGajiFromRekap(rekap.id);
          successCount++;
        } catch (err) {
          errorCount++;
        }
      }

      if (errorCount === 0) {
        toast.success(`Berhasil generate ${successCount} gaji`);
      } else {
        toast.warning(`Berhasil generate ${successCount} gaji, ${errorCount} gagal`);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal generate gaji");
    } finally {
      setIsGeneratingGaji(null);
    }
  };

  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleExportToCSV = () => {
    if (rekapBulanan.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    // Prepare CSV data
    const headers = [
      "Periode",
      "Karyawan",
      "Hadir",
      "Izin",
      "Sakit",
      "Cuti",
      "Alfa",
      "Sesi Coding",
      "Sesi Non-Coding",
      "Total Pendapatan",
    ];

    const csvRows = [
      headers.join(","),
      ...rekapBulanan.map((rekap) =>
        [
          rekap.periode,
          `"${rekap.employee?.user?.name || `Karyawan #${rekap.karyawan_id}`}"`,
          rekap.jumlah_hadir,
          rekap.jumlah_izin,
          rekap.jumlah_sakit,
          rekap.jumlah_cuti,
          rekap.jumlah_alfa,
          rekap.jumlah_sesi_coding,
          rekap.jumlah_sesi_non_coding,
          rekap.total_pendapatan_sesi,
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
      `rekap-bulanan-${periodeFilter || "all"}-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Laporan berhasil diekspor");
  };

  const handlePrint = () => {
    if (rekapBulanan.length === 0) {
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
          <title>Laporan Rekap Bulanan</title>
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
          <h1>Laporan Rekap Bulanan</h1>
          <div class="info">
            <p><strong>Periode:</strong> ${periodeFilter || "Semua Periode"}</p>
            <p><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString("id-ID")}</p>
            <p><strong>Jumlah Data:</strong> ${rekapBulanan.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Periode</th>
                <th>Karyawan</th>
                <th>Hadir</th>
                <th>Izin</th>
                <th>Sakit</th>
                <th>Cuti</th>
                <th>Alfa</th>
                <th>Sesi Coding</th>
                <th>Sesi Non-Coding</th>
                <th class="text-right">Total Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              ${rekapBulanan
                .map(
                  (rekap) => `
                <tr>
                  <td>${rekap.periode}</td>
                  <td>${rekap.employee?.user?.name || `Karyawan #${rekap.karyawan_id}`}</td>
                  <td>${rekap.jumlah_hadir}</td>
                  <td>${rekap.jumlah_izin}</td>
                  <td>${rekap.jumlah_sakit}</td>
                  <td>${rekap.jumlah_cuti}</td>
                  <td>${rekap.jumlah_alfa}</td>
                  <td>${rekap.jumlah_sesi_coding}</td>
                  <td>${rekap.jumlah_sesi_non_coding}</td>
                  <td class="text-right">${new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(rekap.total_pendapatan_sesi)}</td>
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
                <BreadcrumbPage>Rekap Bulanan</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Rekap Bulanan</h1>
              <p className="text-muted-foreground">
                Rekap bulanan untuk semua karyawan aktif
              </p>
            </div>
            <div className="flex gap-2">
              {(hasRole("Admin") || hasRole("Owner")) && (
                <>
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    disabled={rekapBulanan.length === 0}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak Laporan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportToCSV}
                    disabled={rekapBulanan.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </>
              )}
              <HasCan permission="mengelola gaji">
                <Button
                  variant="gradient"
                  onClick={handleGenerateAllGaji}
                  disabled={rekapBulanan.length === 0 || isGeneratingGaji === -1}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  {isGeneratingGaji === -1 ? "Generating..." : "Generate Semua Gaji"}
                </Button>
              </HasCan>
              <HasCan permission="mengelola rekap bulanan">
                <Button variant="gradient" onClick={() => setGenerateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Rekap
                </Button>
              </HasCan>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-[200px]">
              <Input
                type="month"
                placeholder="Filter periode (YYYY-MM)"
                value={periodeFilter}
                onChange={(e) => setPeriodeFilter(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p>Memuat data...</p>
            </div>
          ) : rekapBulanan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Belum ada rekap bulanan. Klik "Generate Rekap" untuk membuat rekap baru.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Hadir</TableHead>
                    <TableHead>Izin</TableHead>
                    <TableHead>Sakit</TableHead>
                    <TableHead>Cuti</TableHead>
                    <TableHead>Alfa</TableHead>
                    <TableHead>Sesi Coding</TableHead>
                    <TableHead>Sesi Non-Coding</TableHead>
                    <TableHead>Total Pendapatan</TableHead>
                    {hasPermission("mengelola gaji") && <TableHead>Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rekapBulanan.map((rekap) => (
                    <TableRow key={rekap.id}>
                      <TableCell>{rekap.periode}</TableCell>
                      <TableCell>
                        {rekap.employee?.user?.name || `Karyawan #${rekap.karyawan_id}`}
                      </TableCell>
                      <TableCell>{rekap.jumlah_hadir}</TableCell>
                      <TableCell>{rekap.jumlah_izin}</TableCell>
                      <TableCell>{rekap.jumlah_sakit}</TableCell>
                      <TableCell>{rekap.jumlah_cuti}</TableCell>
                      <TableCell>{rekap.jumlah_alfa}</TableCell>
                      <TableCell>{rekap.jumlah_sesi_coding}</TableCell>
                      <TableCell>{rekap.jumlah_sesi_non_coding}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(rekap.total_pendapatan_sesi)}
                      </TableCell>
                      {hasPermission("mengelola gaji") && (
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateGaji(rekap.id)}
                            disabled={isGeneratingGaji === rekap.id || isGeneratingGaji === -1}
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            {isGeneratingGaji === rekap.id ? "Generating..." : "Generate Gaji"}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Rekap Bulanan</DialogTitle>
                <DialogDescription>
                  Generate rekap bulanan untuk semua karyawan aktif pada periode tertentu.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="periode">Periode (YYYY-MM)</Label>
                  <Input
                    id="periode"
                    type="month"
                    value={periodeInput}
                    onChange={(e) => setPeriodeInput(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setGenerateDialogOpen(false)}
                  disabled={isGenerating}
                >
                  Batal
                </Button>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

