<?php

namespace App\Http\Resources\Api\V1\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->pluck('name')->toArray();
            }, []),
            'permissions' => $this->when($request->user(), function () use ($request) {
                // User selalu bisa melihat permissions mereka sendiri
                if ($request->user()->id === $this->id) {
                    return $this->getAllPermissions()->pluck('name')->toArray();
                }
                // Atau jika user memiliki permission untuk melihat permissions user lain
                if ($request->user()->can('mengelola permissions')) {
                    return $this->getAllPermissions()->pluck('name')->toArray();
                }
                return [];
            }, []),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
