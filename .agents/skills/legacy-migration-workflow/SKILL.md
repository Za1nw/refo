---
name: legacy-migration-workflow
description: Step-by-step workflow for migrating and converting legacy features, tables, and controllers from fursaty-old into the modern modular architecture of fursaty-new (Laravel Modules + React 19 + Inertia v3 + TanStack Table + Passkeys + Zero Hardcoded Text). Use this skill whenever migrating a domain (Scholarships, Blogs, Advertisements, Countries, Users/Admins, Reviews, Specializations, Comments, etc.) from fursaty-old to fursaty-new, refactoring legacy code into Modules/{ModuleName}/app, or creating modern admin tables and forms while preserving existing database schema and data.
---

# دليل ومنهجية ترحيل الموديولات من المشروع القديم (Legacy Migration Workflow)

> **دليل هندسي خطوة بخطوة لتحويل موديولات وخصائص النظام من `fursaty-old` إلى `fursaty-new` بأعلى معايير الجودة المعمارية وحماية البيانات والتصميم العصري.**

---

## المخطط العام لمراحل التحويل (Migration Lifecycle)

```text
[1. تدقيق المخطط القديم] ──> [2. مواءمة قاعدة البيانات] ──> [3. هيكلة الباك إند المعياري]
          │                                                          │
          ▼                                                          ▼
[6. الاختبار والتحقق Pint/Pest] <── [5. الترجمة الشاملة i18n] <── [4. تطوير الفرونت إند العصري]
```

---

## المرحلة 1: تدقيق الكود والمخطط القديم (Legacy Audit Phase)

قبل كتابة أي سطر كود للموديول في `fursaty-new`:

1. **فحص الهجرات القديمة**:
   - توجه إلى `fursaty-old/database/migrations` واقرأ ملفات الهجرة المتعلقة بالمورد (مثال: `create_scholarships_table.php`, `create_specializations_table.php`).
   - استخرج: أسماء الجداول الدقيقة، أسماء الأعمدة، المفاتيح الأساسية (مثل `_id` في `countries`)، الأنواع، القيود (`foreignId`, `nullable`, `default`, `enum`).

2. **فحص الموديلات القديمة**:
   - توجه إلى `fursaty-old/app/Models/` وافحص الموديل المقابل (مثل `Scholarship.php`, `Advertisement.php`).
   - افحص العلاقات (`belongsTo`, `hasMany`, `belongsToMany`)، الـ `$fillable`، الـ `$casts`، وأي Methods مساعدة.

3. **فحص المتحكمات والعمليات القديمة**:
   - توجه إلى `fursaty-old/app/Http/Controllers/` وافحص كيفية تنفيذ الـ CRUD، رفع الصور والملفات، تصفية البيانات، والتحقق من الصلاحيات.

---

## المرحلة 2: مواءمة قاعدة البيانات وحماية المخطط (Database Schema Harmonization)

وفقًا للقاعدة الصارمة في `.agents/rules/database-safety-and-legacy-compatibility.md`:

1. **مطابقة أسماء الجداول والأعمدة القديمة**:
   - يجب أن يتطابق الموديل الجديد مع الجدول القديم كما هو (مثل `$table = 'scholarships'`).
   - لا تُعد تسمية أي عمود موجود مسبقًا في قاعدة بيانات الإنتاج.

2. **إضافة التحسينات بهجرات آمنة وغير مدمرة**:
   - إذا تطلب التصميم الجديد أعمدة جديدة (مثل `is_featured`, `deleted_at`, `login_portal`):
     - يجب أن تكون **إما `nullable()` أو تملك `default()`**.
     - استخدم دائمًا الحراس الوقائيين: `if (! Schema::hasColumn(...))`.
     - اكتب دالة `down()` عكسية دقيقة.

3. **تثبيت المفاتيح الشاذة**:
   - لموديل `Country`:

     ```php
     protected $primaryKey = '_id';
     public $incrementing = false;
     protected $keyType = 'string';
     ```

   - لعمود `advertisements.isActivate`: يتم الحفاظ على نفس الاسم مع إضافة Cast.

---

## المرحلة 3: بناء طبقة الباك إند المعيارية (Modular Backend Architecture)

جميع ملفات الموديول توضع حصرًا داخل `Modules/{ModuleName}/app/`:

### 1. طبقة الموديل (`app/Models/`)

- تعريف الـ `$fillable` المطابق لأعمدة الجدول.
- تعريف العلاقات بكتابة الأنواع الصريحة (`BelongsTo`, `HasMany`, `BelongsToMany`).
- استخدام Spatie MediaLibrary لرفع الوسائط الحديثة مع الحفاظ على التوافق مع حقول الصور القديمة إن وجدت.

