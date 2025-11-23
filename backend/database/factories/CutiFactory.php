<?php

namespace Database\Factories;

use App\Models\Cuti;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Cuti>
 */
class CutiFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Cuti::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $jenis = fake()->randomElement(['izin', 'sakit']);
        $status = fake()->randomElement(['diajukan', 'disetujui', 'ditolak']);

        // Generate catatan berdasarkan jenis
        $catatanMap = [
            'izin' => [
                'Izin pribadi',
                'Izin keluarga',
                'Izin acara keluarga',
                'Izin keperluan pribadi',
                'Izin keperluan mendesak',
            ],
            'sakit' => [
                'Sakit demam',
                'Sakit kepala',
                'Sakit perut',
                'Sakit flu',
                'Sakit dengan surat dokter',
            ],
        ];

        $catatan = fake()->randomElement($catatanMap[$jenis]);

        // Jika status disetujui, perlu disetujui_oleh
        $disetujuiOleh = null;
        if ($status === 'disetujui') {
            // Ambil user dengan role admin atau owner
            $adminUser = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['Admin', 'Owner']);
            })->first();

            if ($adminUser) {
                $disetujuiOleh = $adminUser->id;
            }
        }

        return [
            'karyawan_id' => Employee::factory(),
            'tanggal' => fake()->dateTimeBetween('-30 days', '+30 days')->format('Y-m-d'),
            'jenis' => $jenis,
            'status' => $status,
            'disetujui_oleh' => $disetujuiOleh,
            'catatan' => $catatan,
        ];
    }

    /**
     * Indicate that the leave request is jenis 'cuti'.
     */
    public function cuti(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'jenis' => 'cuti',
                'catatan' => fake()->randomElement([
                    'Cuti tahunan',
                    'Cuti bersama',
                    'Cuti melahirkan',
                    'Cuti haji',
                    'Cuti besar',
                ]),
            ];
        });
    }

    /**
     * Indicate that the leave request is jenis 'izin'.
     */
    public function izin(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'jenis' => 'izin',
                'catatan' => fake()->randomElement([
                    'Izin pribadi',
                    'Izin keluarga',
                    'Izin acara keluarga',
                    'Izin keperluan pribadi',
                    'Izin keperluan mendesak',
                ]),
            ];
        });
    }

    /**
     * Indicate that the leave request is jenis 'sakit'.
     */
    public function sakit(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'jenis' => 'sakit',
                'catatan' => fake()->randomElement([
                    'Sakit demam',
                    'Sakit kepala',
                    'Sakit perut',
                    'Sakit flu',
                    'Sakit dengan surat dokter',
                ]),
            ];
        });
    }

    /**
     * Indicate that the leave request status is 'diajukan'.
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
     * Indicate that the leave request status is 'disetujui'.
     */
    public function disetujui(): static
    {
        return $this->state(function (array $attributes) {
            $adminUser = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['Admin', 'Owner']);
            })->first();

            return [
                'status' => 'disetujui',
                'disetujui_oleh' => $adminUser?->id,
            ];
        });
    }

    /**
     * Indicate that the leave request status is 'ditolak'.
     */
    public function ditolak(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'ditolak',
                'disetujui_oleh' => null,
            ];
        });
    }
}
