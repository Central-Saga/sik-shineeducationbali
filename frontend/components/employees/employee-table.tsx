"use client";

import * as React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Employee } from "@/lib/types/employee";
import { Briefcase, Eye, Pencil, Trash2 } from "lucide-react";

interface EmployeeTableProps {
  employees: Employee[];
  loading?: boolean;
  className?: string;
  onView?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

export function EmployeeTable({
  employees,
  loading = false,
  className,
  onView,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const getKategoriLabel = (kategori: string) => {
    const labels: Record<string, string> = {
      tetap: 'Tetap',
      kontrak: 'Kontrak',
      freelance: 'Freelance',
    };
    return labels[kategori] || kategori;
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'aktif' ? 'default' : 'secondary';
  };

  const getStatusLabel = (status: string) => {
    return status === 'aktif' ? 'Aktif' : 'Nonaktif';
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Kode Karyawan</TableHead>
                  <TableHead className="min-w-[200px]">Nama Karyawan</TableHead>
                  <TableHead className="min-w-[120px]">Kategori</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[150px]">No. Handphone</TableHead>
                  <TableHead className="text-right min-w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-lg border p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tidak ada karyawan ditemukan</h3>
          <p className="text-sm text-muted-foreground">
            Belum ada data karyawan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Kode Karyawan</TableHead>
                <TableHead className="min-w-[200px]">Nama Karyawan</TableHead>
                <TableHead className="min-w-[120px]">Kategori</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[150px]">No. Handphone</TableHead>
                <TableHead className="text-right min-w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium font-mono">
                    {employee.kode_karyawan || '-'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {employee.user?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getKategoriLabel(employee.kategori_karyawan)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(employee.status)}>
                      {getStatusLabel(employee.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {employee.nomor_hp || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onView ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(employee)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Lihat Detail</span>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                        >
                          <Link href={`/dashboard/employees/${employee.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Lihat Detail</span>
                          </Link>
                        </Button>
                      )}
                      {onEdit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(employee)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                        >
                          <Link href={`/dashboard/employees/${employee.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(employee)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Hapus</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

