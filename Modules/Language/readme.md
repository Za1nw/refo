# وحدة الترجمة (Module: Language)

دليل شامل بالعربية لوحدة الترجمات في المشروع — يشمل مقدمة، تركيب، تهيئة، أمثلة استخدام عملية، شرح الملفات الرئيسية، ملاحظات عن الكاش، المهاجرات، وإرشادات اختبار واستكشاف الأخطاء.

---

**محتوى الدليل**
- **مقدمة**: ما الذي تفعله الوحدة ولماذا.
- **المتطلبات**: ما يلزم قبل التشغيل.
- **التثبيت والتفعيل**: كيفية تفعيل الوحدة وتسجيل مزود الخدمة إن احتاج.
- **التكوين**: مفاتيح الإعدادات المهمة.
- **استخدام سريع**: دوال المساعدة (`getTranslations`, `t`) وواجهات Inertia.
- **أمثلة عملية**: شفرات توضيحية للاستخدام في Controllers وViews.
- **الملفات الرئيسية**: شرح `TranslationsExporter`, `TranslationServiceProvider`, `InertiaModuleShare`, نموذج `Language`, وconcern للكاش.
- **الكاش**: كيفية عمل الكاش ومفاتيح الكاش المهمة.
- **المهاجرات**: معلومات عن جدول `languages` وهيكله.
- **الاختبار واستكشاف الأخطاء**: نصائح لاختبار الميزة وحل المشاكل الشائعة.
- **المساهمة** و **الترخيص**.

---

**مقدمة**

وحدة `Language` مسؤولة عن إدارة الترجمات المخصصة التي تُخزن في قاعدة البيانات بالإضافة إلى دمجها مع ملفات الترجمة الموجودة في المشروع. الهدف تمكين تعديل الترجمات من الواجهة (UI) بدون الحاجة لتعديل ملفات PHP مباشرة، مع آلية لدمج ترجمات الـ DB مع ترجمات الملفات (مع أسبقية الـ DB).

**المزايا الأساسية**
- دمج ترجمات الملفات مع ترجمات قاعدة البيانات.
- كاش دائم لسجلات الترجمات لتسريع القراءة.
- دعم نطاقات (namespaces) ومجموعات (groups) ترجمة متعددة.
- واجهات مساعدة للاستخدام في Inertia وHelpers.

---

**المتطلبات**

- Laravel مثبتة ومهيأة (هذا المشروع يستخدم Laravel 12).
- وجود Module `Language` مُضاف (نمط nwidart modules مستخدم في المشروع).
- تم تشغيل المهاجرات لإنشاء جدول `languages` (انظر قسم المهاجرات).

---

**التثبيت والتفعيل**

1. تأكد من أن الموديول موجود في `Modules/Language` وأنه مُفعّل عبر ملف `modules_statuses.json` أو إعدادات المشروع.
2. إذا كانت هناك حاجة لتسجيل مزود الخدمة يدوياً، فتأكد من أن `TranslationServiceProvider` مُحمّل (في الحالة العادية الموديول يقوم بتسجيله تلقائيًا).

---

**التكوين**

- تحقق من `config/app.php` و `config/locale` (إن وُجد) لتحديد `locale` و `fallback_locale` و `rtl_locales`.
- مفاتيح الكاش تستخدم `Cache::rememberForever`، فاحرص على وجود موفر كاش صالح (Redis/Memcached/Filesystem).

---

**استخدام سريع**

الدوال المساعدة المتاحة:

- `getTranslations($locale = null, $namespaces = null, $groups = ['*'])` — يعيد مصفوفة التراجم مدموجة من الملفات وDB.
- `t(string $key, ?string $default = null, array $replace = [], ?string $locale = null): string` — تغليف لـ `trans()` مع دعم قيمة افتراضية إذا لم توجد الترجمة.

أمثلة:

1) استدعاء التراجم ككل (مثال من Controller أو Provider):

```php
$translations = getTranslations(); // تحميل التراجم للـ app locale
```

2) تحميل مجموعات معينة أو مساحة أسماء:

```php
// تحميل مجموعة 'main' من مساحة الاسم الافتراضية
$main = getTranslations(locale: 'ar', namespaces: null, groups: 'main');

// تحميل كل المجموعات من مساحة اسم 'blog'
$blogAll = getTranslations(namespaces: 'blog', groups: ['*']);
```

3) استخدام دالة `t()` لعرض قيمة مع قيمة افتراضية:

```php
echo t('validation.required', 'هذا الحقل مطلوب');
```

---

