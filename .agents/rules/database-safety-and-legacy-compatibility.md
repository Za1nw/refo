# معايير وقواعد حماية قاعدة البيانات وتوافقية ترحيل المشاريع القديمة (Database Safety & Legacy Compatibility Standards)

> **المرجع الإلزامي لحماية البيانات الحالية، منع فقدان البيانات، والحفاظ على توافقية المخطط بين المشروع القديم (fursaty-old) والمشروع الجديد (fursaty-new) - سياسة عدم التسامح مع فقدان البيانات (Zero Data Loss Policy).**

---

## 1. المبدأ الأساسي: قاعدة البيانات الحالية هي مصدر الحقيقة (Current DB is the Source of Truth)

- **حظر تغيير أسماء الجداول والأعمدة القديمة**:
  - جميع أسماء الجداول وأسماء الأعمدة المستخرجة من `fursaty-old/database/migrations` هي **عقود ثابتة وغير قابلة للتغيير العشوائي**.
  - يُمنع منعًا باتًا إعادة تسمية جدول أو عمود (مثل تحويل `specializations` إلى `majors` أو تغيير `isActivate` إلى `is_active` أو تغيير `deadline` إلى `expires_at`) داخل قاعدة البيانات الحالية دون وجود هجرة توافقية متقدمة متعددة المراحل.
  - أي استعلام أو موديل جديد يجب أن يتعامل مباشرة مع أسماء الأعمدة الفعلية الموجودة في قاعدة البيانات الحالية.
- **الحفاظ على المفاتيح والأنواع الشاذة (Custom Primary Keys & Quirks)**:
  - **جدول الدول `countries`**: المفتاح الأساسي هو `_id` من نوع `string` (وليس `id` رقمي). يجب أن يُعرّف الموديل والمفتاح الأجنبي المرتبط به في الجداول الأخرى (`scholarships.country_id`, `users.country_id`, `visits.country_id`) بنفس النوع والاسم بالضبط (`$table->string('country_id')->nullable()`).
  - **جدول الإعلانات `advertisements`**: يحتوي على العمود `isActivate` (بحالة الأحرف هذه). يجب الحفاظ عليه وتعيين `casts` أو Accessor مناسب بدلاً من كسر العمود في قاعدة البيانات.
  - **جدول تفاصيل المستخدم `details_user`**: يرتبط بجدول `users` عبر `user_id`، وتفاصيل الإشعارات مخزنة كـ `json`.

---

## 2. سياسة عدم فقدان البيانات والترقية غير المدمرة (Zero Data Loss & Non-Destructive Migrations)

- **حظر الهجرات المدمرة (Destructive Migrations Banned)**:
  - يُحظر تمامًا استخدام أوامر الحذف المباشر في هجرات بيئة العمل مثل:
    - `Schema::dropIfExists(...)` على جداول تحتوي بيانات نشطة.
    - `$table->dropColumn(...)` على أعمدة تحتوي بيانات مستخدمين أو سجلات سابقة.
    - `truncate()` داخل أي هجرة أو كود تشغيلي.
- **قواعد إضافة أعمدة جديدة إلى جداول قديمة قائمة**:
  1. **إلزامية القيمة الفارغة أو الافتراضية**: أي عمود جديد يُضاف إلى جدول قائم يجب أن يكون إما:
     - قابلاً للقيمة الفارغة: `->nullable()`
     - أو يملك قيمة افتراضية واضحة وآمنة: `->default(...)`
  2. **منع الأعمدة الإلزامية غير المعرفة مسبقاً**: يُمنع إضافة عمود `NOT NULL` بدون قيمة افتراضية إلى جدول يحتوي على صفوف مسبقة، لتفادي فشل الهجرة وانهيار العمليات.
- **إلزامية دالة التراجع (`down()`) المعكوسة بدقة متناهية**:
  - يجب أن تحتوي كل هجرة على دالة `down()` قابلة للتراجع بشكل كامل ونظيف (`Reversible Migration`) تعيد المخطط إلى حالته السابقة بدقة دون ترك مخلفات.

