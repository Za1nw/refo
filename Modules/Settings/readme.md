# توثيق نظام الإعدادات (Settings System)

---

# 1. الفكرة العامة للنظام

النظام مبني على مبدأ:

> فصل منطق الإعدادات بالكامل في Service مستقل بدل وضعه داخل Model أو تكراره في المشروع.

### الهدف الحقيقي:

* تقليل استعلامات قاعدة البيانات
* تحسين الأداء باستخدام الكاش
* توحيد التعامل مع الإعدادات
* تسهيل التوسعة لاحقًا

---

# 2. مكونات النظام (Architecture)

## 1) SettingsService (الأساس)

هو الطبقة الرئيسية التي تحتوي كل منطق الإعدادات.

### المسؤوليات:

* جلب الإعدادات
* حفظ الإعدادات
* حذف الإعدادات
* إدارة الكاش
* تحويل أنواع البيانات
* التعامل مع config

---

## 2) Model: Setting

الموديل مجرد واجهة فقط (Proxy).

لا يحتوي منطق حقيقي، فقط يحول العمليات إلى Service.

---

## 3) Helper function: setting()

واجهة سهلة وسريعة للاستخدام في أي مكان داخل التطبيق.

---

# 3. الكلاسات والدوال

---

# أولاً: SettingsService

المسار:

```
Modules/Settings/app/Services/SettingsService.php
```

---

## 1. all()

### الوظيفة:

جلب كل الإعدادات من الكاش

### الكود:

```php
public function all(): Collection
```

### مثال:

```php
$settings = app(SettingsService::class)->all();
```

### النتيجة:

* Collection مفهرسة بـ name
* أسرع في الوصول

---

## 2. get()

### الوظيفة:

جلب قيمة إعداد معين مع دعم default + type casting

```php
public function get(string $key, mixed $default = null): mixed
```

### مثال:

```php
$value = app(SettingsService::class)->get('site_name');
```

### مثال مع default:

```php
$value = app(SettingsService::class)->get('site_name', 'Default Name');
```

---

### مثال عبر helper:

```php
setting('site_name');
```

---

## 3. set()

### الوظيفة:

إنشاء أو تحديث إعداد

```php
public function set(string $key, mixed $value, string $type = 'string')
```

### مثال:

```php
app(SettingsService::class)->set('site_name', 'My App');
```

### باستخدام helper:

```php
setting(['site_name', 'My App']);
```

---

## 4. add()

### الوظيفة:

إضافة إعداد جديد (اختصار لـ set)

```php
public function add(string $key, mixed $value, string $type = 'string')
```

### مثال:

```php
app(SettingsService::class)->add('theme', 'dark');
```

---

## 5. remove()

### الوظيفة:

حذف إعداد

```php
public function remove(string $key): bool
```

### مثال:

```php
app(SettingsService::class)->remove('site_name');
```

---

## 6. has()

### الوظيفة:

التحقق من وجود إعداد

```php
public function has(string $key): bool
```

### مثال:

```php
if (app(SettingsService::class)->has('site_name')) {
    // موجود
}
```

---

## 7. flushCache()

### الوظيفة:

حذف كاش الإعدادات

```php
public function flushCache(): void
```

### مثال:

```php
app(SettingsService::class)->flushCache();
```

---

## 8. castValue()

### الوظيفة:

تحويل نوع القيمة تلقائيًا

```php
private function castValue(mixed $value, string $type): mixed
```

### التحويلات:

| النوع  | النتيجة              |
| ------ | -------------------- |
| int    | تحويل إلى رقم        |
| bool   | تحويل إلى true/false |
| string | كما هو               |

---

## 9. getValidationRules()

### الوظيفة:

جلب كل قواعد التحقق من config

```php
public function getValidationRules(): array
```

### مثال:

```php
$rules = app(SettingsService::class)->getValidationRules();
```

---

## 10. getSelectedValidationRules()

### الوظيفة:

جلب قواعد حقول محددة فقط

```php
public function getSelectedValidationRules(array $values): array
```

### مثال:

```php
$rules = app(SettingsService::class)->getSelectedValidationRules([
    'site_name',
    'email'
]);
```

