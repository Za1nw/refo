---
name: laravel-modules-workflow
description: Comprehensive guide and CLI command reference for managing modular applications in fursaty-new using nwidart/laravel-modules (php artisan module:*). Use this skill whenever creating a new module (module:make), generating module classes (actions, controllers, models, migrations, requests, resources, services, repositories, seeders, factories, tests, policies, enums), running module migrations and seeders, enabling/disabling modules, configuring module routes, and synchronizing module assets and TypeScript paths.
---

# مهارة ودليل التعامل مع الموديولات (Laravel Modules Workflow & CLI Reference)

> **المرجع الهندسي الشامل والعملي لإنشاء وإدارة وتطوير الموديولات في نظام فرصتي (`nwidart/laravel-modules`) عبر موجه الأوامر (Artisan CLI) والمعمارية المعيارية الموحدة.**

---

## 1. المعمارية المعيارية الإلزامية للموديول

كل موديول يتم إنشاؤه داخل مجلد `Modules/{ModuleName}/` يجب أن يلتزم بالهيكل المعياري التالي (وفقاً لإعدادات `config/modules.php` وقواعد المشروع المعمارية):

```text
Modules/{ModuleName}/
├── app/                                 ← كافة فئات وتطبيقات الباك-إند تعيش حصراً هنا
│   ├── Actions/                         ← منطق الأعمال الفردي (Single-responsibility actions)
│   ├── DTOs/                            ← كائنات نقل البيانات المهيكلة (Data Transfer Objects)
│   ├── Enums/                           ← التعدادات والقيم الثابتة
│   ├── Http/
│   │   ├── Controllers/                 ← متحكمات رفيعة (Admin & API Controllers)
│   │   ├── Middleware/                  ← طبقات التصفية الخاصة بالموديول
│   │   └── Requests/                    ← كائنات التحقق (Form Requests)
│   ├── Models/                          ← نماذج Eloquent والعلاقات
│   ├── Policies/                        ← سياسات الصلاحيات
│   ├── Providers/                       ← مزودات الخدمة (Route & Module Service Providers)
│   ├── Repositories/                    ← طبقة المستودعات (إن وجدت)
│   ├── Services/                        ← خدمات الاستعلام والتجميع
│   └── Transformers/                    ← موارد التحويل للعرض (Json Resources & Collections)
├── config/
│   └── config.php                       ← إعدادات الموديول الخاصة
├── database/
│   ├── factories/                       ← مصانع الاختبارات (Model Factories)
│   ├── migrations/                      ← هجرات الجداول غير المدمرة
│   └── seeders/                         ← بذور البيانات الأولية
├── lang/
│   ├── ar/                              ← ملفات الترجمة العربية
│   └── en/                              ← ملفات الترجمة الإنجليزية
├── resources/
│   └── assets/
│       └── admin/                       ← فرونت إند لوحة التحكم (React + Inertia + TanStack)
│           ├── pages/                   ← نقاط دخول صفحات Inertia
│           ├── components/              ← مكونات الواجهة والجداول والنماذج
│           ├── hooks/                   ← هوكات الجدول والعمليات والمزامنة
│           ├── types/                   ← تعريفات TypeScript
│           ├── services/                ← دوال الاتصال بالخادم عبر Wayfinder
│           └── lables/                  ← تسميات الأعمدة
├── routes/
│   ├── web.php                          ← مسارات لوحة التحكم وصفحات Inertia
│   └── api.php                          ← مسارات واجهات الـ REST API الموثقة
└── tests/
    ├── Feature/                         ← اختبارات الميزات (Pest Feature Tests)
    └── Unit/                            ← اختبارات الوحدات (Pest Unit Tests)
```

> [!CAUTION]
> **حظر الهيكلية القديمة**: يُمنع منعاً باتاً إنشاء مجلدات `Actions`, `Models`, `Services`, `Http` مباشرة تحت جذر الموديول `Modules/{ModuleName}/`. يجب أن تكون جميعها داخل مجلد `Modules/{ModuleName}/app/`.

---

## 2. الدليل المرجعي لكافة أوامر Artisan الخاصة بالموديولات (`php artisan module:*`)

### أ. إدارة دورة حياة الموديول (Module Lifecycle)

