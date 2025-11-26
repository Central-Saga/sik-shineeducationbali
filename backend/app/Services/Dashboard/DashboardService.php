<?php

namespace App\Services\Dashboard;

use App\Models\Absensi;
use App\Models\Cuti;
use App\Models\Employee;
use App\Models\Gaji;
use App\Models\RealisasiSesi;
use App\Models\RekapBulanan;
use App\Models\User;
use App\Services\Contracts\DashboardServiceInterface;
use Carbon\Carbon;

class DashboardService implements DashboardServiceInterface
{
    /**
     * Get dashboard statistics based on user role.
     *
     * @param  \App\Models\User  $user
     * @return array<string, mixed>
     */
    public function getStatistics($user): array
    {
        if ($user->hasRole('Admin')) {
            return $this->getAdminStatistics();
        } elseif ($user->hasRole('Owner')) {
            return $this->getOwnerStatistics();
        } elseif ($user->hasRole('Karyawan')) {
            return $this->getKaryawanStatistics($user);
        }

        return [];
    }

    /**
     * Get statistics for Admin role.
     *
     * @return array<string, mixed>
     */
    protected function getAdminStatistics(): array
    {
        $today = Carbon::today();
        $currentMonth = Carbon::now()->format('Y-m');

        return [
            'total_users' => User::count(),
            'total_karyawan' => Employee::count(),
            'absensi_hari_ini' => Absensi::whereDate('tanggal', $today)->count(),
            'cuti_pending' => Cuti::where('status', 'diajukan')->count(),
            'realisasi_sesi_pending' => RealisasiSesi::where('status', 'diajukan')->count(),
            'total_gaji_bulan_ini' => Gaji::where('periode', $currentMonth)->sum('total_gaji'),
        ];
    }

    /**
     * Get statistics for Owner role.
     *
     * @return array<string, mixed>
     */
    protected function getOwnerStatistics(): array
    {
        $currentMonth = Carbon::now()->format('Y-m');

        return [
            'total_karyawan' => Employee::count(),
            'total_gaji_bulan_ini' => Gaji::where('periode', $currentMonth)->sum('total_gaji'),
            'total_rekap_bulanan' => RekapBulanan::count(),
            'realisasi_sesi_pending' => RealisasiSesi::where('status', 'diajukan')->count(),
        ];
    }

    /**
     * Get statistics for Karyawan role.
     *
     * @param  \App\Models\User  $user
     * @return array<string, mixed>
     */
    protected function getKaryawanStatistics($user): array
    {
        $employee = $user->employee;
        
        if (!$employee) {
            return [
                'absensi_hari_ini' => 0,
                'cuti_tersisa' => 0,
                'gaji_terakhir' => null,
                'realisasi_sesi_saya' => 0,
            ];
        }

        $today = Carbon::today();
        $currentMonth = Carbon::now()->format('Y-m');

        // Hitung cuti tersisa (asumsi 12 hari per tahun)
        $cutiTerpakai = Cuti::where('karyawan_id', $employee->id)
            ->where('status', 'disetujui')
            ->whereYear('tanggal_mulai', Carbon::now()->year)
            ->sum('jumlah_hari');

        $cutiTersisa = max(0, 12 - $cutiTerpakai);

        // Gaji terakhir
        $gajiTerakhir = Gaji::where('karyawan_id', $employee->id)
            ->orderBy('periode', 'desc')
            ->first();

        return [
            'absensi_hari_ini' => Absensi::where('karyawan_id', $employee->id)
                ->whereDate('tanggal', $today)
                ->count(),
            'cuti_tersisa' => $cutiTersisa,
            'gaji_terakhir' => $gajiTerakhir ? [
                'periode' => $gajiTerakhir->periode,
                'total_gaji' => $gajiTerakhir->total_gaji,
            ] : null,
            'realisasi_sesi_saya' => RealisasiSesi::where('karyawan_id', $employee->id)
                ->count(),
        ];
    }

    /**
     * Get chart data based on type and user role.
     *
     * @param  string  $type
     * @param  \App\Models\User  $user
     * @return array<string, mixed>
     */
    public function getChartData(string $type, $user): array
    {
        if ($user->hasRole('Admin')) {
            return $this->getAdminChartData($type);
        } elseif ($user->hasRole('Owner')) {
            return $this->getOwnerChartData($type);
        } elseif ($user->hasRole('Karyawan')) {
            return $this->getKaryawanChartData($type, $user);
        }

        return [];
    }