```php
// ✅ هجرة آمنة وغير مدمرة لإضافة حقول جديدة لجدول موجود:
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        // حقل جديد اختياري مع قيمة افتراضية
        if (! Schema::hasColumn('users', 'login_portal')) {
            $table->string('login_portal')->default('web')->after('email');
        }
        // إضافة الحذف الناعم إن لم يكن موجوداً
        if (! Schema::hasColumn('users', 'deleted_at')) {
            $table->softDeletes()->after('updated_at');
        }
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        if (Schema::hasColumn('users', 'login_portal')) {
            $table->dropColumn('login_portal');
        }
        if (Schema::hasColumn('users', 'deleted_at')) {
            $table->dropSoftDeletes();
        }
    });
}
```

---

## 3. التحقق الوقائي بوجود الجداول والأعمدة (Defensive Schema Assertions)

- عند كتابة هجرات ترقية أو تعديل، استخدم دائمًا دوال الفحص الحذرة:
  - `Schema::hasTable('table_name')`
  - `Schema::hasColumn('table_name', 'column_name')`
- يضمن هذا الفحص عدم تعطل الهجرة إذا كانت قاعدة البيانات تحتوي بالفعل على العمود من إعدادات سابقة، أو إذا تم تشغيل الهجرة في بيئات مختلفة (Local, Staging, Production).

---

## 4. استراتيجية توسيع وانكماش المخطط (Expand and Contract Pattern)

عند الرغبة في تحسين عمود قديم أو استبداله بنمط جديد:

1. **المرحلة 1: التوسيع (Expand)**: إضافة العمود الجديد كـ `nullable()` بجانب العمود القديم.
2. **المرحلة 2: الكتابة المزدوجة والمزامنة (Dual-Write & Backfill)**:
   - تحديث منطق العمل ليكتب في كلا العمودين معاً.
   - تشغيل أمر ترحيل بيانات (Artisan Command / Job) لنقل البيانات القديمة إلى العمود الجديد بأمان.
3. **المرحلة 3: القراءة من الجديد (Read Transition)**: توجيه كافة عمليات القراءة إلى العمود الجديد بعد التأكد من اكتمال البيانات بنسبة 100%.
4. **المرحلة 4: الانكماش والأرشفة (Contract)**: فقط بعد استقرار النظام في الإنتاج، يُمكن أرشفة العمود القديم أو حذفه في هجرة منفصلة متفق عليها.

---

## 5. مصفوفة تطابق ومطابقة جداول `fursaty-old` في `fursaty-new`

قبل كتابة أي موديل أو عملية في المشروع الجديد، يجب الرجوع إلى هذه المصفوفة الملزمة:

