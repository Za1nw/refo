<?php

namespace Modules\Language\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\MenuBuilder\Database\Seeders\MenuBuilderDatabaseSeeder;

class LanguageDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(MenuBuilderDatabaseSeeder::class, ['config' => 'language'])->run();
    }
}
