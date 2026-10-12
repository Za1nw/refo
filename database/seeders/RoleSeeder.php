<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = 'web'; // أو: config('auth.defaults.guard')

        $roleName = 'admin';

        $permissions = [
            'view_dashboard',
            'view_blog',
            'view_blog_categories',
            'view_blog_tags',
            'view_shop',
            'view_language',
            'view_repository',
            'view_documentation',
        ];

        // 1) أنشئ/حدث الدور (لو موجود ما ينشئ تكرار)
        $role = Role::updateOrCreate(
            ['name' => $roleName, 'guard_name' => $guard],
            [] // ما عندك حقول أخرى للتحديث حالياً
        );

        // 2) أنشئ أي permissions ناقصة (بدون تكرار)
        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => $guard,
            ]);
        }

        // 3) خلي الدور يطابق القائمة بالضبط (يزيد/يحذف حسب التغيير)
        $role->syncPermissions($permissions);

        // 4) اربط المستخدم بالدور (بدون تكرار) + صحح الإيميل (كان عندك مسافة!)
        $user = User::where('email', 'test@example.com')->first();

        if ($user) {
            $user->syncRoles([$roleName]); // أو assignRole لو ما تبغى يمسح أدوار أخرى
        }

        // اختياري: امسح الكاش بعد التعديلات
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
