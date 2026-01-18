<?php

namespace App\Http\Requests\Api\V1\Cuti;

use Illuminate\Foundation\Http\FormRequest;

class RejectCancellationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only admin can reject cancellation
        return $this->user() && $this->user()->can('mengelola cuti');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // No additional validation needed, status check is done in service
        ];
    }
}
