<?php

namespace App\Http\Controllers\Api\V1\Employee;

use App\Http\Controllers\Api\Base\BaseApiController;
use App\Http\Requests\Api\V1\Employee\StoreEmployeeRequest;
use App\Http\Requests\Api\V1\Employee\UpdateEmployeeRequest;
use App\Http\Resources\Api\V1\Employee\EmployeeResource;
use App\Services\Contracts\EmployeeServiceInterface;
use Illuminate\Http\JsonResponse;

class EmployeeController extends BaseApiController
{
    /**
     * The employee service instance.
     *
     * @var \App\Services\Contracts\EmployeeServiceInterface
     */
    protected EmployeeServiceInterface $employeeService;

    /**
     * Create a new employee controller instance.
     *
     * @param  \App\Services\Contracts\EmployeeServiceInterface  $employeeService
     */
    public function __construct(EmployeeServiceInterface $employeeService)
    {
        $this->employeeService = $employeeService;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $employees = $this->employeeService->getAll()->load('user.roles');
        return $this->success(
            EmployeeResource::collection($employees),
            'Employees retrieved successfully'
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\Employee\StoreEmployeeRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        // Request sudah handle validation dan prepareForValidation
        $validated = $request->validated();

        $employee = $this->employeeService->create($validated);
        $employee->load('user.roles');

        return $this->created(
            new EmployeeResource($employee),
            'Employee created successfully'
        );
    }

    /**
     * Display the specified resource.
     *
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id): JsonResponse
    {
        $employee = $this->employeeService->getById($id);
        $employee->load('user.roles');

        return $this->success(
            new EmployeeResource($employee),
            'Employee retrieved successfully'
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\Api\V1\Employee\UpdateEmployeeRequest  $request
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateEmployeeRequest $request, $id): JsonResponse
    {
        // Request sudah handle validation dan prepareForValidation
        $validated = $request->validated();

        $employee = $this->employeeService->update($id, $validated);
        $employee->load('user.roles');

        return $this->success(
            new EmployeeResource($employee),
            'Employee updated successfully'
        );
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  string|int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        $this->employeeService->delete($id);

        return $this->success(
            null,
            'Employee deleted successfully'
        );
    }

    /**
     * Get employee data for the currently authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(\Illuminate\Http\Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return $this->unauthorized('User not authenticated.');
        }

        // Load employee relationship
        if (!$user->relationLoaded('employee')) {
            $user->load('employee');
        }

        if (!$user->employee) {
            return $this->notFound('Employee data not found for this user.');
        }

        $employee = $user->employee;
        $employee->load('user.roles');

        return $this->success(
            new EmployeeResource($employee),
            'Employee retrieved successfully'
        );
    }
}
