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
import { toast } from "sonner";
import { Calendar, Plus, DollarSign } from "lucide-react";
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
              <Button
                variant="outline"
                onClick={handleGenerateAllGaji}
                disabled={rekapBulanan.length === 0 || isGeneratingGaji === -1}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                {isGeneratingGaji === -1 ? "Generating..." : "Generate Semua Gaji"}
              </Button>
              <Button onClick={() => setGenerateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Generate Rekap
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
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
                    <TableHead>Aksi</TableHead>
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

