<?php

namespace Modules\MenuBuilder\Models\Concerns;

use Illuminate\Support\Facades\Cache;

trait CachesMenuItemsTree
{
    protected static function shouldCache(): bool
    {
        return app()->isProduction();
    }

    public static function cacheVersionKey(string $scope): string
    {
        return "menus.version.{$scope}";
    }

    public static function getCacheVersion(string $scope): int
    {
        if (! self::shouldCache()) {
            return 1;
        }

        $version = Cache::get(self::cacheVersionKey($scope));

        return is_numeric($version) ? (int) $version : 1;
    }

    public static function bumpCacheVersion(string $scope): int
    {
        if (! self::shouldCache()) {
            return 1;
        }

        $key = self::cacheVersionKey($scope);

        Cache::add($key, 1);

        return (int) Cache::increment($key);
    }
}
