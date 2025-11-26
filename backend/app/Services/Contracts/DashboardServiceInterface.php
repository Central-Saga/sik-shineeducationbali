<?php

namespace App\Services\Contracts;

interface DashboardServiceInterface
{
    /**
     * Get dashboard statistics based on user role.
     *
     * @param  \App\Models\User  $user
     * @return array<string, mixed>
     */
    public function getStatistics($user): array;

    /**
     * Get chart data based on type and user role.
     *
     * @param  string  $type
     * @param  \App\Models\User  $user
     * @return array<string, mixed>
     */
    public function getChartData(string $type, $user): array;
}

