<?php

namespace App\Services\RekapBulanan;

use App\Models\Employee;
use App\Models\RekapBulanan;
use App\Repositories\Contracts\AbsensiRepositoryInterface;
use App\Repositories\Contracts\CutiRepositoryInterface;
use App\Repositories\Contracts\RekapBulananRepositoryInterface;
use App\Repositories\Contracts\RealisasiSesiRepositoryInterface;
use App\Services\Base\BaseService;
use App\Services\Contracts\RekapBulananServiceInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class RekapBulananService extends BaseService implements RekapBulananServiceInterface
{
    protected AbsensiRepositoryInterface $absensiRepository;
    protected CutiRepositoryInterface $cutiRepository;
    protected RealisasiSesiRepositoryInterface $realisasiSesiRepository;

    /**
     * Create a new rekap bulanan service instance.
     *
     * @param  \App\Repositories\Contracts\RekapBulananRepositoryInterface  $repository
     * @param  \App\Repositories\Contracts\AbsensiRepositoryInterface  $absensiRepository
     * @param  \App\Repositories\Contracts\CutiRepositoryInterface  $cutiRepository
     * @param  \App\Repositories\Contracts\RealisasiSesiRepositoryInterface  $realisasiSesiRepository
     */
    public function __construct(
        RekapBulananRepositoryInterface $repository,
        AbsensiRepositoryInterface $absensiRepository,
        CutiRepositoryInterface $cutiRepository,
        RealisasiSesiRepositoryInterface $realisasiSesiRepository
    ) {
        parent::__construct($repository);
        $this->absensiRepository = $absensiRepository;
        $this->cutiRepository = $cutiRepository;
        $this->realisasiSesiRepository = $realisasiSesiRepository;
    }

    /**
     * Get repository instance with proper type hint.
     *
     * @return \App\Repositories\Contracts\RekapBulananRepositoryInterface
     */
    protected function getRepository(): RekapBulananRepositoryInterface
    {
        return $this->repository;
    }

    /**
     * Generate rekap bulanan for all active employees for a given periode.
     *
     * @param  string  $periode
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function generateRekapBulanan(string $periode): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola rekap bulanan')) {
            abort(403, 'You do not have permission to generate rekap bulanan.');
        }

        // Validate periode format (YYYY-MM)
        if (!preg_match('/^\d{4}-\d{2}$/', $periode)) {
            abort(422, 'Invalid periode format. Use YYYY-MM format.');
        }

        return DB::transaction(function () use ($periode) {
            $employees = Employee::active()->get();
            $rekapBulananList = RekapBulanan::newCollection();

            foreach ($employees as $employee) {
                $rekapBulanan = $this->calculateRekapForEmployee($employee, $periode);
                $rekapBulananList->push($rekapBulanan);
            }

            return $rekapBulananList;
        });
    }

    /**
     * Calculate and create/update rekap bulanan for a specific employee.
     *
     * @param  \App\Models\Employee  $employee
     * @param  string  $periode
     * @return \App\Models\RekapBulanan
     */
    public function calculateRekapForEmployee($employee, string $periode): RekapBulanan
    {
        // Parse periode to get start and end date
        $startDate = Carbon::createFromFormat('Y-m', $periode)->startOfMonth();
        $endDate = Carbon::createFromFormat('Y-m', $periode)->endOfMonth();
        $startDateStr = $startDate->format('Y-m-d');
        $endDateStr = $endDate->format('Y-m-d');

        // Get all absensi in periode
        $absensiList = $this->absensiRepository->findByKaryawanIdAndDateRange(
            $employee->id,
            $startDateStr,
            $endDateStr
        );

        // Get all cuti in periode
        $cutiList = $this->cutiRepository->findByKaryawanIdAndDateRange(
            $employee->id,
            $startDateStr,
            $endDateStr
        );

        // Get all realisasi sesi in periode
        $realisasiSesiList = $this->realisasiSesiRepository->findByKaryawanIdAndDateRange(
            $employee->id,
            $startDateStr,
            $endDateStr
        );

        // Calculate jumlah hadir
        $jumlahHadir = $absensiList->where('status_kehadiran', 'hadir')->count();

        // Calculate jumlah izin: dari absensi dengan status_kehadiran = 'izin' + cuti dengan jenis = 'izin' dan status = 'disetujui'
        $jumlahIzin = $absensiList->where('status_kehadiran', 'izin')->count();
        $jumlahIzin += $cutiList->where('jenis', 'izin')
            ->where('status', 'disetujui')
            ->count();

        // Calculate jumlah sakit: dari cuti dengan jenis = 'sakit' dan status = 'disetujui'
        $jumlahSakit = $cutiList->where('jenis', 'sakit')
            ->where('status', 'disetujui')
            ->count();

        // Calculate jumlah cuti: dari cuti dengan jenis = 'cuti' dan status = 'disetujui'
        $jumlahCuti = $cutiList->where('jenis', 'cuti')
            ->where('status', 'disetujui')
            ->count();

        // Calculate hari kerja dalam periode (exclude Sunday)
        $hariKerja = 0;
        $currentDate = $startDate->copy();
        while ($currentDate->lte($endDate)) {
            if ($currentDate->dayOfWeek !== Carbon::SUNDAY) {
                $hariKerja++;
            }
            $currentDate->addDay();
        }

        // Calculate jumlah alfa: hari kerja - (hadir + izin + sakit + cuti)
        $jumlahAlfa = max(0, $hariKerja - ($jumlahHadir + $jumlahIzin + $jumlahSakit + $jumlahCuti));

        // Calculate sesi: hanya yang status = 'disetujui'
        $realisasiSesiDisetujui = $realisasiSesiList->where('status', 'disetujui');

        // Calculate jumlah sesi coding dan non-coding
        $jumlahSesiCoding = 0;
        $jumlahSesiNonCoding = 0;
        $nilaiSesiCoding = 0;
        $nilaiSesiNonCoding = 0;

        foreach ($realisasiSesiDisetujui as $realisasiSesi) {
            $sesiKerja = $realisasiSesi->sesiKerja;
            if (!$sesiKerja) {
                continue;
            }

            if ($sesiKerja->kategori === 'coding') {
                $jumlahSesiCoding++;
                $nilaiSesiCoding += (float) $sesiKerja->tarif;
            } else {
                $jumlahSesiNonCoding++;
                $nilaiSesiNonCoding += (float) $sesiKerja->tarif;
            }
        }

        $totalPendapatanSesi = $nilaiSesiCoding + $nilaiSesiNonCoding;

        // Check if rekap already exists (for overwrite)
        $existingRekap = $this->getRepository()->findByPeriodeAndKaryawanId($periode, $employee->id);

        $rekapData = [
            'karyawan_id' => $employee->id,
            'periode' => $periode,
            'jumlah_hadir' => $jumlahHadir,
            'jumlah_izin' => $jumlahIzin,
            'jumlah_sakit' => $jumlahSakit,
            'jumlah_cuti' => $jumlahCuti,
            'jumlah_alfa' => $jumlahAlfa,
            'jumlah_sesi_coding' => $jumlahSesiCoding,
            'jumlah_sesi_non_coding' => $jumlahSesiNonCoding,
            'nilai_sesi_coding' => $nilaiSesiCoding,
            'nilai_sesi_non_coding' => $nilaiSesiNonCoding,
            'total_pendapatan_sesi' => $totalPendapatanSesi,
        ];

        if ($existingRekap) {
            // Update existing rekap (overwrite)
            return $this->getRepository()->update($existingRekap->id, $rekapData);
        } else {
            // Create new rekap
            return $this->getRepository()->create($rekapData);
        }
    }

    /**
     * Find rekap bulanan records by periode.
     *
     * @param  string  $periode
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByPeriode(string $periode): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola rekap bulanan') && !$this->hasPermission('melihat gaji')) {
            abort(403, 'You do not have permission to view rekap bulanan records.');
        }

        return $this->getRepository()->findByPeriode($periode);
    }

    /**
     * Find rekap bulanan records by karyawan_id.
     *
     * @param  int|string  $karyawanId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKaryawanId($karyawanId): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola rekap bulanan') && !$this->hasPermission('melihat gaji')) {
            abort(403, 'You do not have permission to view rekap bulanan records.');
        }

        return $this->getRepository()->findByKaryawanId($karyawanId);
    }

    /**
     * Find rekap bulanan record by periode and karyawan_id.
     *
     * @param  string  $periode
     * @param  int|string  $karyawanId
     * @return \App\Models\RekapBulanan|null
     */
    public function findByPeriodeAndKaryawanId(string $periode, $karyawanId): ?RekapBulanan
    {
        // Check permission
        if (!$this->hasPermission('mengelola rekap bulanan') && !$this->hasPermission('melihat gaji')) {
            abort(403, 'You do not have permission to view rekap bulanan records.');
        }

        return $this->getRepository()->findByPeriodeAndKaryawanId($periode, $karyawanId);
    }
}

