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
import { Textarea } from "@/components/ui/textarea";
import type { RealisasiSesiFormData } from "@/lib/types/realisasi-sesi";
import type { Employee } from "@/lib/types/employee";
import type { SesiKerja } from "@/lib/types/sesi-kerja";
import { getMyEmployee, getEmployees } from "@/lib/api/employees";
import { getSesiKerjaAktif } from "@/lib/api/sesi-kerja";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Loader2, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime()) && date instanceof Date;
}

interface RealisasiSesiFormProps {
  initialData?: Partial<RealisasiSesiFormData> & {
    id?: number;
  };
  onSubmit: (data: RealisasiSesiFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  className?: string;
  isEditing?: boolean;
}

export function RealisasiSesiForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Ajukan Realisasi Sesi",
  className,
  isEditing = false,
}: RealisasiSesiFormProps) {
  const { user, hasRole } = useAuth();
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (initialData?.tanggal) {
      const d = new Date(initialData.tanggal);
      if (isValidDate(d)) {
        return d;
      }
    }
    return new Date();
  });
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [value, setValue] = React.useState(() => formatDate(date));

  const [formData, setFormData] = React.useState<RealisasiSesiFormData>(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      karyawan_id: initialData?.karyawan_id || 0,
      tanggal: initialData?.tanggal || today,
      sesi_kerja_id: initialData?.sesi_kerja_id || 0,
      sumber: initialData?.sumber || 'jadwal',
      catatan: initialData?.catatan || '',
    };
  });

  // Sync date state with formData
  React.useEffect(() => {
    if (formData.tanggal) {
      const newDate = new Date(formData.tanggal);
      if (!isNaN(newDate.getTime())) {
        setDate(newDate);
        setMonth(newDate);
        setValue(formatDate(newDate));
      }
    }
  }, [formData.tanggal]);

  const [employee, setEmployee] = React.useState<Employee | null>(null);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [sesiKerjaList, setSesiKerjaList] = React.useState<SesiKerja[]>([]);
  const [loadingEmployee, setLoadingEmployee] = React.useState(false);
  const [loadingSesiKerja, setLoadingSesiKerja] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Auto-fill karyawan_id dari user yang login untuk karyawan
  React.useEffect(() => {
    if (hasRole('Karyawan') && user?.id && !isEditing) {
      const loadEmployee = async () => {
        try {
          setLoadingEmployee(true);
          const employeeData = await getMyEmployee();
          if (employeeData) {
            setEmployee(employeeData);
            setFormData(prev => ({ ...prev, karyawan_id: employeeData.id }));
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.karyawan_id;
              return newErrors;
            });
          } else {
            setErrors(prev => ({ ...prev, karyawan_id: "Data karyawan tidak ditemukan untuk user ini." }));
          }
        } catch (error: unknown) {
          console.error("Failed to load employee:", error);
          const errorMessage = error instanceof Error ? error.message : "Gagal memuat data karyawan.";
          setErrors(prev => ({ ...prev, karyawan_id: errorMessage }));
        } finally {
          setLoadingEmployee(false);
        }
      };
      loadEmployee();
    } else if (hasRole('Admin') || hasRole('Owner')) {
      // Load all employees for admin/owner
      const loadEmployees = async () => {
        try {
          setLoadingEmployee(true);
          const employeesData = await getEmployees();
          setEmployees(employeesData);
        } catch (error: unknown) {
          console.error("Failed to load employees:", error);
        } finally {
          setLoadingEmployee(false);
        }
      };
      loadEmployees();
    }
  }, [hasRole, user?.id, isEditing]);

  // Load sesi kerja aktif
  React.useEffect(() => {
    const loadSesiKerja = async () => {
      try {
        setLoadingSesiKerja(true);
        const sesiKerjaData = await getSesiKerjaAktif();
        setSesiKerjaList(sesiKerjaData);
      } catch (error: unknown) {
        console.error("Failed to load sesi kerja:", error);
      } finally {
        setLoadingSesiKerja(false);
      }
    };
    loadSesiKerja();
  }, []);

  // Load employee data if karyawan_id is set (for editing)
  React.useEffect(() => {
    if (formData.karyawan_id && (isEditing || hasRole('Admin') || hasRole('Owner'))) {
      const loadEmployeeData = async () => {
        try {
          setLoadingEmployee(true);
          if (hasRole('Karyawan')) {
            const employeeData = await getMyEmployee();
            setEmployee(employeeData);
          } else {
            const employeesData = await getEmployees();
            const foundEmployee = employeesData.find(emp => emp.id === formData.karyawan_id);
            if (foundEmployee) {
              setEmployee(foundEmployee);
            }
          }
        } catch (error: unknown) {
          console.error("Failed to load employee:", error);
        } finally {
          setLoadingEmployee(false);
        }
      };
      loadEmployeeData();
    }
  }, [formData.karyawan_id, isEditing, hasRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Client-side validation
    const newErrors: Record<string, string> = {};

    if (!formData.karyawan_id || formData.karyawan_id <= 0) {
      newErrors.karyawan_id = "Karyawan wajib dipilih.";
    }
    if (!formData.tanggal) {
      newErrors.tanggal = "Tanggal wajib diisi.";
    }
    if (!formData.sesi_kerja_id || formData.sesi_kerja_id <= 0) {
      newErrors.sesi_kerja_id = "Sesi kerja wajib dipilih.";
    }
    if (!formData.sumber) {
      newErrors.sumber = "Sumber wajib dipilih.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare data for submission
      const submitData: RealisasiSesiFormData = {
        karyawan_id: formData.karyawan_id,
        tanggal: formData.tanggal,
        sesi_kerja_id: formData.sesi_kerja_id,
        sumber: formData.sumber,
        catatan: formData.catatan?.trim() || null,
      };

      await onSubmit(submitData);
    } catch (error: unknown) {
      // Handle API validation errors
      const apiError = error as { errors?: Record<string, string | string[]>; message?: string };
      if (apiError?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.keys(apiError.errors).forEach((key) => {
          const errorValue = apiError.errors![key];
          apiErrors[key] = Array.isArray(errorValue)
            ? errorValue[0]
            : String(errorValue);
        });
        setErrors(apiErrors);
      } else {
        setErrors({ submit: apiError?.message || "Gagal menyimpan realisasi sesi" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isKaryawan = hasRole('Karyawan');

  const getSesiKerjaLabel = (sesi: SesiKerja) => {
    const kategoriLabel = sesi.kategori === 'coding' ? 'Coding' : 'Non-Coding';
    const hariLabel = sesi.hari.charAt(0).toUpperCase() + sesi.hari.slice(1);
    const mataPelajaran = sesi.mata_pelajaran ? ` - ${sesi.mata_pelajaran}` : '';
    return `${kategoriLabel}${mataPelajaran} - ${hariLabel} - Sesi ${sesi.nomor_sesi} (${sesi.jam_mulai?.substring(0, 5)} - ${sesi.jam_selesai?.substring(0, 5)})`;
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Informasi Karyawan */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Karyawan</CardTitle>
          <CardDescription>
            {isKaryawan
              ? "Data karyawan akan diisi otomatis"
              : "Pilih karyawan yang mengajukan realisasi sesi"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingEmployee ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memuat data karyawan...</span>
            </div>
          ) : isKaryawan ? (
            <div className="space-y-2">
              <Label>Nama Karyawan</Label>
              <Input
                value={employee?.user?.name || employee?.kode_karyawan || "Memuat..."}
                disabled
                className="bg-muted"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="karyawan_id">
                Karyawan <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.karyawan_id?.toString() || ""}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, karyawan_id: parseInt(value) }));
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.karyawan_id;
                    return newErrors;
                  });
                }}
              >
                <SelectTrigger
                  id="karyawan_id"
                  aria-invalid={!!errors.karyawan_id}
                  className={errors.karyawan_id ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Pilih karyawan" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.user?.name || emp.kode_karyawan || `Karyawan #${emp.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.karyawan_id && (
                <p className="text-sm text-destructive">{errors.karyawan_id}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informasi Realisasi Sesi */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Realisasi Sesi</CardTitle>
          <CardDescription>
            Isi detail realisasi sesi yang dikerjakan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tanggal">
              Tanggal <span className="text-destructive">*</span>
            </Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                    errors.tanggal && "border-destructive"
                  )}
                  id="tanggal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value || "Pilih tanggal"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setMonth(selectedDate);
                    if (selectedDate) {
                      const formatted = selectedDate.toISOString().split('T')[0];
                      setFormData(prev => ({ ...prev, tanggal: formatted }));
                      setValue(formatDate(selectedDate));
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.tanggal;
                        return newErrors;
                      });
                    }
                    setDatePickerOpen(false);
                  }}
                  month={month}
                  onMonthChange={setMonth}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
            {errors.tanggal && (
              <p className="text-sm text-destructive">{errors.tanggal}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sesi_kerja_id">
              Sesi Kerja <span className="text-destructive">*</span>
            </Label>
            {loadingSesiKerja ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memuat sesi kerja...</span>
              </div>
            ) : (
              <Select
                value={formData.sesi_kerja_id?.toString() || ""}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, sesi_kerja_id: parseInt(value) }));
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.sesi_kerja_id;
                    return newErrors;
                  });
                }}
              >
                <SelectTrigger
                  id="sesi_kerja_id"
                  aria-invalid={!!errors.sesi_kerja_id}
                  className={errors.sesi_kerja_id ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Pilih sesi kerja" />
                </SelectTrigger>
                <SelectContent>
                  {sesiKerjaList.map((sesi) => (
                    <SelectItem key={sesi.id} value={sesi.id.toString()}>
                      {getSesiKerjaLabel(sesi)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.sesi_kerja_id && (
              <p className="text-sm text-destructive">{errors.sesi_kerja_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sumber">
              Sumber <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.sumber}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, sumber: value as 'jadwal' | 'manual' }));
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.sumber;
                  return newErrors;
                });
              }}
            >
              <SelectTrigger
                id="sumber"
                aria-invalid={!!errors.sumber}
                className={errors.sumber ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Pilih sumber" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jadwal">Jadwal</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            {errors.sumber && (
              <p className="text-sm text-destructive">{errors.sumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="catatan">
              Catatan
            </Label>
            <Textarea
              id="catatan"
              value={formData.catatan || ''}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, catatan: e.target.value }));
              }}
              placeholder="Catatan tambahan (opsional)"
              rows={3}
            />
          </div>

          {errors.submit && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
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
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

