<?php

namespace App\Services\Gaji;

use App\Models\Employee;
use App\Models\Gaji;
use App\Models\RekapBulanan;
use App\Repositories\Contracts\GajiRepositoryInterface;
use App\Repositories\Contracts\KomponenGajiRepositoryInterface;
use App\Repositories\Contracts\RealisasiSesiRepositoryInterface;
use App\Services\Base\BaseService;
use App\Services\Contracts\GajiServiceInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GajiService extends BaseService implements GajiServiceInterface
{
    protected KomponenGajiRepositoryInterface $komponenGajiRepository;
    protected RealisasiSesiRepositoryInterface $realisasiSesiRepository;

    /**
     * Create a new gaji service instance.
     *
     * @param  \App\Repositories\Contracts\GajiRepositoryInterface  $repository
     * @param  \App\Repositories\Contracts\KomponenGajiRepositoryInterface  $komponenGajiRepository
     * @param  \App\Repositories\Contracts\RealisasiSesiRepositoryInterface  $realisasiSesiRepository
     */
    public function __construct(
        GajiRepositoryInterface $repository,
        KomponenGajiRepositoryInterface $komponenGajiRepository,
        RealisasiSesiRepositoryInterface $realisasiSesiRepository
    ) {
        parent::__construct($repository);
        $this->komponenGajiRepository = $komponenGajiRepository;
        $this->realisasiSesiRepository = $realisasiSesiRepository;
    }

    /**
     * Get repository instance with proper type hint.
     *
     * @return \App\Repositories\Contracts\GajiRepositoryInterface
     */
    protected function getRepository(): GajiRepositoryInterface
    {
        return $this->repository;
    }

    /**
     * Get a gaji record by ID.
     *
     * @param  int|string  $id
     * @return \App\Models\Gaji
     * @throws \App\Exceptions\NotFoundException
     */
    public function getById($id): Gaji
    {
        // Check permission
        if (!$this->hasPermission('mengelola gaji') && !$this->hasPermission('melihat gaji')) {
            abort(403, 'You do not have permission to view gaji records.');
        }

        return parent::getById($id);
    }

    /**
     * Generate gaji from rekap bulanan.
     *
     * @param  int|string  $rekapBulananId
     * @return \App\Models\Gaji
     */
    public function generateGajiFromRekap($rekapBulananId): Gaji
    {
        // Check permission
        if (!$this->hasPermission('mengelola gaji')) {
            abort(403, 'You do not have permission to generate gaji.');
        }

        $rekap = \App\Models\RekapBulanan::findOrFail($rekapBulananId);
        $employee = $rekap->employee;

        if (!$employee) {
            abort(404, 'Employee not found for this rekap.');
        }

        return DB::transaction(function () use ($employee, $rekap) {
            return $this->calculateGaji($employee, $rekap);
        });
    }

    /**
     * Calculate gaji for employee based on rekap bulanan.
     *
     * @param  \App\Models\Employee  $employee
     * @param  \App\Models\RekapBulanan  $rekap
     * @return \App\Models\Gaji
     */
    public function calculateGaji($employee, $rekap): Gaji
    {
        // Check if gaji already exists for this periode and karyawan
        $existingGaji = $this->getRepository()->findBy([
            'karyawan_id' => $employee->id,
            'periode' => $rekap->periode,
        ])->first();

        // Get periode start and end date
        $startDate = Carbon::createFromFormat('Y-m', $rekap->periode)->startOfMonth();
        $endDate = Carbon::createFromFormat('Y-m', $rekap->periode)->endOfMonth();

        // Get realisasi sesi in periode (only disetujui)
        $realisasiSesiList = $this->realisasiSesiRepository->findByKaryawanIdAndDateRange(
            $employee->id,
            $startDate->format('Y-m-d'),
            $endDate->format('Y-m-d')
        )->where('status', 'disetujui');

        $komponenGajiData = [];
        $totalGaji = 0;

        // Calculate based on employee type
        if ($employee->kategori_karyawan === 'freelance') {
            // Freelance: hanya pendapatan sesi
            $totalGaji = (float) $rekap->total_pendapatan_sesi;

            $komponenGajiData[] = [
                'jenis' => 'pendapatan_sesi',
                'nama_komponen' => 'Pendapatan Sesi',
                'nominal' => $totalGaji,
            ];
        } else {
            // Tetap/Kontrak: gaji pokok + lembur - potongan cuti
            // Note: Sesi wajib tidak ditambahkan karena sudah termasuk dalam gaji pokok atau tidak perlu ditambahkan

            // 1. Gaji pokok
            $gajiPokok = (float) ($employee->gaji_pokok ?? 0);
            if ($gajiPokok > 0) {
                $komponenGajiData[] = [
                    'jenis' => 'gaji_pokok',
                    'nama_komponen' => 'Gaji Pokok',
                    'nominal' => $gajiPokok,
                ];
                $totalGaji += $gajiPokok;
            }

            // 2. Lembur sesi (sumber = 'lembur') - hanya sesi di luar jadwal wajib
            $lemburSesi = 0;
            foreach ($realisasiSesiList as $realisasiSesi) {
                if ($realisasiSesi->sumber === 'lembur') {
                    $sesiKerja = $realisasiSesi->sesiKerja;
                    if ($sesiKerja) {
                        $lemburSesi += (float) $sesiKerja->tarif;
                    }
                }
            }

            if ($lemburSesi > 0) {
                $komponenGajiData[] = [
                    'jenis' => 'lembur_sesi',
                    'nama_komponen' => 'Lembur Sesi',
                    'nominal' => $lemburSesi,
                ];
                $totalGaji += $lemburSesi;
            }

            // 3. Potongan cuti (jumlah_cuti + jumlah_izin + jumlah_sakit)
            $potonganCuti = 0;
            $hariCuti = $rekap->jumlah_cuti + $rekap->jumlah_izin + $rekap->jumlah_sakit;
            if ($hariCuti > 0) {
                // Part time = 50rb/hari, Full time = 100rb/hari
                $potonganPerHari = ($employee->subtipe_kontrak === 'part_time') ? 50000 : 100000;
                $potonganCuti = $hariCuti * $potonganPerHari;

                if ($potonganCuti > 0) {
                    $komponenGajiData[] = [
                        'jenis' => 'potongan',
                        'nama_komponen' => 'Potongan Cuti (' . $hariCuti . ' hari)',
                        'nominal' => -$potonganCuti, // Negative for potongan
                    ];
                    $totalGaji -= $potonganCuti;
                }
            }
        }

        // Create or update gaji
        $hariCuti = $rekap->jumlah_cuti + $rekap->jumlah_izin + $rekap->jumlah_sakit;
        $gajiData = [
            'karyawan_id' => $employee->id,
            'periode' => $rekap->periode,
            'hari_cuti' => $hariCuti,
            'potongan_cuti' => $potonganCuti ?? 0,
            'total_gaji' => max(0, $totalGaji), // Ensure non-negative
            'status' => 'draft',
            'dibuat_oleh' => Auth::id(),
        ];

        if ($existingGaji) {
            // Update existing gaji
            $gaji = $this->getRepository()->update($existingGaji->id, $gajiData);

            // Delete existing komponen gaji
            $existingKomponen = $this->komponenGajiRepository->findByGajiId($gaji->id);
            foreach ($existingKomponen as $komponen) {
                $this->komponenGajiRepository->delete($komponen->id);
            }
        } else {
            // Create new gaji
            $gaji = $this->getRepository()->create($gajiData);
        }

        // Create komponen gaji
        foreach ($komponenGajiData as $komponenData) {
            $komponenData['gaji_id'] = $gaji->id;
            $this->komponenGajiRepository->create($komponenData);
        }

        return $gaji->fresh(['komponenGaji']);
    }

    /**
     * Update gaji status.
     *
     * @param  int|string  $gajiId
     * @param  string  $status
     * @return \App\Models\Gaji
     */
    public function updateStatus($gajiId, string $status): Gaji
    {
        // Check permission
        if (!$this->hasPermission('mengelola gaji')) {
            abort(403, 'You do not have permission to update gaji status.');
        }

        // Validate status
        if (!in_array($status, ['draft', 'disetujui', 'dibayar'])) {
            abort(422, 'Invalid status. Must be one of: draft, disetujui, dibayar');
        }

        return $this->getRepository()->update($gajiId, ['status' => $status]);
    }

    /**
     * Find gaji records by periode.
     *
     * @param  string  $periode
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByPeriode(string $periode): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola gaji') && !$this->hasPermission('melihat gaji')) {
            abort(403, 'You do not have permission to view gaji records.');
        }

        return $this->getRepository()->findByPeriode($periode);
    }

    /**
     * Find gaji records by karyawan_id.
     *
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanId($karyawanId): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola gaji') && !$this->hasPermission('melihat gaji')) {
            abort(403, 'You do not have permission to view gaji records.');
        }

        return $this->getRepository()->findByKaryawanId($karyawanId);
    }

    /**
     * Find gaji records by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola gaji') && !$this->hasPermission('melihat gaji')) {
            abort(403, 'You do not have permission to view gaji records.');
        }

        return $this->getRepository()->findByStatus($status);
    }
}

