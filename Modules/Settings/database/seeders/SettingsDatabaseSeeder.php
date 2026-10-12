<?php

namespace Modules\Settings\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\MenuBuilder\Database\Seeders\MenuBuilderDatabaseSeeder;

class SettingsDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(MenuBuilderDatabaseSeeder::class, ['config' => 'settings'])->run();
        $this->call([
            SettingsTableSeeder::class,
        ]);
    }
}
