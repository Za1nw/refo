<?php

namespace Database\Seeders\Auth;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

/**
 * Class UserTableSeeder.
 */
class UserTableSeeder extends Seeder
{
    /**
     * Run the database seed.
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        $user = User::where('email', 'test@example.com')->first();
        $customer = User::where('email', 'm733716220@gmail.com')->first();
        if ($user) {
            $user->syncRoles(['admin']);
        }
        if ($customer) {
            $customer->syncRoles(['customer']);
        }
        Schema::enableForeignKeyConstraints();
    }
}
