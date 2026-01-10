<?php

namespace App\Http\Requests\Api\V1\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UpdateRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->can('mengelola roles');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $roleId = $this->route('id');
        $role = Role::find($roleId);

        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($roleId),
            ],
            'guard_name' => [
                'sometimes',
                'string',
                Rule::in(['web', 'api']),
            ],
            'permissions' => [
                'sometimes',
                'nullable',
                'array',
            ],
            'permissions.*' => [
                'exists:permissions,name',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.string' => 'Nama role harus berupa teks.',
            'name.max' => 'Nama role maksimal 255 karakter.',
            'name.unique' => 'Nama role sudah digunakan.',
            'guard_name.string' => 'Guard name harus berupa teks.',
            'guard_name.in' => 'Guard name harus web atau api.',
            'permissions.array' => 'Permissions harus berupa array.',
            'permissions.*.exists' => 'Permission tidak valid.',
        ];
    }
}

