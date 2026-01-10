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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AbsensiFormData } from "@/lib/types/absensi";
import type { Employee } from "@/lib/types/employee";
import { getMyEmployee } from "@/lib/api/employees";
import { getAbsensiByKaryawanAndTanggal } from "@/lib/api/absensi";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { MapPin, Loader2, AlertCircle, CalendarIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Koordinat SHINE EDUCATION BALI
// Koordinat SHINE EDUCATION BALI: -8.5210302, 115.1380711
const SHINE_EDUCATION_BALI_LAT = -8.5210302;
const SHINE_EDUCATION_BALI_LON = 115.1380711;
const MAX_RADIUS_METERS = 100;

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

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

// Fungsi untuk menghitung jarak menggunakan Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radius bumi dalam meter
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Jarak dalam meter
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
  const [mode, setMode] = React.useState<'check_in' | 'check_out'>('check_in');
  
  // State untuk lokasi dan jarak
  const [location, setLocation] = React.useState<{
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    distance?: number | null;
  }>({
    latitude: null,
    longitude: null,
    accuracy: null,
    distance: null,
  });
  const [locationFetched, setLocationFetched] = React.useState(false);
  const [fetchingLocation, setFetchingLocation] = React.useState(false);
  const [showManualInput, setShowManualInput] = React.useState(false);
  const [manualLat, setManualLat] = React.useState<string>('');
  const [manualLon, setManualLon] = React.useState<string>('');
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);

  const [employee, setEmployee] = React.useState<Employee | null>(null);
  const [loadingEmployee, setLoadingEmployee] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Date picker state for tanggal (read-only, today's date)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [tanggalDate] = React.useState<Date>(today);
  const tanggalValue = formatDate(tanggalDate);

  // Auto-fill karyawan_id dari user yang login
  React.useEffect(() => {
    if (enableCheckInOut && hasRole('Karyawan') && user?.id) {
      const loadEmployee = async () => {
        try {
          setLoadingEmployee(true);
          const employeeData = await getMyEmployee();
          if (employeeData) {
            setEmployee(employeeData);
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.employee;
              return newErrors;
            });
          } else {
            setErrors(prev => ({ ...prev, employee: "Data karyawan tidak ditemukan untuk user ini." }));
          }
        } catch (error: unknown) {
          console.error("Failed to load employee:", error);
          const errorMessage = error instanceof Error ? error.message : "Gagal memuat data karyawan.";
          setErrors(prev => ({ ...prev, employee: errorMessage }));
        } finally {
          setLoadingEmployee(false);
        }
      };
      loadEmployee();
    }
  }, [enableCheckInOut, hasRole, user?.id]);

  // Auto-update jam saat mode berubah
  React.useEffect(() => {
    if (enableCheckInOut && mode) {
      const now = new Date();
      const timeString = now.toTimeString().slice(0, 8); // HH:MM:SS format
      // Mode sudah di-handle di handleSubmit
    }
  }, [mode, enableCheckInOut]);

  // Handle get location
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ 
        ...prev, 
        location: "Geolocation tidak didukung oleh browser Anda. Silakan gunakan browser yang lebih baru atau aktifkan fitur geolocation." 
      }));
      return;
    }

    setFetchingLocation(true);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.location;
      return newErrors;
    });

    // Check if we're on HTTPS or localhost (required for geolocation)
    const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isSecureContext) {
      setErrors(prev => ({ 
        ...prev, 
        location: "Geolocation memerlukan koneksi HTTPS. Pastikan website diakses melalui HTTPS." 
      }));
      setFetchingLocation(false);
      return;
    }

    // Check permissions if available
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        
        if (permissionStatus.state === 'denied') {
          setErrors(prev => ({ 
            ...prev, 
            location: "Akses lokasi ditolak. Silakan izinkan akses lokasi di pengaturan browser Anda (ikon gembok di address bar) dan refresh halaman." 
          }));
          setFetchingLocation(false);
          return;
        }
      } catch (e) {
        // Permissions API might not be supported, continue anyway
        console.log('Permissions API not fully supported, continuing...');
      }
    }

    // Try with different accuracy levels - laptops usually don't have GPS hardware
    // So we'll try network-based location first (lower accuracy but more reliable for laptops)
    const tryGetLocation = (options: PositionOptions, attempt: number = 1) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy);
          
          // Hitung jarak dari SHINE EDUCATION BALI
          const distance = calculateDistance(SHINE_EDUCATION_BALI_LAT, SHINE_EDUCATION_BALI_LON, lat, lon);
          
          setLocation({
            latitude: lat,
            longitude: lon,
            accuracy: accuracy,
            distance: distance,
          });
          setLocationFetched(true);
          setFetchingLocation(false);

          // Validasi radius di frontend untuk feedback langsung
          if (distance > MAX_RADIUS_METERS) {
            setErrors(prev => ({ 
              ...prev, 
              location: `Jarak Anda ${distance.toFixed(0)} meter dari SHINE EDUCATION BALI. Maksimal ${MAX_RADIUS_METERS} meter.` 
            }));
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.location;
              return newErrors;
            });
          }
        },
        (error) => {
          // Check for kCLErrorLocationUnknown (CoreLocation error on macOS)
          const errorMessage = error.message || '';
          const isLocationUnknown = errorMessage.includes('kCLErrorLocationUnknown') || 
                                   errorMessage.includes('LocationUnknown') ||
                                   error.code === error.POSITION_UNAVAILABLE;

          // Try different strategies based on attempt number
          if (attempt === 1) {
            // First attempt failed, try with network-based location (better for laptops)
            console.log('First attempt failed, trying with network-based location (better for laptops)...');
            tryGetLocation({
              enableHighAccuracy: false, // Use network-based location (WiFi/IP)
              timeout: 30000, // 30 seconds
              maximumAge: 300000, // Accept cached position up to 5 minutes old
            }, 2);
            return;
          } else if (attempt === 2) {
            // Second attempt failed, try with high accuracy (for devices with GPS)
            console.log('Network-based failed, trying with high accuracy GPS...');
            tryGetLocation({
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 0,
            }, 3);
            return;
          }

          // All attempts failed
          let errorMsg = "Gagal mengambil lokasi setelah beberapa percobaan. ";
          
          // Handle kCLErrorLocationUnknown specifically (macOS CoreLocation error)
          if (isLocationUnknown) {
            errorMsg += "Sistem tidak dapat menentukan lokasi Anda. Silakan:\n\n";
            errorMsg += "1. Pastikan WiFi/internet terhubung (lokasi diambil dari jaringan)\n";
            errorMsg += "2. Pastikan Location Services aktif di System Preferences (macOS)\n";
            errorMsg += "3. Pastikan browser memiliki izin akses lokasi\n";
            errorMsg += "4. Coba gunakan fitur 'Input Koordinat Manual' di bawah ini\n";
            errorMsg += "5. Atau coba refresh halaman dan coba lagi\n\n";
            errorMsg += "Catatan: Error ini biasanya terjadi di macOS ketika Location Services tidak bisa mendapatkan lokasi dari WiFi/IP.";
            
            // Auto-show manual input option for location unknown errors
            setShowManualInput(true);
          } else {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMsg += "Akses lokasi ditolak. Silakan:\n";
                errorMsg += "1. Klik ikon gembok/kamera di address bar browser\n";
                errorMsg += "2. Izinkan akses lokasi\n";
                errorMsg += "3. Refresh halaman dan coba lagi\n\n";
                errorMsg += "Catatan: Laptop biasanya menggunakan lokasi berbasis WiFi/IP, bukan GPS hardware.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMsg += "Informasi lokasi tidak tersedia. Silakan:\n";
                errorMsg += "1. Pastikan WiFi/internet terhubung (laptop menggunakan lokasi berbasis jaringan)\n";
                errorMsg += "2. Pastikan browser memiliki izin akses lokasi\n";
                errorMsg += "3. Coba refresh halaman\n";
                errorMsg += "4. Atau gunakan fitur 'Input Koordinat Manual'\n\n";
                errorMsg += "Catatan: Laptop biasanya tidak memiliki GPS hardware. Lokasi diambil dari WiFi/IP address.";
                setShowManualInput(true);
                break;
              case error.TIMEOUT:
                errorMsg += "Waktu tunggu habis. Silakan:\n";
                errorMsg += "1. Pastikan WiFi/internet terhubung\n";
                errorMsg += "2. Coba refresh halaman dan coba lagi\n";
                errorMsg += "3. Atau gunakan fitur 'Input Koordinat Manual'\n\n";
                errorMsg += "Catatan: Laptop menggunakan lokasi berbasis jaringan yang mungkin membutuhkan waktu lebih lama.";
                setShowManualInput(true);
                break;
              default:
                errorMsg += "Terjadi kesalahan saat mengambil lokasi. Silakan:\n";
                errorMsg += "1. Pastikan WiFi/internet terhubung\n";
                errorMsg += "2. Pastikan browser memiliki izin akses lokasi\n";
                errorMsg += "3. Coba refresh halaman\n";
                errorMsg += "4. Atau gunakan fitur 'Input Koordinat Manual'\n";
                errorMsg += "5. Jika masih error, coba gunakan browser lain\n\n";
                errorMsg += "Catatan: Laptop biasanya menggunakan lokasi berbasis WiFi/IP, bukan GPS hardware.";
                setShowManualInput(true);
                break;
            }
          }
          
          setErrors(prev => ({ 
            ...prev, 
            location: errorMsg
          }));
          setFetchingLocation(false);
        },
        options
      );
    };

    // Start with network-based location first (better for laptops without GPS hardware)
    // Laptops typically use WiFi/IP-based location which is more reliable than GPS
    tryGetLocation({
      enableHighAccuracy: false, // Start with network-based (WiFi/IP) - better for laptops
      timeout: 30000, // 30 seconds
      maximumAge: 300000, // Accept cached position up to 5 minutes old
    });
  };

  // Handle manual location input
  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);

    if (isNaN(lat) || isNaN(lon)) {
      setErrors(prev => ({ ...prev, location: "Latitude dan Longitude harus berupa angka." }));
      return;
    }

    if (lat < -90 || lat > 90) {
      setErrors(prev => ({ ...prev, location: "Latitude harus antara -90 dan 90." }));
      return;
    }

    if (lon < -180 || lon > 180) {
      setErrors(prev => ({ ...prev, location: "Longitude harus antara -180 dan 180." }));
      return;
    }

    // Hitung jarak dari SHINE EDUCATION BALI
    const distance = calculateDistance(SHINE_EDUCATION_BALI_LAT, SHINE_EDUCATION_BALI_LON, lat, lon);

    setLocation({
      latitude: lat,
      longitude: lon,
      accuracy: null,
      distance: distance,
    });
    setLocationFetched(true);
    setShowManualInput(false);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.location;
      return newErrors;
    });

    // Validasi radius
    if (distance > MAX_RADIUS_METERS) {
      setErrors(prev => ({ 
        ...prev, 
        location: `Jarak Anda ${distance.toFixed(0)} meter dari SHINE EDUCATION BALI. Maksimal ${MAX_RADIUS_METERS} meter.` 
      }));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Client-side validation
    const newErrors: Record<string, string> = {};

    if (!employee) {
      newErrors.employee = "Data karyawan tidak ditemukan.";
    }

    // Untuk check-in, lokasi dan foto wajib
    if (mode === 'check_in') {
      if (!locationFetched || !location.latitude || !location.longitude) {
        newErrors.location = "Lokasi wajib diambil terlebih dahulu sebelum upload foto.";
      } else if (location.distance !== null && location.distance !== undefined && location.distance > MAX_RADIUS_METERS) {
        newErrors.location = `Jarak Anda ${location.distance.toFixed(0)} meter dari SHINE EDUCATION BALI. Maksimal ${MAX_RADIUS_METERS} meter.`;
      }
      if (!photoFile) {
        newErrors.photo = "Foto wajib diupload untuk check-in.";
      }
    }

    // Untuk check-out, foto wajib, lokasi opsional
    if (mode === 'check_out') {
      if (!photoFile) {
        newErrors.photo = "Foto wajib diupload untuk check-out.";
      }
      // Jika lokasi diambil, validasi radius
      if (locationFetched && location.distance !== null && location.distance !== undefined && location.distance > MAX_RADIUS_METERS) {
        newErrors.location = `Jarak Anda ${location.distance.toFixed(0)} meter dari SHINE EDUCATION BALI. Maksimal ${MAX_RADIUS_METERS} meter.`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare form data
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const timeString = now.toTimeString().slice(0, 8); // HH:MM:SS format

      // Validasi absensi ganda untuk check-in (hanya jika enableCheckInOut aktif)
      if (enableCheckInOut && mode === 'check_in' && employee) {
        try {
          const existingAbsensi = await getAbsensiByKaryawanAndTanggal(employee.id, today);
          // Jika sudah ada absensi dengan jam_masuk (sudah check-in), tampilkan alert
          if (existingAbsensi && existingAbsensi.jam_masuk) {
            toast.error("Absensi hanya bisa dilakukan sekali");
            setIsSubmitting(false);
            return;
          }
        } catch (error: unknown) {
          // Jika error 404 atau "not found", berarti belum ada absensi, lanjutkan submit
          // Jika error lain, log dan lanjutkan juga (biarkan backend yang handle)
          const errorMessage = error && typeof error === 'object' && 'message' in error 
            ? String((error as { message: string }).message) 
            : error instanceof Error 
            ? error.message 
            : '';
          
          // Jika bukan error "not found", log error tapi tetap lanjutkan submit
          // (biarkan backend yang handle validasi final)
          if (errorMessage && !errorMessage.toLowerCase().includes('not found') && !errorMessage.includes('404')) {
            console.error("Error checking existing absensi:", error);
          }
          // Lanjutkan submit meskipun ada error saat cek (biarkan backend yang handle)
        }
      }

      const submitData: AbsensiFormData = {
        karyawan_id: employee!.id,
        tanggal: today,
        status_kehadiran: 'hadir',
        sumber_absen: 'web',
        catatan: null,
      };

      // Set jam berdasarkan mode
      if (mode === 'check_in') {
        submitData.jam_masuk = timeString;
        submitData.jam_pulang = null;
      } else {
        submitData.jam_masuk = null;
        submitData.jam_pulang = timeString;
      }

      // Add foto and geo location
      if (photoFile) {
        submitData.foto_selfie = photoFile;
      }
      if (location.latitude !== null && location.longitude !== null) {
        submitData.latitude = location.latitude;
        submitData.longitude = location.longitude;
        submitData.akurasi = location.accuracy || 0;
      }
      submitData.jenis = mode;
      
      await onSubmit(submitData);
    } catch (error) {
      console.error("Failed to submit form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Jika enableCheckInOut, tampilkan form khusus untuk karyawan
  if (enableCheckInOut) {
    return (
      <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
        {/* Mode Selector - hanya Check In dan Check Out */}
        <Card>
          <CardHeader>
            <CardTitle>Mode Absensi</CardTitle>
            <CardDescription>
              Pilih mode absensi yang ingin Anda lakukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(value) => {
              setMode(value as 'check_in' | 'check_out');
              // Reset location dan photo saat ganti mode
              setLocationFetched(false);
              setLocation({ latitude: null, longitude: null, accuracy: null, distance: null });
              setPhotoFile(null);
              setPhotoPreview(null);
              setErrors({});
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="check_in">Check In</TabsTrigger>
                <TabsTrigger value="check_out">Check Out</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Informasi Absensi - Read Only */}
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'check_in' ? 'Check In' : 'Check Out'}
            </CardTitle>
            <CardDescription>
              {mode === 'check_in' 
                ? 'Lakukan check-in dengan mengambil lokasi dan upload foto'
                : 'Lakukan check-out dengan upload foto (opsional ambil lokasi)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Karyawan - Read Only */}
            <div className="space-y-2">
              <Label htmlFor="karyawan">Karyawan</Label>
              <Input
                id="karyawan"
                value={employee ? (employee.user?.name || employee.kode_karyawan || `ID: ${employee.id}`) : (loadingEmployee ? "Memuat..." : "Tidak ditemukan")}
                readOnly
                disabled
                className="bg-muted"
              />
              {errors.employee && (
                <p className="text-sm text-destructive">{errors.employee}</p>
              )}
            </div>

            {/* Tanggal - Read Only (Hari Ini) */}
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <div className="relative flex gap-2 max-w-xs">
                <Input
                  id="tanggal"
                  value={tanggalValue}
                  placeholder="Tanggal"
                  className="bg-muted pr-10"
                  readOnly
                  disabled
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="tanggal-picker"
                      variant="ghost"
                      type="button"
                      className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      disabled
                    >
                      <CalendarIcon className="size-3.5" />
                      <span className="sr-only">Tanggal</span>
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
                      selected={tanggalDate}
                      disabled
                      className="pointer-events-none opacity-50"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-xs text-muted-foreground">
                Tanggal otomatis diatur ke hari ini
              </p>
            </div>

            {/* Status Kehadiran - Read Only */}
            <div className="space-y-2">
              <Label htmlFor="status_kehadiran">Status Kehadiran</Label>
              <Input
                id="status_kehadiran"
                value="Hadir"
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Status kehadiran otomatis diatur ke &quot;Hadir&quot; untuk check-in/check-out
              </p>
            </div>

            {/* Jam - Read Only (akan diisi saat submit) */}
            <div className="space-y-2">
              <Label htmlFor="jam">
                {mode === 'check_in' ? 'Jam Masuk' : 'Jam Pulang'}
              </Label>
              <Input
                id="jam"
                value={new Date().toTimeString().slice(0, 8)}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Jam akan diisi otomatis saat Anda menyimpan absensi
              </p>
            </div>

            {/* Sumber Absen - Read Only */}
            <div className="space-y-2">
              <Label htmlFor="sumber_absen">Sumber Absen</Label>
              <Input
                id="sumber_absen"
                value="Web"
                readOnly
                disabled
                className="bg-muted"
              />
            </div>

            {/* Lokasi */}
            <div className="space-y-2">
              <Label>
                Lokasi <span className="text-destructive">*</span> {mode === 'check_in' && '(Wajib untuk Check In)'}
              </Label>
              <div className="flex gap-2 flex-wrap">
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
                {!locationFetched && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowManualInput(!showManualInput);
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.location;
                        return newErrors;
                      });
                    }}
                    disabled={isSubmitting || isLoading}
                  >
                    {showManualInput ? 'Sembunyikan Input Manual' : 'Input Koordinat Manual'}
                  </Button>
                )}
              </div>
              
              {/* Manual Input */}
              {showManualInput && !locationFetched && (
                <div className="mt-2 p-4 border rounded-md bg-muted/50 space-y-3">
                  <p className="text-sm font-medium">Input Koordinat Manual</p>
                  <p className="text-xs text-muted-foreground">
                    Jika GPS tidak berfungsi, Anda dapat memasukkan koordinat secara manual. 
                    Dapatkan koordinat dari Google Maps dengan klik kanan pada lokasi.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="manual_lat">Latitude</Label>
                      <Input
                        id="manual_lat"
                        type="number"
                        step="any"
                        placeholder="-8.5210302"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        disabled={isSubmitting || isLoading}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="manual_lon">Longitude</Label>
                      <Input
                        id="manual_lon"
                        type="number"
                        step="any"
                        placeholder="115.1380711"
                        value={manualLon}
                        onChange={(e) => setManualLon(e.target.value)}
                        disabled={isSubmitting || isLoading}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleManualLocationSubmit}
                    disabled={isSubmitting || isLoading || !manualLat || !manualLon}
                    className="w-full"
                  >
                    Gunakan Koordinat Ini
                  </Button>
                </div>
              )}
              {locationFetched && location.latitude && location.longitude && (
                <div className="mt-2 space-y-2">
                  <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    <div className="font-medium">Lokasi berhasil diambil</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <div>Latitude: {location.latitude.toFixed(6)}</div>
                      <div>Longitude: {location.longitude.toFixed(6)}</div>
                      {location.accuracy && (
                        <div>Akurasi GPS: ±{location.accuracy} meter</div>
                      )}
                      {location.distance !== null && location.distance !== undefined && (
                        <div className={cn(
                          "mt-1 font-medium",
                          location.distance > MAX_RADIUS_METERS ? "text-destructive" : "text-green-600"
                        )}>
                          Jarak dari SHINE EDUCATION BALI: {location.distance.toFixed(0)} meter
                          {location.distance > MAX_RADIUS_METERS && (
                            <span className="ml-1">(Melebihi maksimal {MAX_RADIUS_METERS} meter)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {location.distance !== null && location.distance !== undefined && location.distance > MAX_RADIUS_METERS && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Lokasi Anda terlalu jauh dari SHINE EDUCATION BALI. Maksimal {MAX_RADIUS_METERS} meter.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
            </div>

            {/* Foto */}
            <div className="space-y-2">
              <Label htmlFor="photo">
                Foto Selfie <span className="text-destructive">*</span> (Wajib)
              </Label>
              <div className="space-y-2">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  disabled={isSubmitting || isLoading || (mode === 'check_in' && !locationFetched)}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Foto harus diambil langsung dari kamera (bukan dari galeri)
                </p>
                {mode === 'check_in' && !locationFetched && (
                  <p className="text-xs text-destructive">
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
          <Button type="submit" variant="success" disabled={isSubmitting || isLoading || !employee}>
            {isSubmitting ? "Menyimpan..." : submitLabel}
          </Button>
        </div>
      </form>
    );
  }

  // Fallback untuk mode lama (jika enableCheckInOut false) - tidak digunakan lagi
  return null;
}
