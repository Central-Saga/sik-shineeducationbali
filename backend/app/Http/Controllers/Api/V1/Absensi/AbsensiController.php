<?php

namespace App\Http\Controllers\Api\V1\Absensi;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Requests\Api\V1\Absensi\StoreAbsensiRequest;
use App\Http\Requests\Api\V1\Absensi\UpdateAbsensiRequest;
use App\Http\Resources\Api\V1\Absensi\AbsensiResource;
use App\Services\Contracts\AbsensiServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbsensiController extends BaseApiController
{
    /**
     * The absensi service instance.
     *
     * @var \App\Services\Contracts\AbsensiServiceInterface
     */
    protected AbsensiServiceInterface $absensiService;

    /**
     * Create a new absensi controller instance.
     *
     * @param  \App\Services\Contracts\AbsensiServiceInterface  $absensiService
     */
    public function __construct(AbsensiServiceInterface $absensiService)
    {
        $this->absensiService = $absensiService;
    }

    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // For karyawan role, filter by their employee_id
        if ($user && $user->hasRole('Karyawan')) {
            $employee = $user->employee;
            if (!$employee) {
                return $this->success(
                    AbsensiResource::collection(collect([])),
                    'Attendance records retrieved successfully'
                );
            }
            
            // Force filter by karyawan_id for karyawan
            $karyawanId = $employee->id;
            
            // Priority: date range > tanggal > status > all (for karyawan)
            if ($request->has('start_date') && $request->has('end_date')) {
                $query = $this->absensiService->findByKaryawanIdAndDateRange(
                    $karyawanId,
                    $request->start_date,
                    $request->end_date
                );
            }
            // Filter by tanggal if provided
            elseif ($request->has('tanggal')) {
                $query = $this->absensiService->findByKaryawanIdAndTanggal($karyawanId, $request->tanggal);
                $query = $query ? collect([$query]) : collect([]);
            }
            // Filter by status if provided
            elseif ($request->has('status_kehadiran')) {
                $query = $this->absensiService->findByKaryawanIdAndStatus(
                    $karyawanId,
                    $request->status_kehadiran
                );
            }
            // Get all for this karyawan
            else {
                $query = $this->absensiService->findByKaryawanId($karyawanId);
            }
        }
        // For Owner and Admin, allow all filters
        else {
            // Priority: date range > tanggal > karyawan_id + status > status > karyawan_id > all
            
            // Filter by date range if provided (highest priority)
            if ($request->has('start_date') && $request->has('end_date')) {
                if ($request->has('karyawan_id')) {
                    $query = $this->absensiService->findByKaryawanIdAndDateRange(
                        $request->karyawan_id,
                        $request->start_date,
                        $request->end_date
                    );
                } else {
                    $query = $this->absensiService->findByDateRange(
                        $request->start_date,
                        $request->end_date
                    );
                }
            }
            // Filter by tanggal if provided
            elseif ($request->has('tanggal')) {
                $query = $this->absensiService->findByTanggal($request->tanggal);
            }
            // Filter by karyawan_id and status if both provided
            elseif ($request->has('karyawan_id') && $request->has('status_kehadiran')) {
                $query = $this->absensiService->findByKaryawanIdAndStatus(
                    $request->karyawan_id,
                    $request->status_kehadiran
                );
            }
            // Filter by status_kehadiran if provided
            elseif ($request->has('status_kehadiran')) {
                $query = $this->absensiService->findByStatusKehadiran($request->status_kehadiran);
            }
            // Filter by karyawan_id if provided
            elseif ($request->has('karyawan_id')) {
                $query = $this->absensiService->findByKaryawanId($request->karyawan_id);
            }
            // Get all if no filters
            else {
                $query = $this->absensiService->getAll();
            }
        }

        // Ensure $query is a collection
        if (!($query instanceof \Illuminate\Support\Collection)) {
            $query = collect([$query])->filter();
        }

        // Load relationship - include log_absensi if requested
        $loadRelations = ['employee.user'];
        if ($request->has('include') && str_contains($request->include, 'log_absensi')) {
            $loadRelations[] = 'logAbsensi';
        }
        $query = $query->load($loadRelations);

        return $this->success(
            AbsensiResource::collection($query),
            'Attendance records retrieved successfully'
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\Absensi\StoreAbsensiRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreAbsensiRequest $request): JsonResponse
    {
        // Request sudah handle validation dan prepareForValidation
        $validated = $request->validated();

        // Handle foto upload if provided
        $fotoPath = null;
        $latitude = $validated['latitude'] ?? null;
        $longitude = $validated['longitude'] ?? null;
        $akurasi = $validated['akurasi'] ?? null;
        $jenis = $validated['jenis'] ?? null;

        if ($request->hasFile('foto_selfie')) {
            try {
                $file = $request->file('foto_selfie');
                
                // Validate file is valid
                if (!$file->isValid()) {
                    return $this->error('File foto selfie tidak valid.', 422);
                }
                
                $year = date('Y');
                $month = date('m');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = "selfies/{$year}/{$month}";
                
                // Ensure directory exists
                $fullPath = storage_path("app/public/{$path}");
                if (!file_exists($fullPath)) {
                    \Illuminate\Support\Facades\File::makeDirectory($fullPath, 0755, true);
                }
                
                $fotoPath = $file->storeAs($path, $filename, 'public');
                
                // Verify file was stored
                if (!$fotoPath) {
                    return $this->error('Gagal menyimpan file foto selfie.', 500);
                }
            } catch (\Exception $e) {
                \Log::error('Foto upload error: ' . $e->getMessage());
                return $this->error('Gagal mengupload foto selfie: ' . $e->getMessage(), 500);
            }
        }

        // Remove foto_selfie, latitude, longitude, akurasi, jenis from validated data
        // (these are not part of absensi table, but used for log_absensi)
        unset($validated['foto_selfie'], $validated['latitude'], $validated['longitude'], $validated['akurasi'], $validated['jenis']);

        // Use checkInOut method if jenis is provided (check-in/check-out mode)
        // Otherwise use normal create method
        if ($jenis) {
            $absensi = $this->absensiService->checkInOut(array_merge($validated, ['jenis' => $jenis]));
        } else {
            $absensi = $this->absensiService->create($validated);
        }
        
        $absensi->load('employee.user');

        // If foto and geo location are provided, create log absensi
        if ($fotoPath && $latitude !== null && $longitude !== null && $jenis) {
            $logAbsensiService = app(\App\Services\Contracts\LogAbsensiServiceInterface::class);
            
            // Use current time for check-in/check-out
            $currentTime = now()->format('Y-m-d H:i:s');
            
            // Koordinat SHINE EDUCATION BALI: -8.5207971, 115.1378314
            // Radius maksimal: 50 meter
            $logData = [
                'absensi_id' => $absensi->id,
                'jenis' => $jenis,
                'waktu' => $currentTime,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'akurasi' => $akurasi ?? 0,
                'foto_selfie' => $fotoPath,
                'sumber' => $absensi->sumber_absen ?? 'web',
                'latitude_referensi' => -8.5207971,
                'longitude_referensi' => 115.1378314,
                'radius_max' => 50,
            ];

            $logAbsensiService->create($logData);
            $absensi->load('logAbsensi');
        }

        // Return success (not created) if it was an update (check-out)
        if ($jenis === 'check_out') {
            return $this->success(
                new AbsensiResource($absensi),
                'Check-out berhasil dilakukan'
            );
        }

        return $this->created(
            new AbsensiResource($absensi),
            'Attendance record created successfully'
        );
    }

    /**
     * Display the specified resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, $id): JsonResponse
    {
        $absensi = $this->absensiService->getById($id);
        
        // For karyawan, check if they can access this absensi
        $user = $request->user();
        if ($user && $user->hasRole('Karyawan')) {
            $employee = $user->employee;
            if (!$employee || $absensi->karyawan_id !== $employee->id) {
                return $this->forbidden('You do not have permission to access this attendance record.');
            }
        }
        
        $absensi->load(['employee.user', 'logAbsensi']);

        return $this->success(
            new AbsensiResource($absensi),
            'Attendance record retrieved successfully'
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\Absensi\UpdateAbsensiRequest  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateAbsensiRequest $request, $id): JsonResponse
    {
        // Request sudah handle validation dan prepareForValidation
        $validated = $request->validated();

        $absensi = $this->absensiService->update($id, $validated);
        $absensi->load('employee.user');

        return $this->success(
            new AbsensiResource($absensi),
            'Attendance record updated successfully'
        );
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        $this->absensiService->delete($id);

        return $this->success(
            null,
            'Attendance record deleted successfully'
        );
    }

    /**
     * Get attendance records by employee ID.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string|int  $karyawanId
     * @return \Illuminate\Http\JsonResponse
     */
    public function byKaryawan(Request $request, $karyawanId): JsonResponse
    {
        $query = $this->absensiService->findByKaryawanId($karyawanId);

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query = $this->absensiService->findByKaryawanIdAndDateRange(
                $karyawanId,
                $request->start_date,
                $request->end_date
            );
        }

        // Filter by status if provided
        if ($request->has('status_kehadiran')) {
            $query = $this->absensiService->findByKaryawanIdAndStatus(
                $karyawanId,
                $request->status_kehadiran
            );
        }

        $query = $query->load('employee.user');

        return $this->success(
            AbsensiResource::collection($query),
            'Attendance records retrieved successfully'
        );
    }

    /**
     * Get attendance record by employee ID and date.
     *
     * @param  string|int  $karyawanId
     * @param  string  $tanggal
     * @return \Illuminate\Http\JsonResponse
     */
    public function byKaryawanAndTanggal($karyawanId, $tanggal): JsonResponse
    {
        $absensi = $this->absensiService->findByKaryawanIdAndTanggal($karyawanId, $tanggal);

        if (!$absensi) {
            return $this->notFound('Attendance record not found for this employee on this date');
        }

        $absensi->load('employee.user');

        return $this->success(
            new AbsensiResource($absensi),
            'Attendance record retrieved successfully'
        );
    }

    /**
     * Get present attendance records (hadir).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function hadir(Request $request): JsonResponse
    {
        $query = $this->absensiService->findHadir();

        // Filter by date if provided
        if ($request->has('tanggal')) {
            $query = $query->filter(function ($absensi) use ($request) {
                return $absensi->tanggal->format('Y-m-d') === $request->tanggal;
            });
        }

        // Load relationship
        $query = $query->load('employee.user');

        return $this->success(
            AbsensiResource::collection($query),
            'Present attendance records retrieved successfully'
        );
    }
}
