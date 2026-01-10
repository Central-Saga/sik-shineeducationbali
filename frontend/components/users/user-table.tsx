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
import { Switch } from "@/components/ui/switch";
import type { User } from "@/lib/types/user";
import { Pencil, Users } from "lucide-react";

interface UserTableProps {
  users: User[];
  allUsers?: User[]; // Semua users untuk validasi (termasuk yang tidak terfilter)
  loading?: boolean;
  onUpdateStatus?: (user: User, newStatus: 'aktif' | 'nonaktif') => void;
  className?: string;
}

export function UserTable({
  users,
  allUsers,
  loading = false,
  onUpdateStatus,
  className,
}: UserTableProps) {

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const isOwnerOrAdmin = (user: User): boolean => {
    if (!user.roles || user.roles.length === 0) return false;
    return user.roles.some(
      (role) => role.toLowerCase() === "admin" || role.toLowerCase() === "owner"
    );
  };

  if (loading) {
    return (
      <div className={className}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-16 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-lg border p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tidak ada pengguna ditemukan</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Mulai dengan membuat pengguna baru.
          </p>
          <Button asChild>
            <Link href="/dashboard/users/create">Tambah Pengguna</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={className}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user?.email || "N/A"}</TableCell>
                <TableCell>
                  {user.roles && user.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role, index) => (
                        <Badge key={index} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Tidak ada peran</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/dashboard/users/${user.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Ubah</span>
                      </Link>
                    </Button>
                    {onUpdateStatus && !isOwnerOrAdmin(user) && (
                      <Switch
                        checked={user.status === 'aktif' || user.status === undefined}
                        onCheckedChange={(checked) => {
                          onUpdateStatus(user, checked ? 'aktif' : 'nonaktif');
                        }}
                        aria-label={`Toggle status untuk user ID ${user.id}`}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