| الأمر | الوصف | مثال تطبيقي |
| --- | --- | --- |
| `module:make <Name>` | إنشاء موديول جديد وتوليد هيكله الأساسي | `php artisan module:make Users` |
| `module:make --plain <Name>` | إنشاء موديول بسيط دون الموارد الافتراضية | `php artisan module:make Payment --plain` |
| `module:enable <Name>` | تفعيل موديول في `modules_statuses.json` | `php artisan module:enable Users` |
| `module:disable <Name>` | تعطيل موديول مؤقتاً | `php artisan module:disable Users` |
| `module:delete <Name>` | حذف الموديول بالكامل من التطبيق | `php artisan module:delete OldModule` |
| `module:install <vendor/name>` | تثبيت موديول من حزمة خارجية | `php artisan module:install vendor/module-name` |
| `module:update [Name]` | تحديث اعتماديات موديول محدد أو كافة الموديولات | `php artisan module:update Users` |
| `module:setup` | تهيئة مجلد الموديولات لأول مرة في النظام | `php artisan module:setup` |
| `module:list` | عرض قائمة كافة الموديولات وحالة تفعيلها | `php artisan module:list` |
| `module:list-commands [Name]` | استعراض كافة الأوامر المتاحة لموديول معين | `php artisan module:list-commands Users` |
| `module:use <Name>` | تعيين موديول افتراضي لتنفيذ الأوامر اللاحقة عليه | `php artisan module:use Users` |
| `module:unuse` | إلغاء تعيين الموديول الافتراضي | `php artisan module:unuse` |
| `module:v6:migrate` | ترقية حالات الموديولات من v5 إلى v6 | `php artisan module:v6:migrate` |

---

### ب. توليد طبقة منطق الأعمال والخدمات (Actions, DTOs & Services)

| الأمر | الوصف | مكان التوليد | مثال تطبيقي |
| --- | --- | --- | --- |
| `module:make-action` | توليد فئة Action لمنطق العمل الفردي | `app/Actions/` | `php artisan module:make-action CreateAdminUserAction Users` |
| `module:make-action -i` | توليد فئة Invokable Action (`__invoke`) | `app/Actions/` | `php artisan module:make-action DeleteAdminUserAction Users -i` |
| `module:make-service` | توليد فئة خدمة لاستعلامات وتنسيق البيانات | `app/Services/` | `php artisan module:make-service AdminUserService Users` |
| `module:make-repository` | توليد فئة مستودع للبيانات | `app/Repositories/` | `php artisan module:make-repository UserRepository Users` |
| `module:make-class` | توليد كلاس عام (يُستخدم لـ DTOs والمحولات) | `app/Classes/` أو `app/DTOs/` | `php artisan module:make-class DTOs/AdminUserData Users` |
| `module:make-helper` | توليد فئة دوال مساعدة | `app/Helpers/` | `php artisan module:make-helper UserHelper Users` |
| `module:make-interface` | توليد واجهة برمجية (Interface) | `app/Interfaces/` | `php artisan module:make-interface UserRepositoryInterface Users` |
| `module:make-trait` | توليد Trait قابل لإعادة الاستخدام | `app/Traits/` | `php artisan module:make-trait HasAdminStatus Users` |

---

### ج. توليد طبقة الـ HTTP والمتحكمات والواجهات (Controllers, Requests, Resources & Inertia)

| الأمر | الوصف | مكان التوليد | مثال تطبيقي |
| --- | --- | --- | --- |
| `module:make-controller` | توليد متحكم للموديول (يدعم المجلدات الفرعية) | `app/Http/Controllers/` | `php artisan module:make-controller Admin/UserController Users` |
| `module:make-controller --api` | توليد متحكم مخصص للـ API | `app/Http/Controllers/` | `php artisan module:make-controller Api/v1/UserController Users --api` |
| `module:make-request` | توليد Form Request للتحقق من المدخلات | `app/Http/Requests/` | `php artisan module:make-request Admin/StoreAdminUserRequest Users` |
| `module:make-resource` | توليد API Transformer / JsonResource | `app/Transformers/` | `php artisan module:make-resource AdminUserResource Users` |
| `module:make-resource -c` | توليد مجموعة موارد Resource Collection | `app/Transformers/` | `php artisan module:make-resource AdminUserCollection Users -c` |
| `module:make-middleware` | توليد ميدلوير لتصفية الطلبات | `app/Http/Middleware/` | `php artisan module:make-middleware EnsureUserIsAdmin Users` |
| `module:make-rule` | توليد قاعدة تحقق مخصصة (Validation Rule) | `app/Rules/` | `php artisan module:make-rule ValidAdminRole Users` |
| `module:make-inertia-page` | توليد صفحة Inertia للموديول | `resources/assets/admin/pages/` | `php artisan module:make-inertia-page users Users` |
| `module:make-inertia-component` | توليد مكوّن Inertia قابل لإعادة الاستخدام | `resources/assets/admin/components/` | `php artisan module:make-inertia-component UserTable Users` |
| `module:make-view` | توليد قالب عرض Blade (إن لزم) | `resources/views/` | `php artisan module:make-view email-receipt Users` |
| `module:make-component` | توليد كلاس مكوّن Blade | `app/View/Components/` | `php artisan module:make-component UserBadge Users` |
| `module:make-component-view` | توليد ملف Blade لمكوّن View | `resources/views/components/` | `php artisan module:make-component-view user-badge Users` |

