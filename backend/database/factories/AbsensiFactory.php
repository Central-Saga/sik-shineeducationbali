<?php

namespace Database\Factories;

use App\Models\Absensi;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Absensi>
 */
class AbsensiFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Absensi::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = fake()->randomElement(['hadir', 'izin']);
        
        // Jika status hadir, generate jam masuk dan jam pulang
        if ($status === 'hadir') {
            $jamMasukHour = fake()->numberBetween(7, 9);
            $jamMasukMinute = fake()->numberBetween(0, 59);
            $jamPulangHour = fake()->numberBetween(16, 18);
            $jamPulangMinute = fake()->numberBetween(0, 59);
            
            $jamMasukCarbon = \Carbon\Carbon::createFromTime($jamMasukHour, $jamMasukMinute, 0);
            $jamPulangCarbon = \Carbon\Carbon::createFromTime($jamPulangHour, $jamPulangMinute, 0);
            
            // Pastikan jam_pulang lebih besar dari jam_masuk
            if ($jamPulangCarbon->lessThanOrEqualTo($jamMasukCarbon)) {
                $jamPulangCarbon->setTime(17, 0, 0);
            }
            
            $durasiKerja = $jamMasukCarbon->diffInMinutes($jamPulangCarbon);
            
            return [
                'karyawan_id' => Employee::factory(),
                'tanggal' => fake()->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
                'status_kehadiran' => $status,
                'jam_masuk' => $jamMasukCarbon->format('H:i:s'),
                'jam_pulang' => $jamPulangCarbon->format('H:i:s'),
                'durasi_kerja' => $durasiKerja,
                'sumber_absen' => fake()->randomElement(['mobile', 'kiosk', 'web']),
                'catatan' => null,
            ];
        }
        
        // Jika status izin, generate catatan
        return [
            'karyawan_id' => Employee::factory(),
            'tanggal' => fake()->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'status_kehadiran' => $status,
            'jam_masuk' => null,
            'jam_pulang' => null,
            'durasi_kerja' => null,
            'sumber_absen' => fake()->optional(0.3)->randomElement(['mobile', 'kiosk', 'web']),
            'catatan' => fake()->randomElement([
                'Izin pribadi',
                'Izin keluarga',
                'Izin acara keluarga',
                'Izin keperluan pribadi',
            ]),
        ];
    }

    /**
     * Indicate that the attendance is present (hadir).
     */
    public function hadir(): static
    {
        return $this->state(function (array $attributes) {
            $jamMasukHour = fake()->numberBetween(7, 9);
            $jamMasukMinute = fake()->numberBetween(0, 59);
            $jamPulangHour = fake()->numberBetween(16, 18);
            $jamPulangMinute = fake()->numberBetween(0, 59);
            
            $jamMasukCarbon = \Carbon\Carbon::createFromTime($jamMasukHour, $jamMasukMinute, 0);
            $jamPulangCarbon = \Carbon\Carbon::createFromTime($jamPulangHour, $jamPulangMinute, 0);
            
            if ($jamPulangCarbon->lessThanOrEqualTo($jamMasukCarbon)) {
                $jamPulangCarbon->setTime(17, 0, 0);
            }
            
            $durasiKerja = $jamMasukCarbon->diffInMinutes($jamPulangCarbon);
            
            return [
                'status_kehadiran' => 'hadir',
                'jam_masuk' => $jamMasukCarbon->format('H:i:s'),
                'jam_pulang' => $jamPulangCarbon->format('H:i:s'),
                'durasi_kerja' => $durasiKerja,
                'sumber_absen' => fake()->randomElement(['mobile', 'kiosk', 'web']),
                'catatan' => null,
            ];
        });
    }

    /**
     * Indicate that the attendance is leave (izin).
     */
    public function izin(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status_kehadiran' => 'izin',
                'jam_masuk' => null,
                'jam_pulang' => null,
                'durasi_kerja' => null,
                'catatan' => fake()->randomElement([
                    'Izin pribadi',
                    'Izin keluarga',
                    'Izin acara keluarga',
                    'Izin keperluan pribadi',
                ]),
            ];
        });
    }

}