**كيف يُستخدم داخل Controller مع Inertia**

الفكرة هنا ليست مجرد "إرسال ترجمة"، بل تجهيز بيانات مشتركة للواجهة كلها عبر `Inertia::share()` من داخل الـ Controller الأساسي أو أي Controller للموديول.

المثال العملي الموجود في [app/Http/Controllers/Controller.php](app/Http/Controllers/Controller.php) يعمل كالتالي:

```php
protected ?string $inertiaModuleConfigKey = null;
protected ?string $inertiaModuleFallbackName = null;
protected array|string|null $inertiaTranslationNamespaces = null;
protected array|string $inertiaTranslationGroups = ['*'];

public function __construct()
{
	 // يشارك اتجاه الصفحة + بيانات الموديول + الترجمات
}
```

شرح المتغيرات:

- `inertiaModuleConfigKey`: مفتاح الإعداد الذي يحتوي اسم الموديول في `config(...)`.
- `inertiaModuleFallbackName`: الاسم الافتراضي إذا لم توجد قيمة في الإعداد.
- `inertiaTranslationNamespaces`: مصدر الترجمات الذي تريد تحميله. يمكن أن يكون:
  - `null` لتحميل كل ما هو متاح حسب منطق المصدّر.
  - `'blog'` لتحميل ترجمات موديول `Blog`.
  - `['blog', 'main']` لتحميل أكثر من namespace.
- `inertiaTranslationGroups`: المجموعات المطلوبة داخل كل namespace. القيمة `['*']` تعني كل المجموعات.

النتيجة النهائية التي تصل إلى الواجهة تكون عادة في:

```php
page.props.translations
```

وهذا يعني أن الواجهة تستطيع قراءة الترجمات مباشرة دون استدعاء إضافي لكل صفحة.

---

**مصدر الترجمات: هل هي من الموديول أم من Laravel الأساسي؟**

هذا المشروع يدعم المصدرين معًا:

1. **ترجمات Laravel الأساسية**
	- تكون داخل `lang/{locale}`.
	- مثال: `lang/ar/main.php` أو `lang/en/validation.php`.
	- هذه تُقرأ عندما يكون الـ namespace `default` أو عندما تستخدم `getTranslations()` بدون تحديد موديول مخصص.

2. **ترجمات الموديول**
	- تكون داخل `Modules/{Module}/lang/{locale}`.
	- مثال: `Modules/Language/lang/ar/main.php` أو `Modules/Blog/lang/en/messages.php`.
	- هذه تُقرأ عندما تحدد namespace مثل `blog` أو `language`.

إذا كان عندك الملف في `lang` الأساسي، فاختر namespace الافتراضي. وإذا كان الملف داخل `Modules/.../lang` فاستعمل اسم الموديول المناسب.

أمثلة واضحة:

```php
// من Laravel lang الأساسي
getTranslations(locale: 'ar', namespaces: null, groups: 'main');

// من Module اسمه Blog
getTranslations(locale: 'ar', namespaces: 'blog', groups: 'messages');

// من أكثر من مصدر
getTranslations(locale: 'ar', namespaces: ['blog', 'main'], groups: ['messages', 'validation']);
```

---

**أمثلة عملية: مشاركة التراجم عبر Inertia**

في `Controller` أساسي للموديول نمرّر أسماء مساحات الترجمة والمجموعات:

```php
protected array|string|null $inertiaTranslationNamespaces = ['blog', 'main'];
protected array|string $inertiaTranslationGroups = ['*'];

// ثم يتم استدعاء app(InertiaModuleShare::class)->share(...) تلقائياً
```

في الواجهة (React / Vue عبر Inertia) ستجد كائن `page.props.translations` يشبه الشكل:

```json
{
	"ar": {
		"main": { "hello": "مرحبا" },
		"validation": { ... }
	}
}
```

---

**الملفات والواجهات البرمجية الرئيسية**

- `TranslationsExporter` — [Modules/Language/app/Services/TranslationsExporter.php](Modules/Language/app/Services/TranslationsExporter.php)
	- دالة رئيسية: `export(?string $locale = null, array|string|null $namespaces = null, array|string $groups = ['*']): array`
	- خطوات عملها: تحديد المساحات، إيجاد المسارات، قراءة ملفات PHP للمجموعات، قراءة ترجمات DB عبر `Language::getAllLang(...)`، ثم دمجهم مع أسبقية DB.

- `helpers.php` — دوال مساعدة: `getTranslations()` و `t()` (للاستخدام السهل في الكود).

