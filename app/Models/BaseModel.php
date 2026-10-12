<?php

namespace App\Models;

use App\Models\Traits\HasHashedMediaTrait;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class BaseModel extends Model implements HasMedia
{
    use HasHashedMediaTrait;
    use SoftDeletes;

    /**
     * لو تحب توقف الـ audit في موديل معيّن:
     * ضع داخل الموديل: protected bool $auditEnabled = false;
     */
    protected bool $auditEnabled = true;

    protected $guarded = [
        'id',
        'created_at',
        'updated_at',
        'deleted_at',
        '_token',
        '_method',
    ];

    /**
     * Laravel الحديثة ما تحتاج $dates غالباً، لكن نخليها للتوافق.
     * لا تضع published_at إلا لو فعلاً تستخدمه.
     */
    protected $dates = [
        'deleted_at',
        'created_at',
        'updated_at',
    ];

    /* -----------------------------
     | Relationships (Audit Users)
     |-----------------------------*/
    public function createdUser()
    {
        return $this->userRelation('created_by');
    }

    public function updatedUser()
    {
        return $this->userRelation('updated_by');
    }

    public function deletedUser()
    {
        return $this->userRelation('deleted_by');
    }

    protected function userRelation(string $fieldName)
    {
        return $this->belongsTo(User::class, $fieldName, 'id');
    }

    /* -----------------------------
     | Model Events (Audit)
     |-----------------------------*/
    protected static function booted(): void
    {
        // عند الإنشاء: created_by فقط (ولا نكتب updated_by هنا)
        static::creating(function (self $model) {
            if (! $model->shouldAudit()) {
                return;
            }

            if ($model->hasColumn('created_by') && empty($model->created_by)) {
                $model->created_by = Auth::id();
            }
        });

        // عند التحديث: updated_by
        static::updating(function (self $model) {
            if (! $model->shouldAudit()) {
                return;
            }

            if ($model->hasColumn('updated_by')) {
                $model->updated_by = Auth::id();
            }
        });

        /**
         * قبل الحذف: deleted_by
         * مهم: نستخدم saveQuietly لتجنب إعادة إطلاق events/loops
         */
        static::deleting(function (self $model) {
            if (! $model->shouldAudit()) {
                return;
            }

            if (! $model->usesSoftDeletes()) {
                return;
            }

            if ($model->hasColumn('deleted_by')) {
                $model->deleted_by = Auth::id();

                // لا نريد تحديث updated_at أثناء وضع deleted_by
                $originalTimestamps = $model->timestamps;
                $model->timestamps = false;

                // حفظ بدون events لتجنب مشاكل
                $model->saveQuietly();

                $model->timestamps = $originalTimestamps;
            }
        });
    }

    protected function shouldAudit(): bool
    {
        if (! $this->auditEnabled) {
            return false;
        }

        // لو ما في مستخدم مسجل (cron/queue/guest) لا تكتب
        if (! Auth::check()) {
            return false;
        }

        // تجاهل routes معينة (مثل كودك القديم)
        // $route = request()?->route();
        // $routeName = $route?->getName();

        // if (is_string($routeName) && str_contains($routeName, 'api')) {
        //     return false;
        // }

        return true;
    }

    protected function usesSoftDeletes(): bool
    {
        // وجود deleted_at يعني غالباً يستخدم SoftDeletes
        return $this->hasColumn('deleted_at');
    }

    protected function hasColumn(string $column): bool
    {
        // كاش بسيط لكل موديل لتجنب ضرب DB كثير
        static $columnsCache = [];

        $table = $this->getTable();

        if (! isset($columnsCache[$table])) {
            $columnsCache[$table] = $this->fetchTableColumns($table);
        }

        return in_array($column, $columnsCache[$table], true);
    }

    protected function fetchTableColumns(string $table): array
    {
        return $this->getConnection()
            ->getSchemaBuilder()
            ->getColumnListing($table);
    }

    /* -----------------------------
     | Media Conversions
     |-----------------------------*/
    public function registerMediaConversions(?Media $media = null): void
    {
        // 🔹 صغير جدًا (أيقونات / lists)
        $this->addMediaConversion('thumb')
            ->format('webp')
            ->fit(Fit::Crop, 150, 150)
            ->quality(70)
            ->nonQueued();

        // 🔹 كروت
        $this->addMediaConversion('small')
            ->format('webp')
            ->fit(Fit::Crop, 300, 300)
            ->quality(75)
            ->nonQueued();

        // 🔹 متوسط (blog cards / previews)
        $this->addMediaConversion('medium')
            ->format('webp')
            ->fit(Fit::Crop, 600, 400)
            ->quality(80)
            ->nonQueued();

        // 🔹 كبير (داخل المقال)
        $this->addMediaConversion('large')
            ->format('webp')
            ->fit(Fit::Crop, 1200, 800)
            ->quality(85)
            ->nonQueued();

        // 🔹 بانر (Hero image)
        $this->addMediaConversion('hero')
            ->format('webp')
            ->fit(Fit::Crop, 1920, 1080)
            ->quality(85)
            ->nonQueued();

        // 🔹 مربع عالي الجودة
        $this->addMediaConversion('square_hd')
            ->format('webp')
            ->fit(Fit::Crop, 1024, 1024)
            ->quality(90)
            ->nonQueued();

        // 🔹 thumbnail عالي الجودة للعرض السريع
        $this->addMediaConversion('thumb_hd')
            ->format('webp')
            ->fit(Fit::Crop, 400, 400)
            ->quality(80)
            ->nonQueued();
    }

    /**
     * Status label (نصي) - أفضل من HTML داخل الموديل.
     * لو مشروعك يعتمد على HTML القديم، خليه في View/Resource.
     */
    public function getStatusLabelTextAttribute(): string
    {
        return match ((string) $this->status) {
            '0' => 'Inactive',
            '1' => 'Active',
            '2' => 'Pending',
            default => (string) $this->status,
        };
    }

    /**
     * (اختياري) إذا لازلت تحتاج HTML
     */
    public function getStatusLabelAttribute(): string
    {
        return match ((string) $this->status) {
            '0' => '<span class="badge bg-soft-danger">Inactive</span>',
            '1' => '<span class="badge bg-soft-success">Active</span>',
            '2' => '<span class="badge bg-soft-warning text-dark">Pending</span>',
            default => '<span class="badge bg-soft-primary">Status:'.$this->status.'</span>',
        };
    }

    /* -----------------------------
     | Mutators (اختيارية)
     |-----------------------------*/
    public function setNameAttribute($value): void
    {
        if ($this->hasColumn('name')) {
            $this->attributes['name'] = trim((string) $value);
        }
    }

    public function setSlugAttribute($value): void
    {
        if (! $this->hasColumn('slug')) {
            return;
        }

        $value = trim((string) $value);

        // إذا ما أعطى slug استخدم name
        if ($value === '' && isset($this->attributes['name'])) {
            $value = (string) $this->attributes['name'];
        }
        $this->attributes['slug'] = Str::slug($value);
    }
}
