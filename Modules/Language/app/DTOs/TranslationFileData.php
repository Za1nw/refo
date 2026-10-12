<?php

namespace Modules\Language\DTOs;

final readonly class TranslationFileData
{
    public function __construct(
        public string $namespace,
        public string $group,
        public string $label,
        public int $textCount,
        public string $editUrl,
    ) {}

    /**
     * @return array{namespace: string, group: string, label: string, text_count: int, edit_url: string}
     */
    public function toArray(): array
    {
        return [
            'namespace' => $this->namespace,
            'group' => $this->group,
            'label' => $this->label,
            'text_count' => $this->textCount,
            'edit_url' => $this->editUrl,
        ];
    }
}
