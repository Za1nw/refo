---
name: modern-auth-and-security
description: Guide for implementing, extending, and managing modern authentication in this project: Passkeys (WebAuthn via @laravel/passkeys), Two-Factor Authentication (Fortify TOTP & recovery codes), legacy password compatibility (bcrypt), and role-based access control (Spatie permissions). Use this skill whenever working with authentication pages, login flows, passkey enrollment/verification, two-factor challenge/setup, user security settings, or user role/permission gates.
---

# دليل المصادقة الحديثة والأمان (Modern Authentication & Security Workflow)

> **دليل عملي لتنفيذ، تخصيص، وإدارة آليات المصادقة بمفاتيح المرور (Passkeys)، التحقق الثنائي (2FA)، والتوافقية مع مستخدمي النظام الحالي.**

---

## 1. الهيكل العام ومسارات العمل

```text
[شاشة تسجيل الدخول] 
  ├──> [المسار 1: مفتاح المرور Passkey (WebAuthn)] ──> [دخول فوري بدون كلمة مرور]
  └──> [المسار 2: البريد وكلمة المرور] ──> [فحص الحساب القديم/الجديد] 
                                                  │
       [توجيه للوحة التحكم] <── [نجاح التحقق] <──┴── [هل 2FA مفعّل؟] ──> [شاشة التحدي الثنائي 2FA]
```

---

## 2. كيفية استخدام وتطوير مفاتيح المرور (Passkeys)

### أ. الباك إند

- **تهيئة الموديل**:
  يجب أن يطبق موديل `User` واجهة `PasskeyUser` ويستخدم السمة `PasskeyAuthenticatable`:

  ```php
  use Laravel\Fortify\Contracts\PasskeyUser;
  use Laravel\Fortify\PasskeyAuthenticatable;

  class User extends Authenticatable implements PasskeyUser
  {
      use PasskeyAuthenticatable;
  }
  ```

- **المسارات المعتمدة**:
  - `passkey.login.options`: لجلب خيارات التحدي من السيرفر.
  - `passkey.login`: لإرسال توقيع الـ WebAuthn والتحقق من صحته.
  - `passkey.register.options`: لتوليد تحدي تسجيل مفتاح جديد في إعدادات الأمان.
  - `passkey.register`: لحفظ المفتاح المعتمد.

### ب. الفرونت إند

- **في شاشة تسجيل الدخول (`login.tsx`)**:

  ```tsx
  import PasskeyVerify from '@/components/passkey-verify';
  import passkey, { loginOptions } from '@/routes/passkey';

  <PasskeyVerify
      routes={{
          options: loginOptions(),
          submit: passkey.login(),
      }}
  />
  ```

- **في صفحة إعدادات الأمان (`settings/security.tsx`)**:
  - استخدام مكوّن `<ManagePasskeys />` الذي يعرض قائمة المفاتيح المسجلة مع أسمائها وتاريخ آخر استخدام وزر تسجيل مفتاح جديد بالبصمة.

---

## 3. كيفية إدارة المصادقة الثنائية (Two-Factor Authentication - 2FA)

### أ. دورة تفعيل الـ 2FA في إعدادات الأمان

1. يضغط المستخدم على "تفعيل المصادقة الثنائية" في صفحة الأمان.
2. يُرسل طلب `POST` إلى راوت Fortify لتفعيل الميزة (`/user/two-factor-authentication`).
3. يقوم السيرفر بإنشاء المفتاح السري (`two_factor_secret`).
4. تفتح نافذة المودال `<TwoFactorSetupModal />` لعرض:
   - رمز الـ QR Scan لتطبيقات المصادقة (Google Authenticator, Microsoft Authenticator, 1Password).
   - المفتاح النصي السري للإدخال اليدوي.
5. يُدخل المستخدم رمز التحقق المكون من 6 أرقام باستخدام مكون `<InputOTP />`.
6. يُرسل طلب التأكيد `POST /user/confirmed-two-factor-authentication`.
7. عند التأكيد، يُسجل `two_factor_confirmed_at` في قاعدة البيانات وتُعرض رموز الاسترداد للطوارئ.

### ب. شاشة التحدي الثنائي أثناء تسجيل الدخول (`two-factor-challenge.tsx`)

- تستقبل الشاشة المستخدمين المفعّلين للـ 2FA بعد إدخال كلمة المرور الصحيحة.
- يدعم المكون إدخال كود الـ TOTP مع خيار التبديل لإدخال أحد رموز الاسترداد (Recovery Code).

---

## 4. ضمان التوافق مع بيانات المستخدمين الحالية

- **تشفير كلمات المرور القديمة**:
  - لا يتطلب أي إجراء تحويل؛ خوارزمية `Hash::check()` في Laravel تتعرف تلقائيًا على تجزئات Bcrypt القديمة وتتحقق منها.
- **التحقق من حالة الحساب (`users.status`)**:
  - عند محاولة الدخول، يتم التأكد من أن `user.status === true` أو `user.status === 1`.
  - إذا كان الحساب معطلاً، يتم رفض الدخول برسالة معربة من ملف `lang/ar/auth.php`.
- **التحقق من المشرفين والصلاحيات**:
  - للمشرفين القادمين من النظام القديم (`is_admin = 1` أو سجلات `admin_permissions`):
    - استخدام الدالة المساعدة `$user->isAdmin()` للتوافق.
    - أو تطبيق Seeder لمزامنة الصلاحيات إلى أدوار Spatie القياسية.

---

## 5. مشاركة بيانات المصادقة مع الفرونت إند عبر Inertia

يتم تمرير بيانات المستخدم المسجل وأدواره في كل طلب عبر `HandleInertiaRequests.php`:

```php
'auth' => [
    'user' => $request->user() ? [
        'id' => $request->user()->id,
        'name' => $request->user()->name,
        'email' => $request->user()->email,
        'image' => $request->user()->image,
        'isAdmin' => $request->user()->isAdmin(),
        'roles' => $request->user()->roles->pluck('name'),
        'permissions' => $request->user()->getAllPermissions()->pluck('name'),
        'two_factor_enabled' => $request->user()->hasEnabledTwoFactorAuthentication(),
    ] : null,
],
```