| الجدول في القديم | المفتاح الأساسي | الأعمدة والعلاقات الحساسة القديمة | الإجراء والمعاملة في المشروع الجديد |
| --- | --- | --- | --- |
| **`countries`** | `_id` (string) | `_id`, `name_ar`, `name_en`, `flag` | **تثبيت المفتاح النصي**: في الموديل: `protected $primaryKey = '_id'; public $incrementing = false; protected $keyType = 'string';` |
| **`users`** | `id` (bigint) | `name`, `email`, `password`, `image`, `is_admin`, `status`, `country_id`, `social_id`, `social_type` | الحفاظ على كافة الأعمدة، دعم كلمات المرور القديمة، وإضافة أعمدة Passkeys و 2FA والـ SoftDeletes بهجرة ترقية آمنة. |
| **`details_user`** | `id` (bigint) | `user_id`, `bio`, `gender`, `birthday`, `phone`, `twitter`, `facebook`, `linkedIn`, `google`, `instagram`, `notification` (json) | موديل `UserDetail` أو `DetailsUser` بعلاقة `hasOne` مع `User`. الحفاظ على بنية الـ JSON للإشعارات. |
| **`scholarships`** | `id` (bigint) | `title_ar`, `title_en`, `description_ar`, `description_en`, `funding_type` (enum: full, partial, private), `content_ar`, `content_en`, `slug_ar`, `slug_en`, `deadline`, `image`, `admin_id`, `visit`, `country_id` | موديول `Scholarships`: الحفاظ التام على الأعمدة ومفاتيح اللغات `_ar` و `_en`. الربط مع `countries._id` والمشرف ناشر المنحة. |
| **`specializations`** | `id` (bigint) | `name_ar`, `name_en` | الحفاظ على الجدول، والربط بالمنح عبر جدول الوسيط `scholarship_specialization`. |
| **`scholarship_specialization`** | `id` (bigint) | `scholarship_id`, `specialization_id` | جدول وسيط للربط متعدد-إلى-متعدد (Many-to-Many). |
| **`degree_levels`** | `id` (bigint) | `name_ar`, `name_en` | الحفاظ على الجدول، والربط بالمنح عبر جدول الوسيط `scholarship_degree_level`. |
| **`scholarship_degree_level`** | `id` (bigint) | `scholarship_id`, `degree_level_id` | جدول وسيط للربط متعدد-إلى-متعدد (Many-to-Many). |
| **`blogs`** | `id` (bigint) | `title_ar`, `title_en`, `description_ar`, `description_en`, `content_ar`, `content_en`, `slug_ar`, `slug_en`, `image`, `admin_id` | موديول `Blog`: ضمان توافق الموديل مع الأعمدة الحالية أو استخدام Accessors للربط مع نظام الترجمات دون إتلاف النصوص الموجودة. |
| **`comments`** | `id` (bigint) | `user_id`, `scholarship_id` (nullable), `blog_id` (nullable), `parent_id` (nullable), `content` | يدعم التعليقات المتداخلة والردود على المنح أو المقالات. |
| **`advertisements`** | `id` (bigint) | `title`, `content`, `url`, `mobile_image`, `desktop_image`, `start_date`, `end_date`, `isActivate` | موديول `Advertisements`: الحفاظ على اسم العمود `isActivate` مع إضافة cast منطقي `boolean`. |
| **`customer_reviews`** | `id` (bigint) | `name`, `comment`, `rating`, `image` | جدول آراء العملاء والطلاب، تقييم 1-5. |
| **`visits`** | `id` (bigint) | `country_id` (references `countries._id`), `country_name`, `city`, `region` | جدول إحصائيات الزوار والدول. |
| **`admin_actions`** | `id` (bigint) | `admin_id`, `action`, `affected_table`, `affected_id`, `description` | سجل تدقيق العمليات الإدارية (Audit Logs). |

---

## 6. جسر التوافق للصلاحيات (Permissions Compatibility Bridge)

- في `fursaty-old`، كانت الصلاحيات تدار عبر:
  - جدول `permissions` (`id` كنص، `text`).
  - جدول `admin_permissions` (`admin_id` يشير لـ `users.id`، `permission_id` يشير لـ `permissions.id`).
  - عمود `users.is_admin` و `users.status`.
- في `fursaty-new`، نعتمد حزمة `spatie/laravel-permission` القياسية.
- **قاعدة التوافق**:
  1. يجب توفير أمر ترقية/بذر بذور (Migration/Seeder) يقوم بقراءة الصلاحيات الحالية من `admin_permissions` وتوليد أدوار وصلاحيات Spatie مطابقة لها لكل مستخدم.
  2. يجب توفير Accessors أو Methods مساعدة على موديل `User` مثل:
     - `isAdmin(): bool` يفحص إما دور Spatie (`hasRole('super-admin')` أو `hasRole('admin')`) أو عمود `is_admin == true`.
     - `isActive(): bool` يفحص `status == true`.
  3. يضمن ذلك أن أي كود أو مستخدم قديم يظل يعمل دون انقطاع، مع الاستفادة الكاملة من نظام الصلاحيات الحديث.

---

## 7. بروتوكول فحص الكود قبل إنشاء أي هجرة أو موديل (Pre-Migration Checklist)

قبل إنشاء أو تعديل أي ملف في قاعدة البيانات أو الموديلات:

- [ ] هل راجعت ملف الهجرة الأصلي المقابل في `fursaty-old/database/migrations`؟
- [ ] هل تطابقت أسماء الجداول وأسماء الأعمدة بنسبة 100%؟
- [ ] هل تم التحقق من نوع المفتاح الأساسي (خاصة في `countries._id`)؟
- [ ] هل تم فحص الأعمدة الجديدة والتأكد من أنها إما `nullable()` أو تملك `default()`؟
- [ ] هل تحتوي دالة `down()` على منطق عكسي كامل وآمن؟
- [ ] هل تم استخدام `Schema::hasTable` و `Schema::hasColumn` لتجنب أخطاء تكرار الأعمدة؟
- [ ] هل تم تجنب أي أمر حذف مباشر لبيانات حية؟
