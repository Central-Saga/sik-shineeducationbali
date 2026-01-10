<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Services\Contracts\DashboardServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends BaseApiController
{
    /**
     * The dashboard service instance.
     *
     * @var \App\Services\Contracts\DashboardServiceInterface
     */
    protected DashboardServiceInterface $dashboardService;

    /**
     * Create a new dashboard controller instance.
     *
     * @param  \App\Services\Contracts\DashboardServiceInterface  $dashboardService
     */
    public function __construct(DashboardServiceInterface $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Get dashboard statistics.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return $this->unauthorized('User not authenticated');
        }

        $statistics = $this->dashboardService->getStatistics($user);

        return $this->success(
            $statistics,
            'Dashboard statistics retrieved successfully'
        );
    }

    /**
     * Get chart data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $type
     * @return \Illuminate\Http\JsonResponse
     */
    public function chartData(Request $request, string $type): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return $this->unauthorized('User not authenticated');
        }

        $chartData = $this->dashboardService->getChartData($type, $user);

        return $this->success(
            $chartData,
            'Chart data retrieved successfully'
        );
    }
}