---

### د. توليد وتعديل قاعدة البيانات (Models, Migrations, Seeders & Factories)

| الأمر | الوصف | مكان التوليد | مثال تطبيقي |
| --- | --- | --- | --- |
| `module:make-model` | توليد نموذج Eloquent | `app/Models/` | `php artisan module:make-model AdminProfile Users` |
| `module:make-model -m` | توليد نموذج مع هجرة جدول تلقائية | `app/Models/` + `database/migrations/` | `php artisan module:make-model UserLog Users -m` |
| `module:make-migration` | إنشاء هجرة جديدة للموديول | `database/migrations/` | `php artisan module:make-migration add_status_to_users_table Users` |
| `module:make-factory` | توليد مصنع وهمي للبيانات | `database/factories/` | `php artisan module:make-factory UserFactory Users` |
| `module:make-seed` | توليد بذور بيانات للموديول | `database/seeders/` | `php artisan module:make-seed UsersDatabaseSeeder Users` |
| `module:make-cast` | توليد Eloquent Cast مخصص | `app/Casts/` | `php artisan module:make-cast JsonSettingsCast Users` |
| `module:make-scope` | توليد Scope استعلام للموديل | `app/Models/Scopes/` | `php artisan module:make-scope ActiveScope Users` |
| `module:make-observer` | توليد مراقب أحداث الموديل (Observer) | `app/Observers/` | `php artisan module:make-observer UserObserver Users` |
| `module:model-show` | عرض معلومات تفصيلية عن الموديل وأعمدته | سطر الأوامر | `php artisan module:model-show User Users` |
| `module:prune` | تشذيب السجلات القديمة تلقائياً للموديل | قاعدة البيانات | `php artisan module:prune Users` |

---

### هـ. تشغيل الهجرات والبذور (Migrations & Seeders Operations)

| الأمر | الوصف | خيارات هامة | مثال تطبيقي |
| --- | --- | --- | --- |
| `module:migrate` | تشغيل هجرات موديول محدد أو كافة الموديولات | `[module]`, `--subpath=` | `php artisan module:migrate Users` |
| `module:migrate-status` | عرض حالة الهجرات المنفذة والمعلقة للموديول | `[module]` | `php artisan module:migrate-status Users` |
| `module:migrate-rollback` | التراجع عن آخر دفعة هجرات للموديول | `[module]` | `php artisan module:migrate-rollback Users` |
| `module:migrate-refresh` | التراجع عن الهجرات وإعادة تنفيذها | `[module]` | `php artisan module:migrate-refresh Users` |
| `module:migrate-reset` | إعادة تعيين والتراجع عن كافة هجرات الموديول | `[module]` | `php artisan module:migrate-reset Users` |
| `module:migrate-fresh` | تصفية الجداول وإعادة تشغيل هجرات الموديول | `[module]` | `php artisan module:migrate-fresh Users` |
| `module:seed` | تشغيل Seeder الموديول | `[module]`, `--class=` | `php artisan module:seed Users` |

> [!CAUTION]
> **قاعدة حظر الأوامر التدميرية**: يُحظر نهائياً تشغيل `module:migrate-fresh` أو `module:migrate-reset` على قواعد البيانات التي تحتوي على بيانات إنتاجية حية (مثل `fursaty_db`) لحماية البيانات الحالية من الضياع (Zero Data Loss Policy).

---

### و. اختبارات الموديول (Testing & QA)

| الأمر | الوصف | مكان التوليد | مثال تطبيقي |
| --- | --- | --- | --- |
| `module:make-test` | إنشاء اختبار Feature لموديول | `tests/Feature/` | `php artisan module:make-test AdminUserManagementTest Users` |
| `module:make-test --unit` | إنشاء اختبار Unit لموديول | `tests/Unit/` | `php artisan module:make-test UserDtoTest Users --unit` |
| `module:update-phpunit-coverage` | تحديث `phpunit.xml` بمسارات الموديولات المفعلة | ملف `phpunit.xml` | `php artisan module:update-phpunit-coverage` |

