"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AbsensiFormData } from "@/lib/types/absensi";
import type { Employee } from "@/lib/types/employee";
import { getEmployees } from "@/lib/api/employees";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { MapPin, Camera, Loader2 } from "lucide-react";

interface AbsensiFormProps {
  initialData?: Partial<AbsensiFormData> & {
    id?: number;
  };
  onSubmit: (data: AbsensiFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  className?: string;
  isEditing?: boolean;
  enableCheckInOut?: boolean; // Enable check-in/check-out mode for karyawan
}

export function AbsensiForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Simpan Absensi",
  className,
  isEditing = false,
  enableCheckInOut = false,
}: AbsensiFormProps) {
  const { user, hasRole } = useAuth();
  const [mode, setMode] = React.useState<'absensi' | 'check_in' | 'check_out'>('absensi');
  const [formData, setFormData] = React.useState<AbsensiFormData>({
    karyawan_id: initialData?.karyawan_id || 0,
    tanggal: initialData?.tanggal || new Date().toISOString().split('T')[0],
    status_kehadiran: initialData?.status_kehadiran || "hadir",
    jam_masuk: initialData?.jam_masuk || null,
    jam_pulang: initialData?.jam_pulang || null,
    sumber_absen: initialData?.sumber_absen || null,
    catatan: initialData?.catatan || null,
  });

  // Check-in/Check-out specific state
  const [location, setLocation] = React.useState<{
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
  }>({
    latitude: null,
    longitude: null,
    accuracy: null,
  });
  const [locationFetched, setLocationFetched] = React.useState(false);
  const [fetchingLocation, setFetchingLocation] = React.useState(false);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);

  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Auto-fill karyawan_id if user is karyawan - memoize to prevent unnecessary calls
  React.useEffect(() => {
    if (enableCheckInOut && hasRole('Karyawan') && user?.id && formData.karyawan_id === 0) {
      // Find employee by user_id
      const loadEmployee = async () => {
        try {
          setLoadingEmployees(true);
          const data = await getEmployees();
          const employee = data.find(emp => emp.user_id === user.id);
          if (employee) {
            setFormData(prev => ({ ...prev, karyawan_id: employee.id }));
          }
          setEmployees(data);
        } catch (error) {
          console.error("Failed to load employees:", error);
        } finally {
          setLoadingEmployees(false);
        }
      };
      loadEmployee();
    } else if (!enableCheckInOut || !hasRole('Karyawan')) {
      // Load all employees for admin/owner - only if not already loaded
      if (employees.length === 0) {
        const loadEmployees = async () => {
          try {
            setLoadingEmployees(true);
            const data = await getEmployees();
            setEmployees(data);
          } catch (error) {
            console.error("Failed to load employees:", error);
          } finally {
            setLoadingEmployees(false);
          }
        };
        loadEmployees();
      }
    }
  }, [enableCheckInOut, hasRole, user?.id, formData.karyawan_id, employees.length]);

  // Handle get location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, location: "Geolocation tidak didukung oleh browser Anda." }));
      return;
    }

    setFetchingLocation(true);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.location;
      return newErrors;
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        });
        setLocationFetched(true);
        setFetchingLocation(false);
      },
      (error) => {
        setErrors(prev => ({ 
          ...prev, 
          location: `Gagal mengambil lokasi: ${error.message}` 
        }));
        setFetchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, photo: "File harus berupa gambar." }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: "Ukuran file maksimal 5MB." }));
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.photo;
        return newErrors;
      });
    }
  };

  const handleChange = (field: keyof AbsensiFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Client-side validation
    const newErrors: Record<string, string> = {};

    if (!formData.karyawan_id || formData.karyawan_id === 0) {
      newErrors.karyawan_id = "Karyawan wajib dipilih.";
    }
    if (!formData.tanggal || !formData.tanggal.trim()) {
      newErrors.tanggal = "Tanggal wajib diisi.";
    }
    
    // For check-in mode, location is required before photo
    if (mode === 'check_in') {
      if (!locationFetched || !location.latitude || !location.longitude) {
        newErrors.location = "Lokasi harus diambil terlebih dahulu sebelum upload foto.";
      }
      if (!photoFile) {
        newErrors.photo = "Foto wajib diupload untuk check-in.";
      }
    }

    // For check-out mode, photo is optional but location is recommended
    if (mode === 'check_out') {
      // Location and photo are optional for check-out
    }

    // For regular absensi mode
    if (mode === 'absensi' && !formData.status_kehadiran) {
      newErrors.status_kehadiran = "Status kehadiran wajib dipilih.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Failed to submit form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Mode Selector for Check-in/Check-out */}
      {enableCheckInOut && hasRole('Karyawan') && (
        <Card>
          <CardHeader>
            <CardTitle>Mode Absensi</CardTitle>
            <CardDescription>
              Pilih mode absensi yang ingin Anda lakukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'absensi' | 'check_in' | 'check_out')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="absensi">Absensi Manual</TabsTrigger>
                <TabsTrigger value="check_in">Check In</TabsTrigger>
                <TabsTrigger value="check_out">Check Out</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Informasi Absensi */}
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'check_in' ? 'Check In' : mode === 'check_out' ? 'Check Out' : 'Informasi Absensi'}
          </CardTitle>
          <CardDescription>
            {mode === 'check_in' 
              ? 'Lakukan check-in dengan mengambil lokasi dan upload foto'
              : mode === 'check_out'
              ? 'Lakukan check-out dengan upload foto (opsional ambil lokasi)'
              : 'Masukkan informasi absensi karyawan'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Karyawan */}
          <div className="space-y-2">
            <Label htmlFor="karyawan_id">
              Karyawan <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.karyawan_id?.toString() || ""}
              onValueChange={(value) => handleChange("karyawan_id", parseInt(value))}
              disabled={isSubmitting || isLoading || loadingEmployees || (enableCheckInOut && hasRole('Karyawan'))}
            >
              <SelectTrigger
                id="karyawan_id"
                aria-invalid={!!errors.karyawan_id}
              >
                <SelectValue placeholder="Pilih karyawan" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem
                    key={employee.id}
                    value={employee.id.toString()}
                  >
                    {employee.user?.name || employee.kode_karyawan || `ID: ${employee.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.karyawan_id && (
              <p className="text-sm text-destructive">{errors.karyawan_id}</p>
            )}
          </div>

          {/* Tanggal */}
          <div className="space-y-2">
            <Label htmlFor="tanggal">
              Tanggal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tanggal"
              type="date"
              value={formData.tanggal}
              onChange={(e) => handleChange("tanggal", e.target.value)}
              aria-invalid={!!errors.tanggal}
              disabled={isSubmitting || isLoading}
            />
            {errors.tanggal && (
              <p className="text-sm text-destructive">{errors.tanggal}</p>
            )}
          </div>

          {/* Status Kehadiran */}
          <div className="space-y-2">
            <Label htmlFor="status_kehadiran">
              Status Kehadiran <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.status_kehadiran}
              onValueChange={(value: 'hadir' | 'izin') => handleChange("status_kehadiran", value)}
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger
                id="status_kehadiran"
                aria-invalid={!!errors.status_kehadiran}
              >
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hadir">Hadir</SelectItem>
                <SelectItem value="izin">Izin</SelectItem>
              </SelectContent>
            </Select>
            {errors.status_kehadiran && (
              <p className="text-sm text-destructive">{errors.status_kehadiran}</p>
            )}
          </div>

          {/* Jam Masuk */}
          <div className="space-y-2">
            <Label htmlFor="jam_masuk">Jam Masuk</Label>
            <Input
              id="jam_masuk"
              type="time"
              value={formData.jam_masuk || ""}
              onChange={(e) => handleChange("jam_masuk", e.target.value || null)}
              disabled={isSubmitting || isLoading}
            />
          </div>

          {/* Jam Pulang */}
          <div className="space-y-2">
            <Label htmlFor="jam_pulang">Jam Pulang</Label>
            <Input
              id="jam_pulang"
              type="time"
              value={formData.jam_pulang || ""}
              onChange={(e) => handleChange("jam_pulang", e.target.value || null)}
              disabled={isSubmitting || isLoading}
            />
          </div>

          {/* Sumber Absen */}
          <div className="space-y-2">
            <Label htmlFor="sumber_absen">Sumber Absen</Label>
            <Select
              value={formData.sumber_absen || ""}
              onValueChange={(value: 'mobile' | 'web' | null) => handleChange("sumber_absen", value || null)}
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger id="sumber_absen">
                <SelectValue placeholder="Pilih sumber" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="web">Web</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan</Label>
            <textarea
              id="catatan"
              value={formData.catatan || ""}
              onChange={(e) => handleChange("catatan", e.target.value || null)}
              placeholder="Masukkan catatan (opsional)"
              rows={3}
              disabled={isSubmitting || isLoading}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Location and Photo for Check-in/Check-out */}
          {(mode === 'check_in' || mode === 'check_out') && (
            <>
              {/* Lokasi */}
              <div className="space-y-2">
                <Label>
                  Lokasi <span className="text-destructive">*</span> {mode === 'check_in' && '(Wajib untuk Check In)'}
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    disabled={fetchingLocation || isSubmitting || isLoading}
                    className="flex items-center gap-2"
                  >
                    {fetchingLocation ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Mengambil...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4" />
                        Ambil Lokasi Saya
                      </>
                    )}
                  </Button>
                  {locationFetched && location.latitude && location.longitude && (
                    <div className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      <div className="font-medium">Lokasi berhasil diambil</div>
                      <div className="text-xs text-muted-foreground">
                        Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                        {location.accuracy && ` (Akurasi: ±${location.accuracy}m)`}
                      </div>
                    </div>
                  )}
                </div>
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}
              </div>

              {/* Foto */}
              <div className="space-y-2">
                <Label htmlFor="photo">
                  Foto Selfie <span className="text-destructive">*</span> {mode === 'check_in' && '(Wajib untuk Check In)'}
                </Label>
                <div className="space-y-2">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={isSubmitting || isLoading || (mode === 'check_in' && !locationFetched)}
                    className="cursor-pointer"
                  />
                  {mode === 'check_in' && !locationFetched && (
                    <p className="text-xs text-muted-foreground">
                      Silakan ambil lokasi terlebih dahulu sebelum upload foto
                    </p>
                  )}
                  {photoPreview && (
                    <div className="relative w-full max-w-xs">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="rounded-md border border-input"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }}
                        className="absolute top-2 right-2"
                      >
                        Hapus
                      </Button>
                    </div>
                  )}
                </div>
                {errors.photo && (
                  <p className="text-sm text-destructive">{errors.photo}</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Batal
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

