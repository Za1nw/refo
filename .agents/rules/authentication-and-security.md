# معايير وقواعد المصادقة الحديثة والأمان (Modern Authentication & Security Standards)

> **المرجع الإلزامي لتطبيق وتطوير أنظمة المصادقة الحديثة (Passkeys, 2FA, Fortify, RBAC) مع ضمان التوافق التام مع المستخدمين والبيانات الحالية.**

---

## 1. المعمارية العامة للمصادقة في المنصة

- يعتمد النظام الحديث على **Laravel Fortify** كمحرك للمصادقة في الخلفية مع **Laravel Wayfinder** للربط مع واجهات **React + Inertia**.
- يدعم النظام ثلاث طبقات مصادقة متكاملة:
  1. **المصادقة بمفاتيح المرور (Passkeys / WebAuthn)**: مصادقة بيومترية حديثة وسريعة بدون كلمة مرور عبر الأجهزة المحمولة ومفاتيح الأمان الفيزيائية.
  2. **المصادقة الثنائية (Two-Factor Authentication / TOTP)**: حماية إضافية بحسابات المشرفين والمستخدمين عبر تطبيقات المصادقة (Google Authenticator, 1Password, etc.).
  3. **المصادقة التقليدية بكلمة المرور**: متوافقة تمامًا مع تشفير كلمات المرور الحالية المخزنة في قاعدة البيانات.

---

## 2. قواعد مفاتيح المرور (Passkeys & WebAuthn)

- **الحزم المعتمدة**:
  - الباك إند: `laravel/fortify` مع تفعيل ميزة `Features::passkeys(['confirmPassword' => true])`.
  - الفرونت إند: `@laravel/passkeys` ومكونات `@/components/passkey-verify` و `@/components/manage-passkeys`.
- **المتطلبات الإلزامية على موديل `User`**:
  - يجب أن يطبق الموديل واجهة `PasskeyUser` ويستخدم السمة `PasskeyAuthenticatable`:

    ```php
    use Laravel\Fortify\Contracts\PasskeyUser;
    use Laravel\Fortify\PasskeyAuthenticatable;

    class User extends Authenticatable implements PasskeyUser
    {
        use PasskeyAuthenticatable;
        // ...
    }
    ```

- **واجهات مفاتيح المرور في الفرونت إند**:
  - **تسجيل الدخول (`login.tsx`)**: يجب تضمين مكوّن `<PasskeyVerify routes={{ options: loginOptions(), submit: passkey.login() }} />` لدعم المصادقة الفورية بالبصمة قبل أو بجانب حقول إدخال البريد وكلمة المرور.
  - **إدارة المفاتيح (`settings/security.tsx`)**: تمكين المستخدم من إضافة وتسمية وحذف مفاتيح المرور عبر مكوّن `<ManagePasskeys />`.
  - **نقاط النهاية المعروفة**: توفير مسار `.well-known/passkey-endpoints` في الروابط لتمكين المتصفحات من توجيه المستخدمين لصفحة إدارة المفاتيح تلقائيًا.

---

## 3. قواعد المصادقة الثنائية (Two-Factor Authentication - 2FA)

- **التكامل مع Fortify**:
  - تفعيل `Features::twoFactorAuthentication(['confirm' => true, 'confirmPassword' => true])`.
  - تتطلب عملية التفعيل خطوتين: تمكين الـ 2FA -> تأكيد رمز TOTP الصادر من تطبيق المصادقة قبل اعتماد التفعيل رسميًا (`two_factor_confirmed_at`).
- **رموز الاسترداد (Recovery Codes)**:
  - يجب عرض رموز الاسترداد للمستخدم فور تفعيل الـ 2FA مع إمكانية نسخها وتنزيلها وإعادة توليدها عبر `<TwoFactorRecoveryCodes />`.
