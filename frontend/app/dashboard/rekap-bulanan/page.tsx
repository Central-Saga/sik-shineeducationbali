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
import { generateGajiFromRekap } from "@/lib/api/gaji";
import { useAuth } from "@/hooks/use-auth";
import { HasCan } from "@/components/has-can";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Plus, DollarSign, Printer, Download, AlertTriangle, Search } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

function formatMonth(date: Date | undefined): string {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

function parseMonth(monthString: string): Date | undefined {
  if (!monthString || !monthString.match(/^\d{4}-\d{2}$/)) {
    return undefined;
  }
  const [year, month] = monthString.split("-");
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
}

export default function RekapBulananPage() {
  const [periodeFilter, setPeriodeFilter] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [generateDialogOpen, setGenerateDialogOpen] = React.useState(false);
  const [periodeInput, setPeriodeInput] = React.useState<string>(
    format(new Date(), "yyyy-MM")
  );
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isGeneratingGaji, setIsGeneratingGaji] = React.useState<number | null>(null);
  const [hasGeneratedRekap, setHasGeneratedRekap] = React.useState<boolean>(false);

  // Date picker state for periode filter
  const [periodeFilterPickerOpen, setPeriodeFilterPickerOpen] = React.useState(false);
  const [periodeFilterDate, setPeriodeFilterDate] = React.useState<Date | undefined>(() => {
    return periodeFilter ? parseMonth(periodeFilter) : undefined;
  });
  const [periodeFilterMonth, setPeriodeFilterMonth] = React.useState<Date | undefined>(periodeFilterDate || new Date());
  const [periodeFilterValue, setPeriodeFilterValue] = React.useState(() => formatMonth(periodeFilterDate));

  // Date picker state for periode input in dialog
  const [periodeInputPickerOpen, setPeriodeInputPickerOpen] = React.useState(false);
  const [periodeInputDate, setPeriodeInputDate] = React.useState<Date | undefined>(() => {
    return periodeInput ? parseMonth(periodeInput) : new Date();
  });
  const [periodeInputMonth, setPeriodeInputMonth] = React.useState<Date | undefined>(periodeInputDate);
  const [periodeInputValue, setPeriodeInputValue] = React.useState(() => formatMonth(periodeInputDate));

  // Sync periodeFilter with date picker
  React.useEffect(() => {
    if (periodeFilter) {
      const newDate = parseMonth(periodeFilter);
      if (newDate) {
        setPeriodeFilterDate(newDate);
        setPeriodeFilterMonth(newDate);
        setPeriodeFilterValue(formatMonth(newDate));
      }
    } else {
      setPeriodeFilterDate(undefined);
      setPeriodeFilterValue("");
    }
  }, [periodeFilter]);

  // Sync periodeInput with date picker
  React.useEffect(() => {
    if (periodeInput) {
      const newDate = parseMonth(periodeInput);
      if (newDate) {
        setPeriodeInputDate(newDate);
        setPeriodeInputMonth(newDate);
        setPeriodeInputValue(formatMonth(newDate));
      }
    }
  }, [periodeInput]);

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
  const { hasPermission, hasRole } = useAuth();

  // Filter rekap bulanan berdasarkan search query
  const filteredRekapBulanan = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return rekapBulanan;
    }
    const query = searchQuery.toLowerCase();
    return rekapBulanan.filter((rekap) =>
      rekap.employee?.user?.name?.toLowerCase().includes(query)
    );
  }, [rekapBulanan, searchQuery]);

  // Fetch gaji untuk periode yang sedang difilter untuk validasi
  const gajiParams = React.useMemo(() => {
    if (periodeFilter) {
      return { periode: periodeFilter };
    }
    return undefined;
  }, [periodeFilter]);

  const { gaji: gajiList } = useGaji(gajiParams);

  // Check if there are any gaji with status 'disetujui' or 'dibayar' for this periode
  const hasFinalGaji = React.useMemo(() => {
    if (!periodeFilter || gajiList.length === 0) {
      return false;
    }
    return gajiList.some((g) => g.status === 'disetujui' || g.status === 'dibayar');
  }, [gajiList, periodeFilter]);

  // Fetch gaji untuk periode yang diinput di dialog untuk validasi
  const gajiInputParams = React.useMemo(() => {
    if (periodeInput && periodeInput.match(/^\d{4}-\d{2}$/)) {
      return { periode: periodeInput };
    }
    return undefined;
  }, [periodeInput]);

  const { gaji: gajiInputList } = useGaji(gajiInputParams);

  // Check if there are any gaji with status 'disetujui' or 'dibayar' for periodeInput
  const hasFinalGajiForInput = React.useMemo(() => {
    if (!periodeInput || !periodeInput.match(/^\d{4}-\d{2}$/) || gajiInputList.length === 0) {
      return false;
    }
    return gajiInputList.some((g) => g.status === 'disetujui' || g.status === 'dibayar');
  }, [gajiInputList, periodeInput]);

  // Auto-detect jika rekap sudah ada untuk periode yang dipilih
  // Reset hasGeneratedRekap ketika periode filter berubah
  React.useEffect(() => {
    if (!periodeFilter) {
      setHasGeneratedRekap(false);
    } else if (!loading) {
      // Setelah loading selesai, cek apakah ada data rekap
      if (rekapBulanan.length > 0) {
        setHasGeneratedRekap(true);
      } else {
        setHasGeneratedRekap(false);
      }
    }
  }, [periodeFilter, rekapBulanan.length, loading]);

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
      setHasGeneratedRekap(true);
    } catch (err: any) {
      toast.error(err.message || "Gagal generate rekap bulanan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAllGaji = async () => {
    if (filteredRekapBulanan.length === 0) {
      toast.error("Tidak ada rekap bulanan untuk di-generate");
      return;
    }

    try {
      setIsGeneratingGaji(-1); // Use -1 to indicate "all"
      let successCount = 0;
      let errorCount = 0;

      for (const rekap of filteredRekapBulanan) {
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
    if (filteredRekapBulanan.length === 0) {
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
      ...filteredRekapBulanan.map((rekap) =>
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
    if (filteredRekapBulanan.length === 0) {
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
            <p><strong>Jumlah Data:</strong> ${filteredRekapBulanan.length}</p>
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
              ${filteredRekapBulanan
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
                  disabled={filteredRekapBulanan.length === 0}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Cetak Laporan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportToCSV}
                    disabled={filteredRekapBulanan.length === 0}
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
                  disabled={
                    filteredRekapBulanan.length === 0 ||
                    !hasGeneratedRekap ||
                    !periodeFilter ||
                    isGeneratingGaji === -1 ||
                    hasFinalGaji
                  }
                  title={hasFinalGaji ? "Tidak dapat generate gaji karena sudah ada gaji yang disetujui atau dibayar untuk periode ini" : ""}
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
              <div className="relative flex gap-2">
                <Input
                  placeholder="Filter periode (YYYY-MM)"
                  value={periodeFilterValue}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setPeriodeFilterValue(inputValue);
                    // Try to parse if user types YYYY-MM format
                    const parsed = parseMonth(inputValue);
                    if (parsed) {
                      setPeriodeFilterDate(parsed);
                      setPeriodeFilterMonth(parsed);
                      const year = parsed.getFullYear();
                      const month = String(parsed.getMonth() + 1).padStart(2, '0');
                      setPeriodeFilter(`${year}-${month}`);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setPeriodeFilterPickerOpen(true);
                    }
                  }}
                  className="bg-background pr-10"
                />
                <Popover open={periodeFilterPickerOpen} onOpenChange={setPeriodeFilterPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      type="button"
                      className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                    >
                      <CalendarIcon className="size-3.5" />
                      <span className="sr-only">Pilih periode</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                    alignOffset={-8}
                    sideOffset={10}
                  >
                    <Calendar
                      mode="single"
                      selected={periodeFilterDate}
                      captionLayout="dropdown"
                      fromYear={2020}
                      toYear={2030}
                      month={periodeFilterMonth}
                      onMonthChange={setPeriodeFilterMonth}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          setPeriodeFilterDate(selectedDate);
                          setPeriodeFilterMonth(selectedDate);
                          setPeriodeFilterValue(formatMonth(selectedDate));
                          setPeriodeFilterPickerOpen(false);
                          const year = selectedDate.getFullYear();
                          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                          setPeriodeFilter(`${year}-${month}`);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {!hasRole('Karyawan') && (
              <div className="relative w-[250px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari nama karyawan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p>Memuat data...</p>
            </div>
          ) : filteredRekapBulanan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery.trim() 
                  ? "Tidak ada rekap bulanan yang sesuai dengan pencarian."
                  : "Belum ada rekap bulanan. Klik \"Generate Rekap\" untuk membuat rekap baru."}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRekapBulanan.map((rekap) => (
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
                  <div className="relative flex gap-2 max-w-xs">
                    <Input
                      id="periode"
                      value={periodeInputValue}
                      placeholder="Pilih periode"
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setPeriodeInputValue(inputValue);
                        // Try to parse if user types YYYY-MM format
                        const parsed = parseMonth(inputValue);
                        if (parsed) {
                          setPeriodeInputDate(parsed);
                          setPeriodeInputMonth(parsed);
                          const year = parsed.getFullYear();
                          const month = String(parsed.getMonth() + 1).padStart(2, '0');
                          setPeriodeInput(`${year}-${month}`);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setPeriodeInputPickerOpen(true);
                        }
                      }}
                      className={cn("bg-background pr-10")}
                    />
                    <Popover open={periodeInputPickerOpen} onOpenChange={setPeriodeInputPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="periode-picker"
                          variant="ghost"
                          type="button"
                          className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                        >
                          <CalendarIcon className="size-3.5" />
                          <span className="sr-only">Pilih periode</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="end"
                        alignOffset={-8}
                        sideOffset={10}
                      >
                        <Calendar
                          mode="single"
                          selected={periodeInputDate}
                          captionLayout="dropdown"
                          fromYear={2020}
                          toYear={2030}
                          month={periodeInputMonth}
                          onMonthChange={setPeriodeInputMonth}
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              setPeriodeInputDate(selectedDate);
                              setPeriodeInputMonth(selectedDate);
                              setPeriodeInputValue(formatMonth(selectedDate));
                              setPeriodeInputPickerOpen(false);
                              const year = selectedDate.getFullYear();
                              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                              setPeriodeInput(`${year}-${month}`);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {hasFinalGajiForInput && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Tidak dapat generate rekap bulanan untuk periode ini karena sudah ada gaji yang disetujui atau dibayar. Generate ulang akan menyebabkan inkonsistensi data.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setGenerateDialogOpen(false)}
                  disabled={isGenerating}
                >
                  Batal
                </Button>
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || hasFinalGajiForInput}
                  title={hasFinalGajiForInput ? "Tidak dapat generate karena sudah ada gaji yang disetujui atau dibayar untuk periode ini" : ""}
                >
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

