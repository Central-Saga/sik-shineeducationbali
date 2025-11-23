"use client";

import * as React from "react";
import { useParams } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { usePembayaranGaji } from "@/hooks/use-pembayaran-gaji";
import { HasCan } from "@/components/has-can";
import type { PembayaranGaji, PembayaranGajiFormData, StatusPembayaran } from "@/lib/types/gaji";

export default function GajiDetailPage() {
  const params = useParams();
  const gajiId = params.id as string;
  const [gaji, setGaji] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { komponenGaji: komponenGajiFromHook, loading: loadingKomponen } = useKomponenGaji(gajiId);
  const { 
    pembayaranGaji: pembayaranGajiFromHook, 
    loading: loadingPembayaran,
    create: createPembayaran,
    update: updatePembayaran,
    updateStatus: updatePembayaranStatus,
    remove: deletePembayaran,
    refetch: refetchPembayaran,
  } = usePembayaranGaji(gajiId);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingPembayaran, setEditingPembayaran] = React.useState<PembayaranGaji | null>(null);
  const [formData, setFormData] = React.useState<PembayaranGajiFormData>({
    tanggal_transfer: new Date().toISOString().split('T')[0],
    status_pembayaran: 'menunggu',
    bukti_transfer: '',
    catatan: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Use komponenGaji from gaji object if available, otherwise use hook
  const komponenGaji = gaji?.komponen_gaji && gaji.komponen_gaji.length > 0 
    ? gaji.komponen_gaji 
    : komponenGajiFromHook;
  const pembayaranGaji = gaji?.pembayaran_gaji && gaji.pembayaran_gaji.length > 0
    ? gaji.pembayaran_gaji
    : pembayaranGajiFromHook;

  React.useEffect(() => {
    if (!gajiId) return;
    
    const loadGaji = async () => {
      try {
        setLoading(true);
        const data = await getGajiById(gajiId);
        setGaji(data);
      } catch (err: any) {
        toast.error(err.message || "Gagal memuat data gaji");
        setGaji(null);
      } finally {
        setLoading(false);
      }
    };
    loadGaji();
  }, [gajiId]);

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

  const getStatusPembayaranLabel = (status: string) => {
    switch (status) {
      case "menunggu":
        return "Menunggu";
      case "berhasil":
        return "Berhasil";
      case "gagal":
        return "Gagal";
      default:
        return status;
    }
  };

  const getStatusPembayaranVariant = (status: string) => {
    switch (status) {
      case "menunggu":
        return "secondary";
      case "berhasil":
        return "default";
      case "gagal":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleOpenDialog = (pembayaran?: PembayaranGaji) => {
    if (pembayaran) {
      setEditingPembayaran(pembayaran);
      setFormData({
        tanggal_transfer: pembayaran.tanggal_transfer.split('T')[0],
        status_pembayaran: pembayaran.status_pembayaran,
        bukti_transfer: pembayaran.bukti_transfer || '',
        catatan: pembayaran.catatan || '',
      });
    } else {
      setEditingPembayaran(null);
      setFormData({
        tanggal_transfer: new Date().toISOString().split('T')[0],
        status_pembayaran: 'menunggu',
        bukti_transfer: '',
        catatan: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPembayaran(null);
    setFormData({
      tanggal_transfer: new Date().toISOString().split('T')[0],
      status_pembayaran: 'menunggu',
      bukti_transfer: '',
      catatan: '',
    });
  };

  const handleSubmitPembayaran = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingPembayaran) {
        await updatePembayaran(editingPembayaran.id, formData);
        toast.success("Pembayaran gaji berhasil diperbarui");
      } else {
        await createPembayaran(formData);
        toast.success("Pembayaran gaji berhasil dibuat");
      }
      handleCloseDialog();
      await refetchPembayaran();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan pembayaran gaji");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: StatusPembayaran) => {
    try {
      await updatePembayaranStatus(id, status);
      toast.success(`Status pembayaran berhasil diubah menjadi ${getStatusPembayaranLabel(status)}`);
      await refetchPembayaran();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengupdate status pembayaran");
    }
  };

  const handleDeletePembayaran = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pembayaran ini?")) {
      return;
    }

    try {
      await deletePembayaran(id);
      toast.success("Pembayaran gaji berhasil dihapus");
      await refetchPembayaran();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus pembayaran gaji");
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
              <CardTitle>Rincian Perhitungan</CardTitle>
              <CardDescription>
                Detail perhitungan gaji untuk periode {gaji.periode}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingKomponen ? (
                <p>Memuat rincian...</p>
              ) : komponenGaji.length === 0 ? (
                <p className="text-muted-foreground">Tidak ada rincian perhitungan</p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Penghasilan:</h4>
                    <div className="pl-4 space-y-1">
                      {komponenGaji
                        .filter((k) => k.nominal > 0)
                        .map((komponen) => (
                          <div key={komponen.id} className="flex justify-between">
                            <span className="text-sm">{komponen.nama_komponen}</span>
                            <span className="text-sm font-medium">
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              }).format(komponen.nominal)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  {komponenGaji.some((k) => k.nominal < 0) && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Potongan:</h4>
                      <div className="pl-4 space-y-1">
                        {komponenGaji
                          .filter((k) => k.nominal < 0)
                          .map((komponen) => (
                            <div key={komponen.id} className="flex justify-between">
                              <span className="text-sm">{komponen.nama_komponen}</span>
                              <span className="text-sm font-medium text-destructive">
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                }).format(komponen.nominal)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total Gaji:</span>
                      <span className="font-bold text-lg">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(gaji.total_gaji)}
                      </span>
                    </div>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="text-sm font-mono">
                        <span className="font-semibold">Rumus:</span>{" "}
                        {(() => {
                          const penghasilan = komponenGaji
                            .filter((k) => k.nominal > 0)
                            .reduce((sum, k) => sum + k.nominal, 0);
                          const potongan = komponenGaji
                            .filter((k) => k.nominal < 0)
                            .reduce((sum, k) => sum + Math.abs(k.nominal), 0);
                          
                          const parts: string[] = [];
                          if (penghasilan > 0) {
                            parts.push(
                              new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              }).format(penghasilan)
                            );
                          }
                          if (potongan > 0) {
                            parts.push(
                              new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              }).format(potongan)
                            );
                          }
                          
                          return parts.join(" - ");
                        })()}
                        {" = "}
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(gaji.total_gaji)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {gaji.detail_lembur && gaji.detail_lembur.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detail Lembur Sesi</CardTitle>
                <CardDescription>
                  Rincian sesi lembur yang dihitung untuk periode {gaji.periode}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground mb-4">
                    Total: {gaji.detail_lembur.length} sesi lembur
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Mata Pelajaran</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-right">Tarif</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gaji.detail_lembur.map((lembur: any) => (
                        <TableRow key={lembur.id}>
                          <TableCell>
                            {new Date(lembur.tanggal).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            {lembur.sesi_kerja?.mata_pelajaran || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {lembur.sesi_kerja?.kategori || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(lembur.sesi_kerja?.tarif || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <tfoot>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">
                          Total Lembur:
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(
                            gaji.detail_lembur.reduce(
                              (sum: number, lembur: any) =>
                                sum + (lembur.sesi_kerja?.tarif || 0),
                              0
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    </tfoot>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pembayaran Gaji</CardTitle>
                  <CardDescription>
                    Daftar pembayaran gaji untuk periode {gaji.periode}
                  </CardDescription>
                </div>
                <HasCan permission="mengelola pembayaran gaji">
                  <Button onClick={() => handleOpenDialog()} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Pembayaran
                  </Button>
                </HasCan>
              </div>
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
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pembayaranGaji.map((pembayaran) => (
                      <TableRow key={pembayaran.id}>
                        <TableCell>
                          {new Date(pembayaran.tanggal_transfer).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusPembayaranVariant(pembayaran.status_pembayaran)}>
                            {getStatusPembayaranLabel(pembayaran.status_pembayaran)}
                          </Badge>
                        </TableCell>
                        <TableCell>{pembayaran.bukti_transfer || "-"}</TableCell>
                        <TableCell>{pembayaran.catatan || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <HasCan permission="mengelola pembayaran gaji">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDialog(pembayaran)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {pembayaran.status_pembayaran !== 'berhasil' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(pembayaran.id, 'berhasil')}
                                  title="Tandai sebagai Berhasil"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              {pembayaran.status_pembayaran !== 'gagal' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(pembayaran.id, 'gagal')}
                                  title="Tandai sebagai Gagal"
                                >
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePembayaran(pembayaran.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </HasCan>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Dialog Form Pembayaran Gaji */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPembayaran ? "Edit Pembayaran Gaji" : "Tambah Pembayaran Gaji"}
                </DialogTitle>
                <DialogDescription>
                  {editingPembayaran
                    ? "Ubah informasi pembayaran gaji"
                    : "Tambahkan pembayaran gaji baru untuk periode ini"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitPembayaran}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="tanggal_transfer">Tanggal Transfer *</Label>
                    <Input
                      id="tanggal_transfer"
                      type="date"
                      value={formData.tanggal_transfer}
                      onChange={(e) =>
                        setFormData({ ...formData, tanggal_transfer: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status_pembayaran">Status Pembayaran</Label>
                    <Select
                      value={formData.status_pembayaran}
                      onValueChange={(value: StatusPembayaran) =>
                        setFormData({ ...formData, status_pembayaran: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="menunggu">Menunggu</SelectItem>
                        <SelectItem value="berhasil">Berhasil</SelectItem>
                        <SelectItem value="gagal">Gagal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bukti_transfer">Bukti Transfer</Label>
                    <Input
                      id="bukti_transfer"
                      type="text"
                      placeholder="URL atau nomor referensi bukti transfer"
                      value={formData.bukti_transfer || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, bukti_transfer: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="catatan">Catatan</Label>
                    <Textarea
                      id="catatan"
                      placeholder="Catatan tambahan (opsional)"
                      value={formData.catatan || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, catatan: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Menyimpan..."
                      : editingPembayaran
                      ? "Simpan Perubahan"
                      : "Tambah Pembayaran"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

