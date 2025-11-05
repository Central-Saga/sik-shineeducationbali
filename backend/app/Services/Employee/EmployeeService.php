<?php

namespace App\Services\Employee;

use App\Models\Employee;
use App\Models\User;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use App\Services\Base\BaseService;
use App\Services\Contracts\EmployeeServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EmployeeService extends BaseService implements EmployeeServiceInterface
{
    /**
     * Create a new employee service instance.
     *
     * @param  \App\Repositories\Contracts\EmployeeRepositoryInterface  $repository
     */
    public function __construct(EmployeeRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * Get repository instance with proper type hint.
     *
     * @return \App\Repositories\Contracts\EmployeeRepositoryInterface
     */
    protected function getRepository(): EmployeeRepositoryInterface
    {
        return $this->repository;
    }

    /**
     * Get all employees.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getAll(): Collection
    {
        // Check permission
        if (!$this->hasPermission('mengelola karyawan')) {
            abort(403, 'You do not have permission to view employees.');
        }

        return parent::getAll();
    }

    /**
     * Get an employee by ID.
     *
     * @param  int|string  $id
     * @return \App\Models\Employee
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function getById($id): Employee
    {
        // Check permission
        if (!$this->hasPermission('mengelola karyawan')) {
            abort(403, 'You do not have permission to view employees.');
        }

        return parent::getById($id);
    }

    /**
     * Create a new employee.
     *
     * @param  array<string, mixed>  $data
     * @return \App\Models\Employee
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function create(array $data): Employee
    {
        // Check permission
        if (!$this->hasPermission('mengelola karyawan')) {
            abort(403, 'You do not have permission to create employees.');
        }

        // Extract user data from employee data
        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ];

        // Remove user data from employee data
        $employeeData = $data;
        unset($employeeData['name'], $employeeData['email'], $employeeData['password']);

        // Create user and employee in a transaction
        return DB::transaction(function () use ($userData, $employeeData) {
            // Create user first
            $user = User::create($userData);

            // Set user_id in employee data
            $employeeData['user_id'] = $user->id;

            // Generate kode_karyawan jika belum ada
            if (empty($employeeData['kode_karyawan'])) {
                $employeeData['kode_karyawan'] = $this->generateKodeKaryawan();
            }

            // Create employee
            return parent::create($employeeData);
        });
    }

    /**
     * Update an employee by ID.
     *
     * @param  int|string  $id
     * @param  array<string, mixed>  $data
     * @return \App\Models\Employee
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function update($id, array $data): Employee
    {
        // Check permission
        if (!$this->hasPermission('mengelola karyawan')) {
            abort(403, 'You do not have permission to edit employees.');
        }

        return parent::update($id, $data);
    }

    /**
     * Delete an employee by ID.
     *
     * @param  int|string  $id
     * @return bool
     * @throws \App\Exceptions\NotFoundException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function delete($id): bool
    {
        // Check permission
        if (!$this->hasPermission('mengelola karyawan')) {
            abort(403, 'You do not have permission to delete employees.');
        }

        return parent::delete($id);
    }

    /**
     * Find employees by user ID.
     *
     * @param  int|string  $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByUserId($userId): Collection
    {
        return $this->getRepository()->findByUserId($userId);
    }

    /**
     * Find employee by user ID.
     *
     * @param  int|string  $userId
     * @return \App\Models\Employee|null
     */
    public function findOneByUserId($userId): ?Employee
    {
        return $this->getRepository()->findOneByUserId($userId);
    }

    /**
     * Find employees by category.
     *
     * @param  string  $kategori
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByKategori(string $kategori): Collection
    {
        return $this->getRepository()->findByKategori($kategori);
    }

    /**
     * Find employees by status.
     *
     * @param  string  $status
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByStatus(string $status): Collection
    {
        return $this->getRepository()->findByStatus($status);
    }

    /**
     * Find active employees.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findActive(): Collection
    {
        return $this->getRepository()->findActive();
    }

    /**
     * Find employees by salary type.
     *
     * @param  string  $tipeGaji
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function findByTipeGaji(string $tipeGaji): Collection
    {
        return $this->getRepository()->findByTipeGaji($tipeGaji);
    }

    /**
     * Generate unique employee code (SEB + 4 random digits, e.g., SEB1234).
     *
     * @return string
     */
    protected function generateKodeKaryawan(): string
    {
        $maxAttempts = 100; // Prevent infinite loop
        $attempts = 0;

        do {
            // Generate 4 random digits (1000-9999)
            $randomDigits = str_pad((string) rand(1000, 9999), 4, '0', STR_PAD_LEFT);
            $kodeKaryawan = 'SEB' . $randomDigits;

            // Check if code already exists
            $exists = DB::table('karyawan')
                ->where('kode_karyawan', $kodeKaryawan)
                ->exists();

            $attempts++;

            if (!$exists) {
                return $kodeKaryawan;
            }

        } while ($attempts < $maxAttempts);

        // If somehow all attempts failed (very unlikely with 9000 possible combinations)
        // Fallback to timestamp-based code
        return 'SEB' . substr(time(), -4);
    }
}