---

## 11. getDataType()

### الوظيفة:

جلب نوع البيانات لحقل معين

```php
public function getDataType(string $field): string
```

### مثال:

```php
$type = app(SettingsService::class)->getDataType('site_name');
```

---

## 12. getDefaultValueForField()

### الوظيفة:

جلب القيمة الافتراضية من config

```php
public function getDefaultValueForField(string $field): mixed
```

### مثال:

```php
$default = app(SettingsService::class)->getDefaultValueForField('site_name');
```

---

# ثانياً: Model Setting

المسار:

```
Modules/Settings/app/Models/Setting.php
```

---

## أهم الفكرة:

هذا الموديل مجرد واجهة static.

---

## الدوال:

---

## 1. get()

```php
Setting::get('key');
```

---

## 2. set()

```php
Setting::set('key', 'value');
```

---

## 3. add()

```php
Setting::add('key', 'value');
```

---

## 4. remove()

```php
Setting::remove('key');
```

---

## 5. has()

```php
Setting::has('key');
```

---

## 6. getAllSettings()

```php
Setting::getAllSettings();
```

---

## 7. flushCache()

```php
Setting::flushCache();
```

---

# ثالثاً: Helper Function

المسار:

```
helpers.php
```

---

## 1. قراءة قيمة

```php
setting('site_name');
```

---

## 2. حفظ قيمة

```php
setting(['site_name', 'My App']);
```

---

## 3. إنشاء instance

```php
setting(null);
```

---

# 4. آلية الكاش (Cache Strategy)

## المفتاح:

```
settings.all
```

---

## طريقة العمل:

* تحميل كل الإعدادات مرة واحدة
* تخزينها في الكاش
* استخدامها من الذاكرة
* حذفها عند أي تعديل

---

## لماذا هذا مهم؟

بدل كل طلب:

> query إلى database

صار:

> قراءة من memory

---

# 5. الأحداث (Model Events)

عند أي تغيير:

* created
* updated
* deleted

يتم:

```php
flushCache()
```

---

# 6. أمثلة استخدام حقيقية

---

## إعداد اسم الموقع

```php
setting(['site_name', 'My Website']);
```

---

## قراءة اسم الموقع

```php
echo setting('site_name');
```

---

## إعداد boolean

```php
setting(['maintenance_mode', true, 'boolean']);
```

---

## قراءة boolean

```php
if (setting('maintenance_mode')) {
    echo "Site is under maintenance";
}
```

---

## إعداد رقم

```php
setting(['max_users', 100, 'int']);
```

---

## قراءة رقم

```php
$max = setting('max_users');
```

---

## حذف إعداد

```php
Setting::remove('site_name');
```

---

## التحقق من وجود إعداد

```php
if (Setting::has('site_name')) {
    echo "Exists";
}
```

---

# 7. الأداء (Performance)

النظام محسّن جدًا بسبب:

### 1. كاش دائم

لا يوجد إعادة تحميل متكرر.

---

### 2. keyBy

الوصول مباشر بدل البحث.

---

### 3. تحميل مرة واحدة

كل الإعدادات في memory.

---

### 4. تقليل DB queries

أقل ضغط على قاعدة البيانات.

---

# 8. التقييم الهندسي (بصراحة)

## قوي جدًا لأنه:

* Clean Architecture
* Separation of Concerns
* Fast caching layer
* Easy to extend

---

## لكن ملاحظة مهمة:

وجود:

* Service
* Model static
* Helper

قد يكون زائد في المشاريع الكبيرة جدًا.

---

## الأفضل مستقبلاً:

* حذف static methods من Model
* استخدام Service أو Facade فقط

---

# 9. الخلاصة

هذا النظام يحول الإعدادات من:

> نظام عشوائي داخل المشروع

إلى:

> نظام مركزي احترافي سريع + كاش + قابل للتوسعة + سهل الصيانة

---

إذا تريد، أقدر أعمل لك الخطوة التالية:

* تحسين معماري (Refactor احترافي أقوى)
* أو تحويله إلى Laravel Package رسمي
* أو رسم Architecture Diagram احترافي يوضح كل شيء بصريًا