- `TranslationServiceProvider` — [Modules/Language/app/Providers/TranslationServiceProvider.php](Modules/Language/app/Providers/TranslationServiceProvider.php)
	- يسجل `translation.loader` مخصص و`translator` لاستخدام Custom loader إن لزم.

- `InertiaModuleShare` — [app/Support/Inertia/InertiaModuleShare.php](app/Support/Inertia/InertiaModuleShare.php)
	- يشارك اسم الموديول و (شريطة تمكين موديول Language) يقوم باستدعاء `TranslationsExporter` لتمرير التراجم إلى Inertia.

- `Language` (Model) — [Modules/Language/app/Models/Language.php](Modules/Language/app/Models/Language.php)
	- يَستخدم concern `CachesLanguageTranslations` لمسح وبناء كاش التراجم عند التحديث.

- `CachesLanguageTranslations` — [Modules/Language/app/Models/Concerns/CachesLanguageTranslations.php](Modules/Language/app/Models/Concerns/CachesLanguageTranslations.php)
	- يوفر `getAllLang($namespace, $group)` و `flushCache($namespace, $group)`, ويستخدم `Cache::rememberForever`.

---

**الكاش والسلوكيات المهمة**

- مفاتيح الكاش رئيسية:
	- `lang.all`
	- `lang.all.group.{group}`
	- `lang.for.{namespace}`
	- `lang.for.{namespace}.group.{group}`

- عند حفظ أو حذف أو استعادة سجل من `languages`, يتم استدعاء `flushCache()` لمسح المفاتيح المتأثرة.

- نصيحة: عند نشر تغييرات في الترجمة عبر لوحة تحكم، تأكد أن أيّ عملية تحديث للـ DB تستدعي flushCache أو أن التغييرات تتم عبر Eloquent (الذي يستدعي الأحداث تلقائياً).

---

**المهاجرات (Migration)**

- يوجد ملف المهاجرة لإنشاء جدول `languages`: [Modules/Language/database/migrations/2026_01_20_104236_create_languages_table.php](Modules/Language/database/migrations/2026_01_20_104236_create_languages_table.php)

هيكل الجدول الأساسي:

```text
id | key | value | language(5) | group | namespace | timestamps | softDeletes

unique(key, language, group, namespace)
indexes: language, group, namespace
```

---

**الاختبار واستكشاف الأخطاء**

- اختبار وظائف الاستيراد/تصدير:
	- اكتب اختبار ميزة (Pest) يقوم بإدراج ترجمات في DB ثم يتأكد أن `getTranslations()` تُعيد القيم مع أولوية DB.
- التحقق من الكاش:
	- بعد تحديث سجل، تأكد أن `CachesLanguageTranslations::flushCache()` يُستدعى تلقائياً (الـ Model يُفعّل الحدث `saved`/`deleted`).
- مشاكل شائعة وحلول:
	- الترجمة لا تظهر في الواجهة: تأكد من أن الموديول `Language` مفعّل (راجع `modules_statuses.json`) وأن `InertiaModuleShare` يُحمّل.
	- تغييرات الملفات لا تُرى: تحقق من أن الملفات موجودة في المسارات المتوقعة (`lang/{locale}` أو `Modules/{Module}/lang/{locale}`).

---

**نصائح وممارسات**

- استخدم مفاتيح ترجمة واضحة وموحدة (مثال: `forms.user.email.required`).
- تجنب وضع نصوص طويلة كقِيَم افتراضية في الكود — استخدم التراجم دائمًا.
- عند إجراء تغييرات على الترجمات في بيئة الإنتاج، قد تحتاج لمسح كاش الذاكرة (أو إعادة تشغيل queue workers إذا كانوا يحتفظون بكاش في الذاكرة).

---

**المساهمة**

إذا رغبت بالمساهمة أو إضافة تحسينات:

1. افتح issue أو PR مع وصف مختصر للتغيير.
2. أضف/حدّث اختبارات (Pest) متعلقة بالتغييرات.
3. تأكد من تنسيق الكود عبر `vendor/bin/pint` قبل فتح PR.

---

**الترخيص**

يُرجى اتباع رخصة المشروع العامة (راجع ملف `LICENSE` في المستودع الأساسي).

---

إذا رغبت، أستطيع:
- إضافة أمثلة React/Vue تظهر كيفية استهلاك `page.props.translations`.
- كتابة اختبارات Pest توضح السلوك (getTranslations، merge precedence، و cache flushing).

أخبرني أي جزء تريدني أن أضيفه أو أوسّعه أولًا.

