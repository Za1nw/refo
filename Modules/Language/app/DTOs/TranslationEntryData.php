<?php

namespace Modules\Language\DTOs;

final readonly class TranslationEntryData
{
    public function __construct(
        public string $key,
        public string $sourceValue,
        public string $value,
        public bool $isOverridden = false,
    ) {}

    /**
     * @return array{key: string, source_value: string, value: string, is_overridden: bool}
     */
    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'source_value' => $this->sourceValue,
            'value' => $this->value,
            'is_overridden' => $this->isOverridden,
        ];
    }
}
