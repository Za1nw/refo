<?php

namespace Modules\Blog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\Blog\Models\BlogCategory;

class BlogCategoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = BlogCategory::class;

    protected ?array $englishContent = null;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'name' => fake('ar_SA')->words(2, true),
            'slug' => Str::slug(fake('en_US')->unique()->words(3, true)),
            'description' => fake('ar_SA')->sentence(),
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
        return $this->afterCreating(function (BlogCategory $category): void {
            if ($this->englishContent === null) {
                return;
            }

            $category->setTranslations($this->englishContent, 'en');
        });
    }
}
