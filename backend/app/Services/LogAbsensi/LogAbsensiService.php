<?php

namespace App\Services\LogAbsensi;

use App\Models\LogAbsensi;
use App\Repositories\Contracts\LogAbsensiRepositoryInterface;
use App\Services\Base\BaseService;
use App\Services\Contracts\LogAbsensiServiceInterface;
use Illuminate\Database\Eloquent\Collection;

class LogAbsensiService extends BaseService implements LogAbsensiServiceInterface
{
    /**
     * Create a new log absensi service instance.
     *
     * @param  \App\Repositories\Contracts\LogAbsensiRepositoryInterface  $repository
     */
    public function __construct(LogAbsensiRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get repository instance with proper type hint.
     *
     * @return \App\Repositories\Contracts\LogAbsensiRepositoryInterface
     */
    protected function getRepository(): LogAbsensiRepositoryInterface
    {
        return $this->repository;
    }

    /**
     * Get all log attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getAll(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance log records.');
        }

        return parent::getAll();
    }

    /**
     * Get a log attendance record by ID.
     *
     * @param  int|string  $id
     * @return \App\Models\LogAbsensi
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getById($id): LogAbsensi
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance log records.');
        }

        return parent::getById($id);
    }

    /**
     * Create a new log attendance record.
     *
     * @param  array<string, mixed>  $data
     * @return \App\Models\LogAbsensi
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function create(array $data): LogAbsensi
    {
        // Check permission - bisa melakukan absensi atau mengelola absensi
        if (!$this->hasPermission('melakukan absensi') && !$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to create attendance log records.');
        }

        // Auto-fill nilai default untuk koordinat referensi dan radius jika tidak diisi
        // Koordinat SHINE EDUCATION BALI: -8.5207971, 115.1378314
        if (!isset($data['latitude_referensi'])) {
            $data['latitude_referensi'] = -8.5207971;
        }
        if (!isset($data['longitude_referensi'])) {
            $data['longitude_referensi'] = 115.1378314;
        }
        // Radius maksimal: 50 meter (tidak perlu radius_min lagi)
        if (!isset($data['radius_max'])) {
            $data['radius_max'] = 50;
        }

        // Validasi GPS berdasarkan radius maksimal dan koordinat referensi
        if (isset($data['latitude']) && isset($data['longitude'])) {
            $data['validasi_gps'] = $this->validateGPSLocation(
                $data['latitude'],
                $data['longitude'],
                $data['latitude_referensi'],
                $data['longitude_referensi'],
                $data['radius_max']
            );
        }

        return parent::create($data);
    }

    /**
     * Validate GPS location based on reference coordinates and maximum radius.
     *
     * @param  float  $latitude
     * @param  float  $longitude
     * @param  float  $latitudeReferensi
     * @param  float  $longitudeReferensi
     * @param  int  $radiusMax
     * @return bool
     */
    protected function validateGPSLocation(
        float $latitude,
        float $longitude,
        float $latitudeReferensi,
        float $longitudeReferensi,
        int $radiusMax
    ): bool {
        // Calculate distance using Haversine formula
        $distance = $this->calculateDistance(
            $latitudeReferensi,
            $longitudeReferensi,
            $latitude,
            $longitude
        );

        // Valid jika jarak tidak melebihi radius maksimal (distance <= radiusMax) dalam meter
        // Lokasi absensi harus berada dalam radius maksimal 50 meter dari koordinat referensi SHINE EDUCATION BALI
        return $distance <= $radiusMax;
    }

    /**
     * Calculate distance between two coordinates using Haversine formula.
     *
     * @param  float  $lat1
     * @param  float  $lon1
     * @param  float  $lat2
     * @param  float  $lon2
     * @return float Distance in meters
     */
    protected function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // Earth radius in meters

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Update a log attendance record by ID.
     *
     * @param  int|string  $id
     * @param  array<string, mixed>  $data
     * @return \App\Models\LogAbsensi
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update($id, array $data): LogAbsensi
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to edit attendance log records.');
        }

        // Get existing record to get default values if not provided
        $existingRecord = $this->getRepository()->find($id);

        // Auto-fill nilai default jika tidak diisi
        // Koordinat SHINE EDUCATION BALI: -8.5207971, 115.1378314
        if (!isset($data['latitude_referensi']) && $existingRecord) {
            $data['latitude_referensi'] = $existingRecord->latitude_referensi ?? -8.5207971;
        } elseif (!isset($data['latitude_referensi'])) {
            $data['latitude_referensi'] = -8.5207971;
        }

