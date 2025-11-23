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
import type { CutiFormData } from "@/lib/types/cuti";
import type { Employee } from "@/lib/types/employee";
import { getMyEmployee, getEmployees } from "@/lib/api/employees";
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

interface CutiFormProps {
  initialData?: Partial<CutiFormData> & {
    id?: number;
  };
  onSubmit: (data: CutiFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  className?: string;
  isEditing?: boolean;
}

export function CutiForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Ajukan Cuti",
  className,
  isEditing = false,
}: CutiFormProps) {
  const { user, hasRole } = useAuth();
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (initialData?.tanggal) {
      const d = new Date(initialData.tanggal);
      return isValidDate(d) ? d : new Date();
    }
    return new Date();
  });
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [value, setValue] = React.useState(() => formatDate(date));

  const [formData, setFormData] = React.useState<CutiFormData>({
    karyawan_id: initialData?.karyawan_id || 0,
    tanggal: initialData?.tanggal || new Date().toISOString().split('T')[0],
    jenis: initialData?.jenis || 'cuti',
    status: initialData?.status || 'diajukan',
    catatan: initialData?.catatan || '',
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
  const [loadingEmployee, setLoadingEmployee] = React.useState(false);
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
      newErrors.tanggal = "Tanggal cuti wajib diisi.";
    }
    if (!formData.jenis) {
      newErrors.jenis = "Jenis cuti wajib dipilih.";
    }
    if (!formData.catatan || !formData.catatan.trim()) {
      newErrors.catatan = "Catatan wajib diisi. Silakan sertakan keterangan cuti/izin/sakit.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare data for submission
      const submitData: CutiFormData = {
        karyawan_id: formData.karyawan_id,
        tanggal: formData.tanggal,
        jenis: formData.jenis,
        status: formData.status || 'diajukan',
        catatan: formData.catatan.trim(),
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
        setErrors({ submit: apiError?.message || "Gagal menyimpan cuti" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isKaryawan = hasRole('Karyawan');

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Informasi Karyawan */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Karyawan</CardTitle>
          <CardDescription>
            {isKaryawan
              ? "Data karyawan akan diisi otomatis"
              : "Pilih karyawan yang mengajukan cuti"}
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

      {/* Informasi Cuti */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Cuti</CardTitle>
          <CardDescription>
            Isi detail pengajuan cuti, izin, atau sakit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tanggal">
              Tanggal <span className="text-destructive">*</span>
            </Label>
            <div className="relative flex gap-2">
              <Input
                id="tanggal"
                value={value}
                placeholder="Pilih tanggal"
                className={cn(
                  "bg-background pr-10",
                  errors.tanggal ? "border-destructive" : ""
                )}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  setValue(inputValue);
                  const parsedDate = new Date(inputValue);
                  if (isValidDate(parsedDate)) {
                    setDate(parsedDate);
                    setMonth(parsedDate);
                    const formattedDate = parsedDate.toISOString().split('T')[0];
                    setFormData(prev => ({ ...prev, tanggal: formattedDate }));
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.tanggal;
                      return newErrors;
                    });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setDatePickerOpen(true);
                  }
                }}
                aria-invalid={!!errors.tanggal}
              />
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date-picker"
                    variant="ghost"
                    type="button"
                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                  >
                    <CalendarIcon className="size-3.5" />
                    <span className="sr-only">Pilih tanggal</span>
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
                    selected={date}
                    captionLayout="dropdown"
                    fromYear={2020}
                    toYear={2030}
                    month={month}
                    onMonthChange={setMonth}
                    onSelect={(selectedDate) => {
                      if (selectedDate) {
                        setDate(selectedDate);
                        setValue(formatDate(selectedDate));
                        setDatePickerOpen(false);
                        const formattedDate = selectedDate.toISOString().split('T')[0];
                        setFormData(prev => ({ ...prev, tanggal: formattedDate }));
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.tanggal;
                          return newErrors;
                        });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {errors.tanggal && (
              <p className="text-sm text-destructive">{errors.tanggal}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jenis">
              Jenis <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.jenis}
              onValueChange={(value: 'cuti' | 'izin' | 'sakit') => {
                setFormData(prev => ({ ...prev, jenis: value }));
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.jenis;
                  return newErrors;
                });
              }}
            >
              <SelectTrigger
                id="jenis"
                aria-invalid={!!errors.jenis}
                className={errors.jenis ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Pilih jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cuti">Cuti</SelectItem>
                <SelectItem value="izin">Izin</SelectItem>
                <SelectItem value="sakit">Sakit</SelectItem>
              </SelectContent>
            </Select>
            {errors.jenis && (
              <p className="text-sm text-destructive">{errors.jenis}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="catatan">
              Catatan / Alasan <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="catatan"
              value={formData.catatan}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, catatan: e.target.value }));
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.catatan;
                  return newErrors;
                });
              }}
              rows={4}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                errors.catatan ? "border-destructive" : ""
              )}
              placeholder="Masukkan alasan atau keterangan cuti/izin/sakit..."
              aria-invalid={!!errors.catatan}
            />
            {errors.catatan && (
              <p className="text-sm text-destructive">{errors.catatan}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {errors.submit && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

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
        <Button
          type="submit"
          disabled={isSubmitting || isLoading || loadingEmployee}
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

