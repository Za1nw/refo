<?php

namespace Modules\MenuBuilder\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\MenuBuilder\Models\Concerns\CachesMenuItemsTree;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

// use Modules\MenuBuilder\Database\Factories\MenuItemsFactory;

class MenuItem extends Model
{
    use CachesMenuItemsTree;
    use SoftDeletes;

    protected $fillable = [
        'scope',
        'type',
        'title',
        'short_title',
        'icon',
        'is_route',
        'route_name',
        'url',
        'active_patterns',
        'parent_id',
        'sort',
        'status',
        'is_disabled',
    ];

    protected $casts = [
        'active_patterns' => 'array',
        'is_route' => 'boolean',
        'status' => 'boolean',
        'is_disabled' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::deleting(function (self $menuItem): void {
            if (method_exists($menuItem, 'isForceDeleting') && ! $menuItem->isForceDeleting()) {
                return;
            }

            $menuItem->permissions()->detach();
        });

        static::saved(function (self $menuItem): void {
            $originalScope = (string) $menuItem->getOriginal('scope');

            if ($originalScope !== '' && $originalScope !== $menuItem->scope) {
                self::bumpCacheVersion($originalScope);
            }

            self::bumpCacheVersion($menuItem->scope);
        });

        static::deleted(function (self $menuItem): void {
            self::bumpCacheVersion($menuItem->scope);
        });

        static::restored(function (self $menuItem): void {
            self::bumpCacheVersion($menuItem->scope);
        });

        static::forceDeleted(function (self $menuItem): void {
            self::bumpCacheVersion($menuItem->scope);
        });
    }

    public function permissions()
    {
        $relation = $this->morphToMany(
            Permission::class,
            'model',
            config('permission.table_names.model_has_permissions'),
            config('permission.column_names.model_morph_key'),
            app(PermissionRegistrar::class)->pivotPermission
        );

        if (! app(PermissionRegistrar::class)->teams) {
            return $relation;
        }

        $teamsKey = app(PermissionRegistrar::class)->teamsKey;
        $relation->withPivot($teamsKey);

        return $relation->wherePivot($teamsKey, getPermissionsTeamId());
    }

    public function children()
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->orderBy('sort');
    }

    public function parent()
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }
}
