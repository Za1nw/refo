<?php

namespace Database\Seeders\Auth;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Class PermissionRoleTableSeeder.
 */
class PermissionRoleTableSeeder extends Seeder
{
    /**
     * Run the database seed.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Schema::disableForeignKeyConstraints();

        try {
            $guardName = config('auth.defaults.guard') ?? 'web';

            $admin = Role::query()->updateOrCreate(
                ['name' => 'admin', 'guard_name' => $guardName],
                ['title' => 'Admin', 'is_fixed' => true]
            );
            // $manager = Role::query()->updateOrCreate(['name' => 'manager', 'guard_name' => $guardName], ['title' => 'manager', 'is_fixed' => true]);
            // $employee = Role::query()->updateOrCreate(['name' => 'employee', 'guard_name' => $guardName], ['title' => 'employee', 'is_fixed' => true]);
            Role::query()->updateOrCreate(
                ['name' => 'customer', 'guard_name' => $guardName],
                ['title' => 'customer', 'is_fixed' => true]
            );

            $modules = config('constant.MODULES');

            foreach ($modules as $module) {
                $permissions = ['view', 'add', 'edit', 'delete', 'translate'];
                $moduleName = strtolower(str_replace(' ', '_', $module['module_name']));
                foreach ($permissions as $value) {
                    $permissionName = $value.'_'.$moduleName;
                    Permission::query()->updateOrCreate(
                        ['name' => $permissionName, 'guard_name' => $guardName],
                        ['is_fixed' => true]
                    );
                }
                if (isset($module['more_permission']) && is_array($module['more_permission'])) {
                    foreach ($module['more_permission'] as $value) {
                        $permissionName = $moduleName.'_'.$value;
                        Permission::query()->updateOrCreate(
                            ['name' => $permissionName, 'guard_name' => $guardName],
                            ['is_fixed' => true]
                        );
                    }
                }
            }
            $userPermissions = config('constant.USER_PERMISSION_ALLOW', []);
            foreach ($userPermissions as $permission) {
                Permission::query()->updateOrCreate(
                    ['name' => $permission, 'guard_name' => $guardName],
                    ['is_fixed' => true]
                );
            }
            $admin->syncPermissions(Permission::query()->where('guard_name', $guardName)->get());
        } finally {
            app(PermissionRegistrar::class)->forgetCachedPermissions();
            Schema::enableForeignKeyConstraints();
        }
    }
}
