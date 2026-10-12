<?php

use Modules\Settings\Models\Setting;
use Modules\Settings\Services\SettingsService;

/*
 * Get or Set the Settings Values
 *
 * @var [type]
 */

if (! function_exists('setting')) {
    function setting($key, $default = null)
    {
        if (is_null($key)) {
            return new Setting;
        }

        if (is_array($key)) {
            return app(SettingsService::class)->set($key[0], $key[1]);
        }

        $value = app(SettingsService::class)->get($key, null);

        return is_null($value) ? value($default) : $value;
    }
}

if (! function_exists('has_setting')) {
    function has_setting($key)
    {
        if (is_null($key)) {
            return false;
        }

        $result = app(SettingsService::class)->has($key);

        return $result;
    }
}
