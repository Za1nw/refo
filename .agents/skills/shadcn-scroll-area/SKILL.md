---
name: shadcn-scroll-area
description: Comprehensive guide and best practices for implementing custom, accessible, cross-browser scrolling using shadcn/ui ScrollArea (Radix UI & Base UI) and Tailwind CSS. Covers vertical & horizontal scroll, auto-hiding scrollbars, table integrations, RTL layout support, and eliminating native OS scrollbar artifacts.
user-invocable: false
---

# دليل واستراتيجيات شريط التمرير (shadcn/ui ScrollArea & Scroll Mastery)

> **المرجع الهندسي الشامل لإدارة شرائط التمرير المخصصة والمتجاوبة عبر shadcn/ui و Radix UI و Base UI و Tailwind CSS.**

---

## 1. المشكلة الهندسية: لماذا تظهر أشرطة التمرير الافتراضية بشكل غير لائق؟

في متصفحات سطح المكتب (خاصة على بيئة **Windows** مثل Chrome و Edge و Firefox):

1. **شريط التمرير الافتراضي للنظام (Native OS Scrollbar)**:
   - يبلغ عرضه وارتفاعه 16-17 بكسل بلون رمادي سميك ومصمت.
   - يقتطع مساحة حقيقية من الـ Layout الداخلي للعنصر ما لم يُضبط كـ overlay.
   - في حال تفعيل خيار "Always show scrollbars" في إعدادات Windows، يبقى الشريط ظاهراً بشكل دائم حتى مع انتفاء الحاجة الفعلية للتمرير.
2. **مشكلة التمرير الجزئي (Subpixel & Border Overflow)**:
   - عند وضع `overflow-x: auto` على حاوية تضم جدولاً أو عنصراً بعرض `w-full` مع حواف (`border` أو `padding`)، قد يتجاوز `scrollWidth` عرض الحاوية بكسور طفيفة جداً (مثل `1000.4px` داخل `1000px`).
   - يقوم المتصفح فوراً بتصيير شريط تمرير أفقي كامل على طول الحاوية، ويكون مقبض التمرير (Thumb) مالئاً لـ 99% من المسار دون أن تكون هناك حاجة حقيقية للتمرير!
3. **الحل المعياري في shadcn/ui**:
   - استخدام مكون **`ScrollArea`** الذي يخفي شريط المتصفح الخام تماماً ويستبدله بشريط عائم (Floating Overlay) مخصص وأنيق يظهر فقط عند التحويم (`type="hover"`) أو التمرير الفعلي، وبدون أي تأثير سلبي على أبعاد المحتوى.

---

## 2. البنية التشريحية لمكون `ScrollArea` (Architecture & Primitives)

يعتمد المكون في منظومة shadcn على ركائز primitives متقدمة (Radix UI أو Base UI):

### أ. في بنية Radix UI (`radix-ui` / `@radix-ui/react-scroll-area`)

```tsx
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

<ScrollAreaPrimitive.Root type="hover" scrollHideDelay={600} dir="rtl">
  {/* حاوية الإطار الافتراضي التي تخفي الشريط الأصلي */}
  <ScrollAreaPrimitive.Viewport>
    {children}
  </ScrollAreaPrimitive.Viewport>

  {/* شريط التمرير العمودي (افتراضي) */}
  <ScrollAreaPrimitive.ScrollAreaScrollbar orientation="vertical">
    <ScrollAreaPrimitive.ScrollAreaThumb />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>

  {/* شريط التمرير الأفقي (عند الحاجة) */}
  <ScrollAreaPrimitive.ScrollAreaScrollbar orientation="horizontal">
    <ScrollAreaPrimitive.ScrollAreaThumb />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>

  {/* زاوية الالتقاء عند ظهور الشريطين معاً */}
  <ScrollAreaPrimitive.Corner />
</ScrollAreaPrimitive.Root>
```

### ب. في بنية Base UI (`@base-ui/react/scroll-area`)

```tsx
import { ScrollArea } from "@base-ui/react/scroll-area";

<ScrollArea.Root>
  <ScrollArea.Viewport>
    {children}
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="vertical">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Scrollbar orientation="horizontal">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Corner />
</ScrollArea.Root>
```

---

## 3. خصائص التحكم في الظهور والسلوك (`type` Prop)

يدعم `ScrollArea` الخاصية `type` للتحكم الدقيق بمتى وكيف يظهر الشريط:

| القيمة (`type`) | السلوك الوظيفي | الاستخدام الموصى به |
| --- | --- | --- |
| **`hover`** (الافتراضي) | يختفي الشريط تلقائياً، ويظهر بسلاسة عند تحويم مؤشر الفأرة فوق الحاوية ويختفي بعد مغادرتها بـ `scrollHideDelay` ms. | **لوحات التحكم، الجداول، القوائم المنسدلة، الكروت** |
| **`scroll`** | يظهر الشريط فقط أثناء حركة التمرير بالعجلة أو اللمس ويختفي فور توقفها. | **واجهات المحمول وشاشات اللمس** |
| **`auto`** | يظهر الشريط فقط عند وجود محتوى زائد يتجاوز الحاوية فعلياً، ويختفي عند عدم الحاجة. | **المحررات النصية والنوافذ المنبثقة** |
| **`always`** | يبقى الشريط ظاهراً دائماً بشرط وجود محتوى فائض. | **النصوص البرمجية الطويلة وسجلات النظام (Logs)** |

