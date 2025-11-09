<?php

namespace Database\Factories;

use App\Models\Absensi;
use App\Models\LogAbsensi;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LogAbsensi>
 */
class LogAbsensiFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = LogAbsensi::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Koordinat Bali (sekitar Denpasar)
        $baliLatitude = -8.6705; // Base latitude untuk Denpasar
        $baliLongitude = 115.2126; // Base longitude untuk Denpasar
        
        // Random offset untuk variasi lokasi (dalam radius ~5km)
        $latitude = $baliLatitude + (fake()->randomFloat(6, -0.05, 0.05));
        $longitude = $baliLongitude + (fake()->randomFloat(6, -0.05, 0.05));
        
        // Akurasi GPS dalam meter (biasanya 5-50 meter untuk GPS mobile)
        $akurasi = fake()->numberBetween(5, 50);
        
        // Generate path foto selfie
        $year = fake()->year();
        $month = str_pad(fake()->month(), 2, '0', STR_PAD_LEFT);
        $filename = fake()->uuid() . '.jpg';
        $fotoSelfie = "selfies/{$year}/{$month}/{$filename}";
        
        return [
            'absensi_id' => Absensi::factory(),
            'jenis' => fake()->randomElement(['check_in', 'check_out']),
            'waktu' => fake()->dateTimeBetween('-30 days', 'now'),
            'latitude' => $latitude,
            'longitude' => $longitude,
            'akurasi' => $akurasi,
            'foto_selfie' => $fotoSelfie,
            'sumber' => fake()->randomElement(['mobile', 'web']),
            'validasi_gps' => fake()->boolean(70), // 70% chance of being validated
        ];
    }

    /**
     * Indicate that the log is a check-in.
     */
    public function checkIn(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'jenis' => 'check_in',
                'waktu' => fake()->dateTimeBetween('-30 days', 'now')->setTime(
                    fake()->numberBetween(6, 9), // 6-9 AM
                    fake()->numberBetween(0, 59),
                    0
                ),
            ];
        });
    }

    /**
     * Indicate that the log is a check-out.
     */
    public function checkOut(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'jenis' => 'check_out',
                'waktu' => fake()->dateTimeBetween('-30 days', 'now')->setTime(
                    fake()->numberBetween(16, 19), // 4-7 PM
                    fake()->numberBetween(0, 59),
                    0
                ),
            ];
        });
    }

    /**
     * Indicate that the log is from mobile source.
     */
    public function mobile(): static
    {
        return $this->state(fn (array $attributes) => [
            'sumber' => 'mobile',
        ]);
    }

    /**
     * Indicate that the log is from web source.
     */
    public function web(): static
    {
        return $this->state(fn (array $attributes) => [
            'sumber' => 'web',
        ]);
    }

    /**
     * Indicate that the GPS is validated.
     */
    public function validated(): static
    {
        return $this->state(fn (array $attributes) => [
            'validasi_gps' => true,
        ]);
    }

    /**
     * Indicate that the GPS is not validated.
     */
    public function unvalidated(): static
    {
        return $this->state(fn (array $attributes) => [
            'validasi_gps' => false,
        ]);
    }
}





