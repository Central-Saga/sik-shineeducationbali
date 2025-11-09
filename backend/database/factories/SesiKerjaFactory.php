<?php

namespace Database\Factories;

use App\Models\SesiKerja;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SesiKerja>
 */
class SesiKerjaFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = SesiKerja::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $kategori = fake()->randomElement(['coding', 'non_coding']);
        $hari = fake()->randomElement(['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu']);
        
        // Tarif sesuai kategori: coding 30.000, non_coding 25.000
        $tarif = $kategori === 'coding' ? 30000 : 25000;

        // Generate jam mulai dan selesai untuk sesi
        $jamMulaiHour = fake()->numberBetween(8, 16);
        $jamMulaiMinute = fake()->randomElement([0, 30]);
        $jamSelesaiHour = $jamMulaiHour + 1;
        $jamSelesaiMinute = $jamMulaiMinute;

        return [
            'kategori' => $kategori,
            'hari' => $hari,
            'nomor_sesi' => fake()->numberBetween(1, 8),
            'jam_mulai' => sprintf('%02d:%02d:00', $jamMulaiHour, $jamMulaiMinute),
            'jam_selesai' => sprintf('%02d:%02d:00', $jamSelesaiHour, $jamSelesaiMinute),
            'tarif' => $tarif,
            'status' => fake()->randomElement(['aktif', 'non aktif']),
        ];
    }

    /**
     * Indicate that the session is kategori 'coding'.
     */
    public function coding(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'kategori' => 'coding',
                'tarif' => 30000,
            ];
        });
    }

    /**
     * Indicate that the session is kategori 'non_coding'.
     */
    public function nonCoding(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'kategori' => 'non_coding',
                'tarif' => 25000,
            ];
        });
    }

    /**
     * Indicate that the session status is 'aktif'.
     */
    public function aktif(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'aktif',
            ];
        });
    }

    /**
     * Indicate that the session status is 'non aktif'.
     */
    public function nonAktif(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'non aktif',
            ];
        });
    }

    /**
     * Indicate that the session is for a specific hari.
     */
    public function hari(string $hari): static
    {
        return $this->state(function (array $attributes) use ($hari) {
            return [
                'hari' => $hari,
            ];
        });
    }
}

