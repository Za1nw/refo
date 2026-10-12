<?php

namespace Modules\Language\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Language\Models\Concerns\CachesLanguageTranslations;

class Language extends Model
{
    use CachesLanguageTranslations;
    use HasFactory, SoftDeletes;

    protected $table = 'languages';

    /** @var list<string> */
    protected $fillable = [
        'key',
        'value',
        'language',
        'group',
        'namespace',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function scopeForFile($query, string $namespace, string $group)
    {
        return $query
            ->whereRaw('LOWER(namespace) = ?', [mb_strtolower($namespace)])
            ->where('group', $group);
    }

    public function scopeForLocale($query, string $language)
    {
        return $query->where('language', $language);
    }

    protected static function boot(): void
    {
        parent::boot();

        static::saved(function (self $language): void {

            // إذا ما تغيّر شيء فعلي → لا تمسح كاش
            if (! $language->wasChanged(['key', 'value', 'language', 'group', 'namespace'])) {
                return;
            }

            self::flushSmartCache($language);
        });

        static::deleted(function (self $language): void {
            self::flushSmartCache($language);
        });

        static::restored(function (self $language): void {
            self::flushSmartCache($language);
        });

        static::forceDeleted(function (self $language): void {
            self::flushSmartCache($language);
        });
    }
}
