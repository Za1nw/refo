<?php

namespace Modules\Language\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexLanguageRequest extends FormRequest
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
            'search' => ['nullable', 'string', 'max:255'],
            'namespace' => ['nullable', 'string', 'max:100'],
            'locale' => ['nullable', 'string', 'max:10'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'sort_by' => ['nullable', 'string', 'in:label,group,namespace,text_count'],
            'sort_order' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }
}
