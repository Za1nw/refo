<?php

namespace Modules\Settings\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Modules\Settings\Models\Setting;

class SettingsService
{
    private const CACHE_KEY = 'settings.all';

    private ?Collection $definedSettingFields = null;

    public function all(): Collection
    {
        return Cache::rememberForever(self::CACHE_KEY, function (): Collection {
            return Setting::query()
                ->select(['id', 'name', 'val', 'type'])
                ->get()
                ->keyBy('name');
        });
    }

    public function has(string $key): bool
    {
        return $this->all()->has($key);
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $setting = $this->all()->get($key);

        if ($setting === null) {
            return $default;
        }

        return $this->castValue($setting->val, $setting->type);
    }

    public function set(string $key, mixed $value, string $type = 'string'): Setting|false
    {
        $setting = Setting::query()->updateOrCreate(
            ['name' => $key],
            ['val' => $value, 'type' => $type],
        );

        $this->flushCache();

        return $setting;
    }

    public function add(string $key, mixed $value, string $type = 'string'): Setting|false
    {
        return $this->set($key, $value, $type);
    }

    public function remove(string $key): bool
    {
        $removed = (bool) Setting::query()->where('name', $key)->delete();

        if ($removed) {
            $this->flushCache();
        }

        return $removed;
    }

    public function getValidationRules(): array
    {
        return $this->definedSettingFields()
            ->pluck('rules', 'name')
            ->reject(static fn ($value): bool => is_null($value))
            ->all();
    }

    public function getSelectedValidationRules(array $values): array
    {
        return $this->definedSettingFields()
            ->whereIn('name', $values)
            ->pluck('rules', 'name')
            ->reject(static fn ($value): bool => is_null($value))
            ->all();
    }

    public function getDataType(string $field): string
    {
        $type = $this->definedSettingFields()
            ->pluck('data', 'name')
            ->get($field);

        return $type ?? 'string';
    }

    public function getDefaultValueForField(string $field): mixed
    {
        return $this->definedSettingFields()
            ->pluck('value', 'name')
            ->get($field);
    }

    public function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    private function definedSettingFields(): Collection
    {
        return $this->definedSettingFields ??= collect(config('setting_fields', []))
            ->pluck('elements')
            ->flatten(1);
    }

    private function castValue(mixed $value, string $castTo): mixed
    {
        return match ($castTo) {
            'int', 'integer' => (int) $value,
            'bool', 'boolean' => (bool) $value,
            default => $value,
        };
    }

    /**
     * جلب قائمة عناوين البريد الإلكتروني المخصصة لإشعارات الإدارة.
     *
     * يقوم بقراءة إعداد admin_notification_emails، وفك تشفير الـ JSON أو الفواصل،
     * والتحقق من صلاحية العناوين، مع إمكانية الرجوع للمشرفين أو البريد الافتراضي.
     *
     * @return array<int, string>
     */
    public function getAdminNotificationEmails(): array
    {
        $raw = $this->get('admin_notification_emails');
        $emails = [];

        if (! empty($raw)) {
            if (is_string($raw)) {
                $decoded = json_decode($raw, true);
                $raw = is_array($decoded) ? $decoded : array_map('trim', explode(',', $raw));
            }

            if (is_array($raw)) {
                $emails = array_values(array_filter(
                    $raw,
                    static fn ($email): bool => is_string($email) && (bool) filter_var(trim($email), FILTER_VALIDATE_EMAIL)
                ));
            }
        }

        // إزالة التكرارات
        $emails = array_values(array_unique(array_map('trim', $emails)));

        // إذا لم يتم تحديد بريد إدارة مخصص، يتم الرجوع لمشرفي النظام الافتراضيين
        if (empty($emails) && class_exists(User::class)) {
            $emails = User::where('is_admin', true)
                ->pluck('email')
                ->filter()
                ->unique()
                ->values()
                ->all();
        }

        // كحل أخير: الرجوع لبريد الإرسال الافتراضي للنظام
        if (empty($emails)) {
            $defaultEmail = config('mail.from.address');
            if ($defaultEmail && filter_var($defaultEmail, FILTER_VALIDATE_EMAIL)) {
                $emails = [$defaultEmail];
            }
        }

        return $emails;
    }
}
