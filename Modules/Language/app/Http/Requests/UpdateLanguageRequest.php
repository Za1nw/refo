<?php

namespace Modules\Language\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLanguageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'locale' => ['required', 'string', 'max:10'],
            'restore_source' => ['sometimes', 'boolean'],
            'translations' => ['required_without:restore_source', 'array'],
            'translations.*' => ['nullable'],
        ];
    }
}
