<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Modules\MenuBuilder\Database\Seeders\MenuBuilderDatabaseSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // app(MenuBuilderDatabaseSeeder::class, ['config' => 'app'])->run();
        // // User::factory(10)->create();

        User::factory()->create([
            'name' => 'ahmed',
            'email' => 'test@example.com',
            'login_portal' => 'web',
        ]);
        // User::factory()->create([
        //     'name' => 'ahmed',
        //     'email' => 'ahmedyahya.mq@gmail.com',
        //     'login_portal' => 'web',
        // ]);

        $this->call([
            Auth\PermissionRoleTableSeeder::class,
            Auth\UserTableSeeder::class,
        ]);
    }
}