- **شاشة التحدي الثنائي (`two-factor-challenge.tsx`)**:
  - عند محاولة مستخدم مفعّل للـ 2FA تسجيل الدخول، يتم تحويله إلى شاشة التحدي الثنائي.
  - يجب أن تدعم الشاشة:
    1. إدخال رمز التحقق المكون من 6 أرقام باستخدام مكون `<InputOTP />`.
    2. التبديل المرن لإدخال رمز الاسترداد (Recovery Code) في حال فقدان تطبيق المصادقة.

---

## 4. التوافق مع بيانات المستخدمين وكلمات المرور القديمة (Legacy Password Compatibility)

- **تشفير كلمات المرور الحالية**:
  - كلمات المرور في `fursaty-old` مشفرة بخوارزمية `Bcrypt` القياسية في Laravel.
  - محرك Laravel و Fortify يتعرفان تلقائيًا على تجزئة الـ `Bcrypt` ويدعمان التحقق منها بدون أي تعديل.
  - **حظر إجبار المستخدمين على تغيير كلمات المرور**: يجب أن يتمكن أي مستخدم مسجل في قاعدة البيانات القديمة من تسجيل الدخول فورًا باستخدام بريده وكلمة مروره السابقة.
- **إعادة التجزئة التلقائية (Automatic Rehash)**:
  - عند تسجيل الدخول الناجح، يقوم Laravel تلقائيًا بالتحقق مما إذا كانت خوارزمية التجزئة تحتاج لترقية (Rehash) وتحديثها بأمان في قاعدة البيانات.

---

## 5. حالة الحساب وحظر المستخدمين (User Status & Account Suspension)

- **التحقق من عمود `status` القديم**:
  - في `fursaty-old`، يحتوي جدول `users` على عمود `status` (Boolean) حيث `0` تعني حساب غير مفعل أو محظور، و `1` تعني نشط.
  - **حارس تسجيل الدخول**: يجب التحقق من حالة المستخدم أثناء محاولة تسجيل الدخول ورمي خطأ تحقق معبر في حال كان الحساب معطلاً:

    ```php
    // Fortify::authenticateUsing(...)
    if (! $user || ! Hash::check($password, $user->password)) {
        return null;
    }
    if (! $user->status) {
        throw ValidationException::withMessages([
            'email' => __('auth.account_suspended'),
        ]);
    }
    return $user;
    ```

---

## 6. إدارة الأدوار والصلاحيات (RBAC with Spatie Permission)

- **استبدال النظام القديم بنظام Spatie الحديث**:
  - نعتمد حزمة `spatie/laravel-permission` كمعيار موحد لكافة الأدوار والصلاحيات في النظام الجديد.
- **التوافق التراجعي (Backward Compatibility)**:
  - يوفر موديل `User` دوال توافق تخدم الاستعلامات القديمة:

    ```php
    /**
     * التحقق مما إذا كان المستخدم مشرفاً (متوافق مع القديم والجديد)
     */
    public function isAdmin(): bool
    {
        return $this->is_admin || $this->hasRole('super-admin') || $this->hasRole('admin');
    }
    ```

- **الصلاحيات الحبيبية (Granular Permissions)**:
  - تُربط كافة عمليات لوحة التحكم (عرض، إضافة، تعديل، حذف) بصلاحيات صريحة مثل:
    - `scholarships.view`, `scholarships.create`, `scholarships.edit`, `scholarships.delete`
    - `blogs.view`, `blogs.create`, `blogs.edit`, `blogs.delete`
    - `advertisements.manage`, `users.manage`, `reviews.manage`

---

## 7. سجل تدقيق العمليات الإدارية (Audit Logging - `admin_actions`)

- **الحفاظ على جدول `admin_actions` القديم**:
  - يتم تسجيل كل عملية حساسة (إنشاء منحة، تعديل مقال، تغيير حالة إعلان، حظر مستخدم) داخل جدول `admin_actions` لضمان استمرارية تتبع النشاط الإداري:
    - `admin_id`: معرف المشرف المنفذ.
    - `action`: نوع العملية (`create`, `update`, `delete`, `status_change`).
    - `affected_table`: اسم الجدول المتأثر.
    - `affected_id`: معرف السجل المتأثر.
    - `description`: تفاصيل إضافية عن التغيير.