### 2. طبقة العمليات (`app/Actions/`)

- تحويل كافة العمليات الحسابية ومنطق الأعمال المعقد من الـ Controllers القديمة إلى كلاسات Action ذرية ومفردة المسؤولية:
  - `CreateScholarshipAction`
  - `UpdateScholarshipAction`
  - `DeleteScholarshipAction`
  - `ToggleAdvertisementStatusAction`

### 3. طبقة كائنات نقل البيانات (`app/DTOs/`)

- تمثيل بيانات الإدخال بكائنات DTO قوية التعيين (Strongly-Typed) مع دالة `fromRequest(FormRequest $request): self`.

### 4. طبقة التحقق (`app/Http/Requests/`)

- إنشاء Form Requests مخصصة لكل عملية (`StoreScholarshipRequest`, `UpdateScholarshipRequest`).
- عزل قواعد التحقق بالكامل عن المتحكم.

### 5. طبقة المتحكم الرفيع (`app/Http/Controllers/Admin/`)

- المتحكم رفيع جداً (Thin Controller):

  ```php
  public function index(Request $request): Response
  {
      return Inertia::render('scholarships/index', [
          'scholarships' => fn () => $this->scholarshipService->getPaginatedList($request),
      ]);
  }
  ```

---

## المرحلة 4: تصميم وتطوير الفرونت إند العصري (Modern Admin UI & TanStack Table)

وفقًا للقاعدة الإلزامية في `.agents/rules/frontend-tables-and-forms.md`:

### 1. موقع الملفات

- توضع ملفات الواجهة داخل:
  `Modules/{ModuleName}/resources/assets/admin/`
  - `pages/` (صفحات الدخول الخفيفة التابعة لـ Inertia).
  - `components/{resource}/` (المكونات، الجداول، النماذج).
  - `components/{resource}/views/` (العروض المتعددة: `CardsView`, `ListView`, `EmptyState`, `RowSkeleton`, `useViews`).
  - `hooks/` (`useActions`, `useColumns`, `useServerSync`, `useTable`).
  - `services/` (`service.ts`, `actions.service.ts`).

### 2. الأناقة البصرية الفاخرة (Premium Aesthetics)

- استبدال التصاميم القديمة البسيطة بواجهات فائقة الجمال:
  - ألوان متناسقة، ظلال ناعمة (soft shadows)، وحواف مدورة دقيقة.
  - دعم كامل للـ Dark Mode والـ Light Mode بانسيابية تامة.
  - دعم كامل للاتجاهين (RTL للغة العربية و LTR للغة الإنجليزية).

### 3. الجداول والعروض التفاعلية

- دعم أنماط العرض المتعددة: شبكة الكروت (Cards View)، القائمة (List View)، والجدول التقليدي (Table View).
- تفعيل هياكل التحميل التفاعلية (`Skeleton`) وتأثيرات الـ `shimmer`.
- استخدام الـ Drawers والـ Dialogs المدمجة للإضافة والتعديل السريع بدون مغادرة الصفحة.

---

## المرحلة 5: الترجمة الصارمة ومنع النصوص الثابتة (Zero Hardcoded Text Policy)

وفقًا للقاعدة الصارمة في `.agents/rules/i18n-and-translations.md`:

1. **تجهيز ملفات الترجمة في الباك إند**:
   - إنشاء `Modules/{ModuleName}/lang/ar/{resource}.php` و `lang/en/{resource}.php`.
   - تسجيل المجموعة في الـ Controller عبر `$inertiaTranslationGroups = ['{resource}'];`.

2. **استدعاء النصوص في الفرونت إند**:
   - استخدام `const { t } = useTranslation('{resource}');`.
   - النصوص العامة المشتركة تُستدعى من `const { t: tMain } = useTranslation('main');`.
   - صيغة المتغيرات: `{{variable}}` في الواجهات.
   - **يُحظر كتابة أي كلمة عربية أو إنجليزية ثابتة داخل ملفات `.tsx` أو `.ts`**.

---

## المرحلة 6: الاختبارات والتنسيق (Verification & Pint/Pest)

1. **كتابة اختبارات Pest**:
   - إنشاء اختبارات ميزات في `Modules/{ModuleName}/tests/Feature/` تفحص:
     - إمكانية قراءة وعرض البيانات القديمة.
     - نجاح عمليات الإضافة والتعديل والحذف.
     - حماية الصلاحيات والمصادقة (Passkeys/2FA/Role).

2. **تنسيق الكود**:
   - تشغيل `vendor/bin/pint --dirty --format agent` للتأكد من مطابقة الكود لمعايير Laravel Pint.
