<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Services\Employee\EmployeeService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateEmployeeCodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'employees:generate-codes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate kode_karyawan for all employees that do not have one';

    /**
     * Execute the console command.
     */
    public function handle(EmployeeService $employeeService): int
    {
        $this->info('Generating employee codes...');

        // Get all employees without kode_karyawan
        $employees = Employee::whereNull('kode_karyawan')
            ->orWhere('kode_karyawan', '')
            ->get();

        if ($employees->isEmpty()) {
            $this->info('All employees already have codes.');
            return Command::SUCCESS;
        }

        $this->info("Found {$employees->count()} employees without codes.");

        $bar = $this->output->createProgressBar($employees->count());
        $bar->start();

        $generated = 0;
        $errors = 0;

        foreach ($employees as $employee) {
            try {
                // Generate unique code
                $kodeKaryawan = $this->generateKodeKaryawan();

                // Update employee
                $employee->kode_karyawan = $kodeKaryawan;
                $employee->save();

                $generated++;
            } catch (\Exception $e) {
                $this->newLine();
                $this->error("Error generating code for employee ID {$employee->id}: {$e->getMessage()}");
                $errors++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Successfully generated codes for {$generated} employees.");
        if ($errors > 0) {
            $this->warn("Failed to generate codes for {$errors} employees.");
        }

        return Command::SUCCESS;
    }

    /**
     * Generate unique employee code (SEB + 4 random digits).
     *
     * @return string
     */
    protected function generateKodeKaryawan(): string
    {
        $maxAttempts = 100;
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

        // Fallback to timestamp-based code if all attempts failed
        return 'SEB' . substr(time(), -4) . rand(0, 9);
    }
}







