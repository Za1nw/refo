<?php

namespace Modules\Settings\Models;

use App\Models\BaseModel;
use App\Models\Traits\HasHashedMediaTrait;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Settings\Services\SettingsService;
use Spatie\MediaLibrary\HasMedia;

class Setting extends BaseModel implements HasMedia
{
    use HasHashedMediaTrait;
    use SoftDeletes;

    protected $table = 'settings';

    /**
     * Add a settings value.
     *
     * @param  string  $type
     * @return bool
     */
    public static function add($key, $val, $type = 'string')
    {
        return app(SettingsService::class)->add($key, $val, $type);
    }

    /**
     * Get a settings value.
     *
     * @param  null  $default
     * @return bool|int|mixed
     */
    public static function get($key, $default = null)
    {
        return app(SettingsService::class)->get($key, self::getDefaultValue($key, $default));
    }

    /**
     * Set a value for setting.
     *
     * @param  string  $type
     * @return bool
     */
    public static function set($key, $val, $type = 'string')
    {
        return app(SettingsService::class)->set($key, $val, $type);
    }

    /**
     * Remove a setting.
     *
     * @return bool
     */
    public static function remove($key)
    {
        return app(SettingsService::class)->remove($key);
    }

    /**
     * Check if setting exists.
     *
     * @return bool
     */
    public static function has($key)
    {
        return app(SettingsService::class)->has($key);
    }

    /**
     * Get the validation rules for setting fields.
     *
     * @return array
     */
    public static function getValidationRules()
    {
        return app(SettingsService::class)->getValidationRules();
    }

    public static function getSelectedValidationRules($value)
    {
        return app(SettingsService::class)->getSelectedValidationRules($value);
    }

    /**
     * Get the data type of a setting.
     *
     * @return mixed
     */
    public static function getDataType($field)
    {
        return app(SettingsService::class)->getDataType($field);
    }

    /**
     * Get default value for a setting.
     *
     * @return mixed
     */
    public static function getDefaultValueForField($field)
    {
        return app(SettingsService::class)->getDefaultValueForField($field);
    }

    /**
     * Get default value from config if no value passed.
     *
     * @return mixed
     */
    private static function getDefaultValue($key, $default)
    {
        return is_null($default) ? self::getDefaultValueForField($key) : $default;
    }

    /**
     * جلب قائمة عناوين البريد الإلكتروني لإشعارات الإدارة.
     *
     * @return array<int, string>
     */
    public static function getAdminNotificationEmails(): array
    {
        return app(SettingsService::class)->getAdminNotificationEmails();
    }

    /**
     * Get all the settings.
     *
     * @return mixed
     */
    public static function getAllSettings()
    {
        return app(SettingsService::class)->all();
    }

    /**
     * Flush the cache.
     */
    public static function flushCache()
    {
        app(SettingsService::class)->flushCache();
    }

    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        static::updated(function () {
            self::flushCache();
        });

        static::created(function () {
            self::flushCache();
        });

        static::deleted(function () {
            self::flushCache();
        });
    }
}
