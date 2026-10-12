<?php

namespace Modules\Blog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\Blog\Models\Blog;

class BlogFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Blog::class;

    protected ?array $arabicContent = null;

    protected ?array $englishContent = null;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'slug' => Str::slug(fake('en_US')->unique()->words(3, true)).'-'.fake()->unique()->numberBetween(1000, 9999),
            'views' => fake()->numberBetween(0, 5000),
            'is_featured' => false,
        ];
    }

    public function featured(): static
    {
        return $this->state(fn (): array => [
            'is_featured' => true,
        ]);
    }

    public function withContent(array $arabicContent, array $englishContent): static
    {
        $this->arabicContent = $arabicContent;
        $this->englishContent = $englishContent;

        return $this;
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Blog $blog): void {
            if ($this->arabicContent !== null) {
                $blog->setTranslations($this->arabicContent, 'ar');
            }

            if ($this->englishContent === null) {
                return;
            }

            $blog->setTranslations($this->englishContent, 'en');
        });
    }
}