---

## 4. أنماط الاستخدام الشائعة (Common Implementation Patterns)

### النمط 1: التمرير العمودي البسيط (Vertical Scroll)

```tsx
import { ScrollArea } from "@/components/ui/scroll-area";

export function UserList({ users }: { users: User[] }) {
  return (
    <ScrollArea className="h-72 w-full rounded-md border p-4">
      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <div key={user.id} className="p-2 hover:bg-muted rounded-md text-sm">
            {user.name}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
```

### النمط 2: التمرير الأفقي مع الصور أو التبويبات (Horizontal Scroll)

> **قاعدة هامة:** لتفعيل التمرير الأفقي، يجب دائماً استدعاء `<ScrollBar orientation="horizontal" />` صراحة داخل `ScrollArea`، مع جعل الحاوية الداخلية `flex w-max`.

```tsx
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function HorizontalGallery({ items }: { items: GalleryItem[] }) {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-xl border">
      <div className="flex w-max gap-4 p-4">
        {items.map((item) => (
          <figure key={item.id} className="shrink-0 w-48">
            <img
              src={item.url}
              alt={item.title}
              className="aspect-video w-full rounded-lg object-cover"
            />
            <figcaption className="mt-2 text-xs text-muted-foreground truncate">
              {item.title}
            </figcaption>
          </figure>
        ))}
      </div>
      {/* شريط التمرير الأفقي المخصص */}
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
```

### النمط 3: جداول البيانات الضخمة والتوافق مع RTL (Data Tables in RTL)

عند بناء جداول قابلة للتمرير الأفقي مع الحفاظ على تناسق اتجاه الواجهة:

1. **تجنب التداخل المضاعف (No Nested `overflow-x-auto`)**:
   - لا تضع `overflow-x-auto` على حاوية الكارت الخارجية وعلى حاوية الجدول الداخلية في نفس الوقت.
   - اجعل حاوية واحدة فقط مسؤولة عن التمرير.
2. **دعم الـ RTL**:
   - مرر `dir="rtl"` إلى `ScrollArea` لضمان أن موضع بداية التمرير الأفقي يبدأ من اليمين بشكل طبيعي.

```tsx
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ResponsiveDataTable({ table }: { table: any }) {
  return (
    <ScrollArea className="w-full rounded-lg border" dir="rtl">
      <Table className="min-w-full">
        <TableHeader>
          {/* رؤوس الأعمدة */}
        </TableHeader>
        <TableBody>
          {/* الصفوف والخلايا */}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
```

---

## 5. قواعد CSS لتخصيص السكرول النقي في Tailwind CSS v4

عند الحاجة لتنسيق حاويات تستخدم `overflow: auto` مباشرة بدون Radix، يجب تعريف فئة مساعدة موحدة في `app.css` تقضي نهائياً على أشرطة المتصفح السميكة:

```css
/* في resources/css/app.css */
@utility scrollbar {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted-foreground) / 0.25) transparent;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground) / 0.25);
    border-radius: 9999px;
    border: 1px solid transparent;
    background-clip: padding-box;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--muted-foreground) / 0.5);
  }
}

@utility no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
```

---

## 6. قائمة الأخطاء الشائعة والوقاية منها (Anti-Patterns & Traps)

| ❌ الخطأ الشائع | ⚠️ السبب التقني | ✅ الحل المعتمد |
| --- | --- | --- |
| ظهور شريط رمادي سميك دائم على Windows | استخدام `overflow-x-auto` المجرد بدون `ScrollArea` أو بدون تخصيص `scrollbar` في CSS | استخدام `ScrollArea` مع `ScrollBar orientation="horizontal"` أو تطبيق كلاس `scrollbar` المتوافق |
| شريط التمرير الأفقي لا يظهر نهائياً في `ScrollArea` | نسيان وضع `<ScrollBar orientation="horizontal" />`؛ افتراضياً يُصيّر العمودي فقط | إضافة `<ScrollBar orientation="horizontal" />` دائماً عند الرغبة في التمرير الأفقي |
| المحتوى يلتف إلى سطر جديد بدلاً من التمرير أفقياً | عدم تحديد `w-max` أو غياب `whitespace-nowrap` على الحاوية الداخلية | وضع `flex w-max` على الحاوية المباشرة للأبناء |
| وميض أو قفزة في المحتوى (Layout Shift) عند ظهور السكرول | التبديل بين `overflow: hidden` و `overflow: visible` بدلاً من Overlay | استخدام `scrollbar-gutter: stable` أو الاعتماد على `ScrollArea` العائم |
| الشريط يبدأ من اليسار في واجهات اللغة العربية | عدم تزويد `ScrollArea` أو حاويته بـ `dir="rtl"` | تمرير `dir={dir}` المستخرج من سياق الاتجاه |

---

## 7. الخلاصة الذهبية

> **"السكرول المتقن هو السكرول غير الملحوظ؛ يظهر بلطف عند الحاجة، ويختفي بلا أثر عند انتفائها، ولا يشوه جمال التصميم أبداً."**
