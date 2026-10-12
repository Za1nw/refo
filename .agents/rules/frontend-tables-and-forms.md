---
trigger: always_on
---

# قواعد إنشاء جداول وفرونت إند ولوحات التحكم (Frontend Tables & Forms Rules)

> **المرجع الإلزامي لتطوير واجهات وجداول وفورمات الفرونت إند في تطبيق منافع (React + Inertia + TypeScript + TanStack Table)**

---

## 1. المعمارية العامة ومكان الملفات
- جميع ملفات واجهة لوحة التحكم لأي موديول يجب أن تكون **حصرًا** داخل:
  `Modules/{ModuleName}/resources/assets/admin/`
- صفحات الدخول التابعة لـ Inertia (التي تستقبل `Inertia::render('...')`) توضع داخل `pages/` (مثل `pages/orders.tsx` أو `pages/Index.tsx`) وتكون **رفيعة جدًا** وظيفتها تمرير الـ props لـ `SectionList[Module]`.

---

## 2. الهوكات الأساسية لكل جدول
لكل جدول موديول، يجب كتابة الهوكات المتناسقة:
1. **`use[Module]Actions`**:
   - يدير عمليات الصف (إضافة، تعديل، حذف، حظر، تغيير حالة، فتح ديالوجات دورة الحياة).
   - يستخدم `useResourceActions` أو ينشئ كائنات الحالة للديالوجات مع `router.reload({ only: ['resourceName'] })`.
2. **`use[Module]Columns`**:
   - يعرّف أعمدة TanStack Table (`ExtendedColumnDef<T>[]`).
   - يستخدم `useMemo` دائمًا لتفادي إعادة الحسابات غير الضرورية.
   - يربط الخلايا بالخلايا الجاهزة (`textCell`, `dateCell`, `centeredTextCell`, `actionsCell`, `SwitchCell`, أو خلايا مخصصة).
3. **`use[Module]ServerSync`**:
   - يدير التواصل مع السيرفر عبر `useServerSync` (البحث، الفرز، تغيير الصفحة، تغيير حجم الصفحة، الفلاتر).
   - يعرّف ثوابت الفلاتر `FilterConfig` خارج الهوك.
4. **`useTable[Module]`**:
   - هوك تجميعي نظيف يربط الهوكات الثلاثة السابقة بـ `useTableResources<T>`.

---

## 3. قواعد التصفح وإدارة البيانات الضخمة (Server Pagination & Sync)
- **السيرفر هو مصدر الحقيقة**: التصفح والفرز والفلترة والبحث دائمًا **Manual Server-Side**.
- **Partial Reload**: دائمًا حدد `only: ['resourceName']` مع `preserveState: true` و `preserveScroll: true` لضمان سرعة الاستجابة وعدم إعادة تحميل الصفحة بالكامل.
- **تزامن الروابط (`URL Sync`)**: يجب تفعيل قراءة الفلاتر والبحث من `window.location.search` عبر `syncFiltersFromUrl()` لضمان إمكانية مشاركة الروابط والرجوع بالمتصفح.

---

## 4. قواعد أنماط العرض المتعددة (`TableViewOption`) ومجلد `views/`
- **فصل تصاميم العرض عن الحاوية**:
  - يُحظر كتابة تصاميم الكروت (`CardsView`) أو القوائم (`ListView`) أو الحالات الفارغة (`EmptyState`) أو مصفوفة `views` بشكل مدمج (inline) داخل ملف `SectionList[Module].tsx`.
  - يجب إنشاء مجلد مخصص: `Modules/{ModuleName}/resources/assets/admin/components/{resource}/views/` يحتوي على:
    - `[Model]CardsView.tsx`: واجهة عرض شبكة الكروت (Grid Cards).
    - `[Model]ListView.tsx`: واجهة عرض القائمة الرأسية (List View).
    - `[Model]EmptyState.tsx`: واجهة الحالة الفارغة عند انعدام السجلات.
    - `use[Model]Views.tsx`: هوك تجميع وتجهيز أنماط العرض المتعددة بالأيقونات والترجمات.
    - `[Model]Card.tsx`: بطاقة السجل الفردية (إن كانت تحتوي على منطق وتنسيق مخصص).
    - `index.ts`: لتجميع وتصدير العروض والهوك.
- **دور `SectionList[Module].tsx`**:
  - يجب أن يبقى ملف `SectionList[Module].tsx` رفيعاً ونظيفاً جداً، يقتصر دوره على استدعاء `const views = use[Model]Views()` وتمريرها لمكون `SectionListGeneric`.

---

