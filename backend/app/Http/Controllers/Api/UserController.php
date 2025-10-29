<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Get all users (for testing API connection)
     */
    public function index(): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Users retrieved successfully',
            'data' => $users,
            'count' => $users->count(),
        ]);
    }

    /**
     * Get user by ID
     */
    public function show($id): JsonResponse
    {
        $user = User::select('id', 'name', 'email', 'created_at')
            ->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'User retrieved successfully',
            'data' => $user,
        ]);
    }

    /**
     * Test endpoint untuk check API connection
     */
    public function test(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'API is working! Backend connected successfully.',
            'timestamp' => now()->toDateTimeString(),
            'backend' => 'Laravel ' . app()->version(),
        ]);
    }
}