        if (!isset($data['longitude_referensi']) && $existingRecord) {
            $data['longitude_referensi'] = $existingRecord->longitude_referensi ?? 115.1378314;
        } elseif (!isset($data['longitude_referensi'])) {
            $data['longitude_referensi'] = 115.1378314;
        }

        // Radius maksimal: 50 meter
        if (!isset($data['radius_max']) && $existingRecord) {
            $data['radius_max'] = $existingRecord->radius_max ?? 50;
        } elseif (!isset($data['radius_max'])) {
            $data['radius_max'] = 50;
        }

        // Validasi GPS jika latitude/longitude diubah atau koordinat referensi/radius diubah
        $latitude = $data['latitude'] ?? ($existingRecord ? $existingRecord->latitude : null);
        $longitude = $data['longitude'] ?? ($existingRecord ? $existingRecord->longitude : null);

        if ($latitude !== null && $longitude !== null) {
            $data['validasi_gps'] = $this->validateGPSLocation(
                $latitude,
                $longitude,
                $data['latitude_referensi'],
                $data['longitude_referensi'],
                $data['radius_max']
            );
        }

        return parent::update($id, $data);
    }

    /**
     * Delete a log attendance record by ID.
     *
     * @param  int|string  $id
     * @return bool
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function delete($id): bool
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to delete attendance log records.');
        }

        return parent::delete($id);
    }

    /**
     * Find log attendance records by absensi ID.
     *
     * @param  int|string  $absensiId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByAbsensiId($absensiId): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi') && !$this->hasPermission('melakukan absensi')) {
            abort(403, 'You do not have permission to view attendance log records.');
        }

        return $this->getRepository()->findByAbsensiId($absensiId);
    }

    /**
     * Find log attendance records by absensi ID and type.
     *
     * @param  int|string  $absensiId
     * @param  string  $jenis
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByAbsensiIdAndJenis($absensiId, string $jenis): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi') && !$this->hasPermission('melakukan absensi')) {
            abort(403, 'You do not have permission to view attendance log records.');
        }

        return $this->getRepository()->findByAbsensiIdAndJenis($absensiId, $jenis);
    }

    /**
     * Find check-in log attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findCheckIn(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance log records.');
        }

        return $this->getRepository()->findCheckIn();
    }

    /**
     * Find check-out log attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findCheckOut(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance log records.');
        }

        return $this->getRepository()->findCheckOut();
    }

    /**
     * Find log attendance records by date range.
     *
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByDateRange(string $startDate, string $endDate): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance log records.');
        }

        return $this->getRepository()->findByDateRange($startDate, $endDate);
    }

    /**
     * Find log attendance records by absensi ID and date range.
     *
     * @param  int|string  $absensiId
     * @param  string  $startDate
     * @param  string  $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByAbsensiIdAndDateRange($absensiId, string $startDate, string $endDate): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi') && !$this->hasPermission('melakukan absensi')) {
            abort(403, 'You do not have permission to view attendance log records.');
        }

        return $this->getRepository()->findByAbsensiIdAndDateRange($absensiId, $startDate, $endDate);
    }

    /**
     * Find validated GPS log attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findValidated(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance log records.');
        }

        return $this->getRepository()->findValidated();
    }

    /**
     * Find unvalidated GPS log attendance records.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findUnvalidated(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance log records.');
        }

        return $this->getRepository()->findUnvalidated();
    }

    /**
     * Find log attendance records by source.
     *
     * @param  string  $sumber
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findBySumber(string $sumber): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi')) {
            abort(403, 'You do not have permission to view attendance log records.');
        }

        return $this->getRepository()->findBySumber($sumber);
    }

    /**
     * Find check-in log for specific absensi.
     *
     * @param  int|string  $absensiId
     * @return \App\Models\LogAbsensi|null
     */
    public function findCheckInByAbsensiId($absensiId): ?LogAbsensi
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi') && !$this->hasPermission('melakukan absensi')) {
            abort(403, 'You do not have permission to view attendance log records.');
        }

        return $this->getRepository()->findCheckInByAbsensiId($absensiId);
    }

    /**
     * Find check-out log for specific absensi.
     *
     * @param  int|string  $absensiId
     * @return \App\Models\LogAbsensi|null
     */
    public function findCheckOutByAbsensiId($absensiId): ?LogAbsensi
    {
        // Check permission
        if (!$this->hasPermission('mengelola absensi') && !$this->hasPermission('melakukan absensi')) {
            abort(403, 'You do not have permission to view attendance log records.');
        }

        return $this->getRepository()->findCheckOutByAbsensiId($absensiId);
    }
}