## 5. قواعد زر الإضافة والتحكم في ظهوره (`hasCreate` / `showCreate`)
- **الجداول للقراءة فقط**:
  - في الجداول التي لا تتطلب إضافة سجلات جديدة (مثل سجلات التدقيق، العمليات المالية، التقارير، سجلات النشاط):
    - مرّر `hasCreate: false` في هوك `useTableResources`.
    - أو مرّر `showCreate={false}` في مكون `SectionListGeneric`.
    - يؤدي ذلك إلى إخفاء زر الإضافة تلقائياً وعدم تهيئة دوال إنشاء فارغة.
- **تخصيص زر الإضافة**:
  - عند الحاجة لتخصيص نص الزر أو تلميحه التوضيحي، استخدم الخصائص `createTooltip` أو `createLabel` أو `createIcon`.

---

## 6. قواعد إجراءات الصفوف (Row Actions & Menus)
- **أزرار الأيقونات المباشرة (`actionsCell`)**:
  - تُستخدم عندما تكون الإجراءات قليلة (تعديل، حذف، عرض، تغيير كلمة المرور).
  - تدعم `isVisible: (row) => boolean` لإخفاء الإجراء إن لم يكن متاحًا للصف الحالي.
- **القائمة المنسدلة المتقدمة (`DropdownMenu` / `orderActionsCell`)**:
  - تُستخدم عندما تتعدد الإجراءات ودورة حياة المورد (إسناد، استلام، تسليم، إلغاء، تحصيل، حذف).
  - يجب وضع حراس منطقيين (`canAssign`, `canCancel`, `canEdit`) يطابقون حراس الباك-إند لتوفير تجربة مستخدم ممتازة.
- **الحذف وتأكيد العمليات**:
  - دائمًا استخدم `confirmAlertDialog` لعمليات الحذف أو العمليات التي لا يمكن التراجع عنها.
  - استخدم `toast.promise` أو `toast.loading` مع معالجة الأخطاء عبر `getAxiosErrorMessage(error)`.

---

## 7. قواعد الخلايا التفاعلية (Interactive Cells: Switch, Select, etc.)
- **خلية السويتش (`SwitchCell`)**:
  - يجب أن تدير حالة داخلية مؤقتة (`useState(checked)`) مع التحديث التفاؤلي أو إرجاع القيمة السابقة في حال فشل الطلب (`rollback on error`).
  - يجب أن تُرجع دالة الـ `onChange` وعدًا بـ `boolean` ليعكس نجاح أو فشل العملية في السيرفر.
- **خلايا الـ HoverCard**:
  - `openDelay={200} closeDelay={100}` دائمًا.
  - محتوى البطاقة يحتوي على التفاصيل والنسخ السريع (`CopyIcon` / `CheckIcon`).

---

## 8. قواعد الفورمات وربطها بالجدول (Drawer & Dialog Forms)
- **التكامل مع الجدول**:
  - زر الإضافة في رأس الجدول يستدعي `onCreate()` -> يفتح الفورم ويكون `formItem = null`.
  - زر التعديل في الصف يستدعي `editRow(item)` -> يفتح الفورم ويكون `formItem = item`.
  - عند نجاح الحفظ `onSaved(saved)`: إذا كان `formItem` موجودًا يُستدعى `updateRow(saved)`، وإلا يُستدعى `addRow(saved)`.
- **دعم الاتجاهات (RTL/LTR)**:
  - دائمًا اجعل `DrawerContent dir="ltr"` مع وضع حاوية داخلية `dir={dir}` من `useDirection()`.
  - اتجاه فتح الـ Drawer: `direction={dir === 'rtl' ? 'left' : 'right'}`.
- **معالجة الأخطاء والتحقق**:
  - استخرج أخطاء 422 عبر `normalizeValidationErrors(error.response.data?.errors)` ومررها لمكون `<InputError message={errors.field} />`.
  - ضع حارس `processing` في بداية الـ `submit` لمنع الإرسال المزدوج، وعطّل زر الحفظ مع إظهار سبينر التحميل.

---

## 9. قواعد طبقة الخدمات والاتصال بالسيرفر (Services Layer)
- استخدم دائمًا راوتات `Laravel Wayfinder` المولدة تلقائيًا (مثل `import { store, update, destroy } from '@/routes/...'`).
- استخدم العميل الموحد `api` من `@/lib/axios`.
- انتبه لتغليف استجابة الباك-إند:
  - إذا كان الباك-إند يرجع `JsonResource`، فالبيانات داخل `response.data.data`.
  - إذا كان يرجع مصفوفة أو كائن مباشر، فالبيانات داخل `response.data`.
- افصل بين عمليات الـ CRUD العادية (`[module].service.ts`) والعمليات الحساسة الخاصة بدورة العمل (`[module]_actions.service.ts`).
