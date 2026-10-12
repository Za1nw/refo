<?php

namespace Modules\Blog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\Blog\Models\BlogTag;

class BlogTagFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = BlogTag::class;

    protected ?array $englishContent = null;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'name' => fake('ar_SA')->word(),
            'slug' => Str::slug(fake('en_US')->unique()->words(2, true)),
            'is_active' => true,
        ];
    }

    public function withEnglishContent(array $content): static
    {
        $this->englishContent = $content;

        return $this;
    }

    public function configure(): static
    {
        return $this->afterCreating(function (BlogTag $tag): void {
            if ($this->englishContent === null) {
                return;
            }

            $tag->setTranslations($this->englishContent, 'en');
        });
    }
}
