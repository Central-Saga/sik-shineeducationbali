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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/lib/types/user";
import { Pencil, Trash2, Users, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface UserTableProps {
  users: User[];
  allUsers?: User[]; // Semua users untuk validasi (termasuk yang tidak terfilter)
  loading?: boolean;
  onDelete?: (id: number | string) => Promise<void>;
  className?: string;
}

export function UserTable({
  users,
  allUsers,
  loading = false,
  onDelete,
  className,
}: UserTableProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = React.useState(false);
  const [deletingUser, setDeletingUser] = React.useState<User | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Helper function untuk cek apakah user adalah Admin atau Owner
  const isAdminOrOwner = (user: User): boolean => {
    if (!user.roles || user.roles.length === 0) return false;
    return user.roles.some(
      (role) => role.toLowerCase() === "admin" || role.toLowerCase() === "owner"
    );
  };

  // Helper function untuk menghitung jumlah Admin/Owner
  const countAdminOwner = (usersList: User[]): number => {
    return usersList.filter((user) => isAdminOrOwner(user)).length;
  };

  // Helper function untuk cek apakah button delete harus disabled
  const isDeleteDisabled = (user: User): boolean => {
    if (!currentUser) return true;
    
    // User tidak bisa menghapus akun mereka sendiri
    if (currentUser.id === user.id) {
      return true;
    }
    
    // Cek apakah current user adalah Admin atau Owner
    const currentIsAdmin = currentUser.roles?.some(
      (role) => role.toLowerCase() === "admin"
    ) ?? false;
    const currentIsOwner = currentUser.roles?.some(
      (role) => role.toLowerCase() === "owner"
    ) ?? false;
    
    // Admin tidak bisa menghapus Admin atau Owner
    if (currentIsAdmin && isAdminOrOwner(user)) {
      return true;
    }
    // Owner bisa menghapus Admin (tidak ada restriksi)
    
    return false;
  };

  const handleDeleteClick = (user: User) => {
    // Validasi: jika button disabled, jangan buka dialog
    if (isDeleteDisabled(user)) {
      return;
    }
    
    // Gunakan allUsers jika tersedia, jika tidak gunakan users
    const usersForValidation = allUsers || users;
    
    // Cek apakah user yang akan dihapus adalah Admin/Owner
    if (isAdminOrOwner(user)) {
      const adminOwnerCount = countAdminOwner(usersForValidation);
      
      // Jika hanya ada 1 Admin/Owner, tampilkan alert khusus
      if (adminOwnerCount <= 1) {
        setDeletingUser(user);
        setAlertDialogOpen(true);
        return;
      }
    }
    
    // Jika bukan Admin/Owner terakhir, tampilkan dialog konfirmasi biasa
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser || !onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(deletingUser.id);
      setDeleteDialogOpen(false);
      setDeletingUser(null);
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Failed to delete user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (loading) {
    return (
      <div className={className}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
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
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user?.name || "N/A"}</TableCell>
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
                  <div className="flex justify-end gap-2">
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
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(user)}
                        disabled={isDeleteDisabled(user)}
                        className={isDeleteDisabled(user) ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        <Trash2 className={`h-4 w-4 ${isDeleteDisabled(user) ? "text-muted-foreground" : "text-destructive"}`} />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengguna &quot;
              {deletingUser?.name}&quot;? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingUser(null);
              }}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog untuk Admin/Owner Terakhir */}
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <DialogTitle>Tidak Dapat Menghapus Admin/Owner</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Pengguna &quot;{deletingUser?.name}&quot; adalah Admin/Owner terakhir dalam sistem.
              Sistem memerlukan setidaknya satu akun Admin atau Owner untuk berfungsi dengan baik.
              <br /><br />
              Untuk menghapus pengguna ini, Anda harus membuat akun Admin atau Owner baru terlebih dahulu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAlertDialogOpen(false);
                setDeletingUser(null);
              }}
            >
              Tutup
            </Button>
            <Button
              onClick={() => {
                setAlertDialogOpen(false);
                setDeletingUser(null);
                router.push("/dashboard/users/create");
              }}
            >
              Buat Admin/Owner Baru
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