**لتشغيل اختبارات الموديول عبر Pest**:

```bash
php artisan test Modules/Users/tests/Feature/AdminUserManagementTest.php --compact
```

---

### ز. الأحداث، الإشعارات، المزودات، والمهام (Events, Jobs, Providers & Notifications)

| الأمر | الوصف | مكان التوليد | مثال تطبيقي |
| --- | --- | --- | --- |
| `module:make-event` | إنشاء حدث للموديول | `app/Events/` | `php artisan module:make-event AdminUserCreated Users` |
| `module:make-listener` | إنشاء مستمع للحدث | `app/Listeners/` | `php artisan module:make-listener LogAdminUserActivity Users` |
| `module:make-job` | إنشاء مهمة طابور (Queue Job) | `app/Jobs/` | `php artisan module:make-job SendAdminWelcomeEmail Users` |
| `module:make-notification` | إنشاء فئة إشعار (قاعدة بيانات/بريد/SMS) | `app/Notifications/` | `php artisan module:make-notification PasswordResetAlert Users` |
| `module:make-mail` | إنشاء فئة بريد إلكتروني (Mailable) | `app/Emails/` | `php artisan module:make-mail AdminAccountActivatedMail Users` |
| `module:make-policy` | إنشاء سياسة أمان وصلاحيات | `app/Policies/` | `php artisan module:make-policy UserPolicy Users` |
| `module:make-command` | إنشاء أمر Artisan خاص بالموديول | `app/Console/` | `php artisan module:make-command SyncUsersCommand Users` |
| `module:make-enum` | إنشاء فئة Enum بالقيم المسموحة | `app/Enums/` | `php artisan module:make-enum UserStatus Users` |
| `module:make-channel` | إنشاء قناة بث أحداث حية (Broadcast Channel) | `app/Broadcasting/` | `php artisan module:make-channel AdminNotificationChannel Users` |
| `module:make-exception` | إنشاء استثناء مخصص للموديول | `app/Exceptions/` | `php artisan module:make-exception UserSuspendedException Users` |
| `module:make-provider` | إنشاء مزود خدمة للموديول (Service Provider) | `app/Providers/` | `php artisan module:make-provider UserCustomServiceProvider Users` |
| `module:make-event-provider` | إنشاء مزود خدمة للأحداث (Event Provider) | `app/Providers/` | `php artisan module:make-event-provider EventServiceProvider Users` |
| `module:route-provider` | إنشاء مزود خدمة التوجيه (Route Provider) | `app/Providers/` | `php artisan module:route-provider RouteServiceProvider Users` |
| `module:make-replacement` | إنشاء أمر استبدال الكلمات في الـ Stubs | `app/Console/` | `php artisan module:make-replacement StubReplacement Users` |

---

### ح. التصدير والنشر والتوليد التلقائي (Publishing & Autoloading)

| الأمر | الوصف | مثال تطبيقي |
| --- | --- | --- |
| `module:publish` | نشر ملفات الموديول الثابتة (Assets) | `php artisan module:publish Users` |
| `module:publish-config` | نشر ملف إعدادات الموديول إلى `config/` الرئيسي | `php artisan module:publish-config Users` |
| `module:publish-translation` | نشر ملفات الترجمة إلى مجلد `lang/` الرئيسي | `php artisan module:publish-translation Users` |
| `module:publish-migration` | نشر هجرات الموديول إلى `database/migrations` الرئيسي | `php artisan module:publish-migration Users` |
| `module:publish-inertia` | نشر وتكوين ملف Inertia `app.js` للموديولات | `php artisan module:publish-inertia` |
| `module:dump` | إعادة بناء Autoload لـ Composer الخاص بالموديول | `php artisan module:dump Users` |
| `module:composer-update` | تحديث الـ Autoloading لكافة الموديولات | `php artisan module:composer-update` |
| `module:lang` | فحص مفاتيح الترجمة المفقودة للموديول | `php artisan module:lang Users` |

---

## 3. خطة العمل المتكاملة لإنشاء موديول جديد في مشروع فرصتي

عند طلب إنشاء موديول جديد (مثلاً `Scholarships` أو `Advertisements` أو `Reviews`)، اتبع الخطوات العشر التالية بالترتيب:

### الخطوة 1: إنشاء الموديول بالأمر الرسمي

```bash
php artisan module:make NameModule
```

