<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\RealisasiSesi;
use App\Models\SesiKerja;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RealisasiSesi>
 */
class RealisasiSesiFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = RealisasiSesi::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(['diajukan', 'disetujui', 'ditolak']);
        $sumber = fake()->randomElement(['jadwal', 'manual']);
        
        $data = [
            'karyawan_id' => Employee::factory(),
            'tanggal' => fake()->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'sesi_kerja_id' => SesiKerja::factory(),
            'status' => $status,
            'sumber' => $sumber,
            'catatan' => fake()->optional(0.7)->sentence(),
        ];

        // Jika status disetujui atau ditolak, set disetujui_oleh
        if ($status === 'disetujui' || $status === 'ditolak') {
            $data['disetujui_oleh'] = User::factory();
        }

        return $data;
    }

    /**
     * Indicate that the realisasi sesi is diajukan.
     */
    public function diajukan(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'diajukan',
                'disetujui_oleh' => null,
            ];
        });
    }

    /**
     * Indicate that the realisasi sesi is disetujui.
     */
    public function disetujui(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'disetujui',
                'disetujui_oleh' => User::factory(),
            ];
        });
    }

    /**
     * Indicate that the realisasi sesi is ditolak.
     */
    public function ditolak(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'ditolak',
                'disetujui_oleh' => User::factory(),
                'catatan' => fake()->sentence(), // Wajib ada catatan untuk ditolak
            ];
        });
    }

    /**
     * Indicate that the realisasi sesi sumber is jadwal.
     */
    public function jadwal(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'sumber' => 'jadwal',
            ];
        });
    }

    /**
     * Indicate that the realisasi sesi sumber is manual.
     */
    public function manual(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'sumber' => 'manual',
            ];
        });
    }
}
