<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Employee::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $kategoriKaryawan = fake()->randomElement(['tetap', 'kontrak', 'freelance']);
        $tipeGaji = fake()->randomElement(['bulanan', 'per_sesi']);

        return [
            'user_id' => User::factory(),
            'kategori_karyawan' => $kategoriKaryawan,
            'subtipe_kontrak' => $kategoriKaryawan === 'kontrak' 
                ? fake()->randomElement(['full_time', 'part_time']) 
                : null,
            'tipe_gaji' => $tipeGaji,
            'gaji_pokok' => $tipeGaji === 'bulanan' 
                ? fake()->randomFloat(2, 3000000, 15000000) 
                : null,
            'bank_nama' => fake()->randomElement([
                'Bank Central Asia',
                'Bank Mandiri',
                'Bank Negara Indonesia',
                'Bank Rakyat Indonesia',
                'Bank Tabungan Negara',
            ]),
            'bank_no_rekening' => fake()->numerify('##########'),
            'nomor_hp' => fake()->phoneNumber(),
            'alamat' => fake()->address(),
            'tanggal_lahir' => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'status' => fake()->randomElement(['aktif', 'nonaktif']),
        ];
    }

    /**
     * Indicate that the employee is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'aktif',
        ]);
    }

    /**
     * Indicate that the employee is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'nonaktif',
        ]);
    }

    /**
     * Indicate that the employee is permanent (tetap).
     */
    public function tetap(): static
    {
        return $this->state(fn (array $attributes) => [
            'kategori_karyawan' => 'tetap',
            'subtipe_kontrak' => null,
        ]);
    }

    /**
     * Indicate that the employee is contract (kontrak).
     */
    public function kontrak(): static
    {
        return $this->state(fn (array $attributes) => [
            'kategori_karyawan' => 'kontrak',
            'subtipe_kontrak' => fake()->randomElement(['full_time', 'part_time']),
        ]);
    }

    /**
     * Indicate that the employee is freelance.
     */
    public function freelance(): static
    {
        return $this->state(fn (array $attributes) => [
            'kategori_karyawan' => 'freelance',
            'subtipe_kontrak' => null,
        ]);
    }

    /**
     * Indicate that the employee has monthly salary (bulanan).
     */
    public function bulanan(): static
    {
        return $this->state(fn (array $attributes) => [
            'tipe_gaji' => 'bulanan',
            'gaji_pokok' => fake()->randomFloat(2, 3000000, 15000000),
        ]);
    }

    /**
     * Indicate that the employee has per session salary (per_sesi).
     */
    public function perSesi(): static
    {
        return $this->state(fn (array $attributes) => [
            'tipe_gaji' => 'per_sesi',
            'gaji_pokok' => null,
        ]);
    }
}