### الخطوة 2: التأكد من تفعيل الموديول

تحقق من وجود `"NameModule": true` في `modules_statuses.json`، أو نفّذ:

```bash
php artisan module:enable NameModule
```

### الخطوة 3: توليد مكونات الباك-إند بأوامر Artisan المخصصة

```bash
# إنشاء كائن نقل البيانات DTO
php artisan module:make-class DTOs/NameData NameModule

# إنشاء إجراءات الأعمال Actions
php artisan module:make-action CreateNameAction NameModule
php artisan module:make-action UpdateNameAction NameModule
php artisan module:make-action DeleteNameAction NameModule

# إنشاء المتحكم وطلبات التحقق والموارد
php artisan module:make-controller Admin/NameController NameModule
php artisan module:make-request Admin/StoreNameRequest NameModule
php artisan module:make-request Admin/UpdateNameRequest NameModule
php artisan module:make-resource NameResource NameModule
php artisan module:make-resource NameCollection NameModule -c
php artisan module:make-service NameService NameModule
```

### الخطوة 4: تعريف المسارات ومتحكم الـ Inertia

- في `Modules/NameModule/routes/web.php`:
  - عرّف مسارات لوحة التحكم تحت بادئة الآدمن واسم الراوت `admin.names.*`.
- في المتحكم:
  - استدعِ صفحة Inertia بالصيغة المعيارية:

    ```php
    return Inertia::render('NameModule::names', [
        'names' => $namesData,
    ]);
    ```

### الخطوة 5: توليد دوال التوجيه للفرونت إند عبر Wayfinder

تأكد من تمرير مسار مجلد الآدمن:

```bash
php artisan wayfinder:generate --path=resources/admin/
```

### الخطوة 6: إنشاء هيكل الفرونت إند العصري

تحت `Modules/NameModule/resources/assets/admin/`:

1. `types/`: واجهات TypeScript.
2. `services/`: دوال استدعاء API عبر راوتات Wayfinder.
3. `lables/`: تسميات الأعمدة المترجمة `getNameColumnLabels.ts`.
4. `cells/`: خلايا الجدول المخصصة (`HoverCard`, `Badge`, `SwitchCell`) مع تغليفها بـ `<TableCell>`.
5. `hooks/`: الهوكات الأربعة (`useActions`, `useColumns`, `useServerSync`, `useTable`).
6. `components/names/views/`: مجلد العروض المفصولة (`CardsView`, `ListView`, `EmptyState`, `RowSkeleton`, `Card`, `useViews`, `index.ts`).
7. `components/names/`: نموذج الـ Drawer ونوافذ الـ Dialogs ومكون `SectionListNames`.
8. `pages/names.tsx`: صفحة Inertia الرفيعة مع إعداد التتبع:

   ```tsx
   Names.layout = {
       breadcrumbs: [{ title: 'title', href: '#', namespace: 'names' }],
   };
   ```

### الخطوة 7: مزامنة مسارات TypeScript ومسارات Vite

نفّذ السكربت لتسجيل الـ Alias الجديد `@namemodule/*` تلقائياً في `tsconfig.paths.json`:

```bash
node generate-tsconfig-paths.js
```

### الخطوة 8: الترجمة الشاملة ومنع النصوص الثابتة (Zero Hardcoded Text)

- أنشئ ملفات الترجمة:
  - `Modules/NameModule/lang/ar/names.php`
  - `Modules/NameModule/lang/en/names.php`
- تأكد أن كل نص وظاهر في الفرونت إند يستدعى عبر `t(...)` أو `tMain(...)`.

### الخطوة 9: ربط الموديول بالقائمة الجانبية (MenuBuilder)

- أضف عنصر القائمة في `Modules/MenuBuilder/config/config.php` تحت `main`.
- شغّل Seeder القائمة الجانبية لتثبيته وربط الصلاحيات:

  ```bash
  php artisan db:seed --class="Modules\MenuBuilder\Database\Seeders\MenuBuilderDatabaseSeeder"
  ```

### الخطوة 10: الفحص والتحقق الآلي

- فحص أنواع TypeScript:

  ```bash
  npx tsc --noEmit
  ```

- تنسيق الكود بـ Pint:

  ```bash
  vendor/bin/pint --dirty --format agent
  ```

- إنشاء وتشغيل اختبارات Pest:

  ```bash
  php artisan module:make-test NameManagementTest NameModule
  php artisan test Modules/NameModule/tests/Feature/NameManagementTest.php --compact
  ```
