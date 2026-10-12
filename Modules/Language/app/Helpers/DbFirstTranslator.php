<?php

namespace Modules\Language\Helpers;

use Illuminate\Translation\Translator;
use Modules\Language\Models\Language;

class DbFirstTranslator extends Translator
{
    public function get($key, array $replace = [], $locale = null, $fallback = true)
    {
        $locale = $locale ?? $this->locale;

        try {
            $record = Language::where('key', $key)->where('language', $locale)->first();
        } catch (\Throwable $e) {
            $record = null;
        }

        if ($record && $record->value !== null) {
            return $this->makeReplacements($record->value, $replace);
        }

        return parent::get($key, $replace, $locale, $fallback);
    }
}