    /**
     * Get chart data for Admin role.
     *
     * @param  string  $type
     * @return array<string, mixed>
     */
    protected function getAdminChartData(string $type): array
    {
        if ($type === 'absensi-trend') {
            // Trend absensi 7 hari terakhir
            $data = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $count = Absensi::whereDate('tanggal', $date)->count();
                $data[] = [
                    'date' => $date->format('Y-m-d'),
                    'label' => $date->format('d M'),
                    'value' => $count,
                ];
            }
            return $data;
        } elseif ($type === 'cuti-distribution') {
            // Distribusi status cuti
            $pending = Cuti::where('status', 'diajukan')->count();
            $disetujui = Cuti::where('status', 'disetujui')->count();
            $ditolak = Cuti::where('status', 'ditolak')->count();

            return [
                ['name' => 'Pending', 'value' => $pending, 'color' => '#F59E0B'],
                ['name' => 'Disetujui', 'value' => $disetujui, 'color' => '#10B981'],
                ['name' => 'Ditolak', 'value' => $ditolak, 'color' => '#EF4444'],
            ];
        }

        return [];
    }

    /**
     * Get chart data for Owner role.
     *
     * @param  string  $type
     * @return array<string, mixed>
     */
    protected function getOwnerChartData(string $type): array
    {
        if ($type === 'gaji-trend') {
            // Trend gaji 6 bulan terakhir
            $data = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $periode = $date->format('Y-m');
                $total = Gaji::where('periode', $periode)->sum('total_gaji');
                $data[] = [
                    'periode' => $periode,
                    'label' => $date->format('M Y'),
                    'value' => (float) $total,
                ];
            }
            return $data;
        } elseif ($type === 'realisasi-sesi-distribution') {
            // Distribusi status realisasi sesi
            $diajukan = RealisasiSesi::where('status', 'diajukan')->count();
            $disetujui = RealisasiSesi::where('status', 'disetujui')->count();
            $ditolak = RealisasiSesi::where('status', 'ditolak')->count();

            return [
                ['name' => 'Diajukan', 'value' => $diajukan, 'color' => '#F59E0B'],
                ['name' => 'Disetujui', 'value' => $disetujui, 'color' => '#10B981'],
                ['name' => 'Ditolak', 'value' => $ditolak, 'color' => '#EF4444'],
            ];
        }

        return [];
    }

    /**
     * Get chart data for Karyawan role.
     *
     * @param  string  $type
     * @param  \App\Models\User  $user
     * @return array<string, mixed>
     */
    protected function getKaryawanChartData(string $type, $user): array
    {
        $employee = $user->employee;
        
        if (!$employee) {
            return [];
        }

        if ($type === 'absensi-bulan-ini') {
            // Absensi bulan ini (Hadir/Izin)
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();

            $hadir = Absensi::where('karyawan_id', $employee->id)
                ->whereBetween('tanggal', [$startOfMonth, $endOfMonth])
                ->where('status_kehadiran', 'hadir')
                ->count();

            $izin = Absensi::where('karyawan_id', $employee->id)
                ->whereBetween('tanggal', [$startOfMonth, $endOfMonth])
                ->where('status_kehadiran', 'izin')
                ->count();

            return [
                ['name' => 'Hadir', 'value' => $hadir, 'color' => '#10B981'],
                ['name' => 'Izin', 'value' => $izin, 'color' => '#3B82F6'],
            ];
        } elseif ($type === 'realisasi-sesi-status') {
            // Status realisasi sesi saya
            $diajukan = RealisasiSesi::where('karyawan_id', $employee->id)
                ->where('status', 'diajukan')
                ->count();
            $disetujui = RealisasiSesi::where('karyawan_id', $employee->id)
                ->where('status', 'disetujui')
                ->count();
            $ditolak = RealisasiSesi::where('karyawan_id', $employee->id)
                ->where('status', 'ditolak')
                ->count();

            return [
                ['name' => 'Diajukan', 'value' => $diajukan, 'color' => '#F59E0B'],
                ['name' => 'Disetujui', 'value' => $disetujui, 'color' => '#10B981'],
                ['name' => 'Ditolak', 'value' => $ditolak, 'color' => '#EF4444'],
            ];
        }

        return [];
    }
}

