# دليل ميزة الجداول في لوحة التحكم

تاريخ المراجعة: 2026-10-04. هذا الدليل مبني على الشيفرة الموجودة في مساحة العمل وقت المراجعة، بما فيها التعديلات المحلية غير الملتزم بها.

يغطي إدارة الجدول في [features/table](resources/admin/features/table)، وعرضه في [components/table](resources/admin/components/table)، وتطبيقه في [وحدة Blog](Modules/Blog/resources/assets/admin). الأمثلة التعليمية أدناه توضح طريقة الربط الموصى بها؛ لا تعني أن الملاحظات المكتشفة أُصلحت في ملفات التطبيق.

## المحتويات

1. [البنية وتدفق البيانات](#architecture)
2. [المتطلبات وعقد البيانات](#contract)
3. [تركيب جدول خطوة بخطوة](#recipe)
4. [مرجع useTableResources](#table-hook)
5. [البحث والفرز والفلاتر والتصفح](#server-sync)
6. [الأعمدة والخلايا الجاهزة](#columns)
7. [التجاوب ونافذة التفاصيل](#details)
8. [العمليات والنماذج وتحديث الصفوف](#mutations)
9. [العروض البديلة والسياق](#views)
10. [التحديد وحالة Redux](#state)
11. [مرجع مكوّنات العرض](#components)
12. [خريطة تطبيق Blog](#blog)
13. [ملاحظات التحليل وحدود التنفيذ الحالي](#findings)
14. [حل المشكلات والتحقق](#verification)
15. [المراجع](#references)

<a id="architecture"></a>

## 1. البنية وتدفق البيانات

الميزة منظومة لجداول تعتمد على السيرفر في البحث والفرز والتصفح. ليست مجرد عنصر `<table>`، وليست طبقة CRUD تحفظ البيانات تلقائيًا.

| الطبقة | مكانها | مسؤوليتها |
| --- | --- | --- |
| الحالة والربط | `resources/admin/features/table` | بيانات الصفحة الحالية، البحث، الفرز، التحديد، مزامنة Inertia، عمليات الصف المحلية |
| العرض المشترك | `resources/admin/components/table` | شريط الأدوات، رؤوس وخلايا الجدول، التجاوب، التصفح، نافذة التفاصيل |
| سياق العرض | `resources/admin/context/TableContext.tsx` | نقل `tableId` وإجراءات العرض والإضافة إلى الأبناء |
| تعريف المورد | `Modules/Blog/resources/assets/admin` | أنواع المقالات والتصنيفات والوسوم، الأعمدة، الخدمات، الفلاتر، النماذج |
| السيرفر | `Modules/Blog/app` | البحث والفلترة والفرز والتصفح، التحقق والصلاحيات، الحفظ والحذف |

```text
Laravel → Inertia props: Pagination<T>
                    ↓
            useTable[Resource]
                    ↓
            useTableResources
         ┌──────────┼───────────┐
      useActions useColumns useServerSync
         ↓          ↓           ↓
     خدمات JSON   تعريفات    router.get + only
         ↓        الأعمدة        ↓
     صف مؤكد                  props جديدة
         └──────────┬───────────┘
                    ↓
          Redux: table.tables[tableId]
                    ↓
           TanStack useLegacyTable
                    ↓
           SectionListGeneric
       ┌────────────┼────────────┐
    FilterSection Table/Views FooterTable
                    ↓
            DialogComponenet
```

عند وصول `resources.data` جديدة، يستدعي الهوك `hydrateFromServer` داخل effect، ويستبدل بيانات الجدول والترقيم. الجدول يستعمل `manualPagination: true` و`manualSorting: true`؛ أي إن ترتيب النتائج وتجزئتها مسؤولية السيرفر. أما العروض البديلة فتقرأ البيانات نفسها من Redux.

**ترتيب المسؤوليات عند إضافة مورد:** نوع الصف → الخدمات → هوك العمليات → هوك الأعمدة → هوك مزامنة السيرفر → هوك التجميع → `SectionList` → صفحة Inertia رفيعة. راجع [بنية الواجهة](frontend-architecture.md) لتحديد مواضع الملفات، وأعد استخدام الملفات الموجودة بدل إنشاء نسخ موازية.

<a id="contract"></a>

## 2. المتطلبات وعقد البيانات

### 2.1 متطلبات التشغيل

- `@/` يشير إلى ملفات لوحة التحكم المشتركة في `resources/admin`، وليس مجلد وحدة Blog.
- يجب أن يكون المستهلك داخل Redux `Provider` الذي يسجل `tableReducer` تحت المفتاح `table`. هذا موجود في [store.ts](resources/admin/store/store.ts) و[app.tsx](resources/admin/app.tsx).
- تطبيق لوحة التحكم يجهز أيضًا الترجمة والاتجاه و`Toaster` و`ConfirmInDiv` المستخدم في تأكيد الحذف.
- `tableId` ثابت وفريد لكل جدول مستقل، ومتطابق بين الهوك و`SectionListGeneric` والـ selectors والـ actions.
- استخدم معرّف `id` ثابتًا لكل صف، وحافظ على نوعه: الرقم `1` ليس النص `'1'` عند تحديث/حذف الصفوف. بعض الأدوات تدعم `slug` بديلًا، لكن `useResourceActions` يشترط `id` في نوع الصف.

### 2.2 إصدار TanStack المستخدم في هذه النسخة

[package.json](package.json) يعلن `@tanstack/react-table: ^9.2.4` و`@inertiajs/react: ^3.8.0`. الطبقة الحالية تستخدم واجهة التوافق `@tanstack/react-table/legacy`، وليست نسخة حرفية من أمثلة v8 القديمة في بعض ملفات الإرشادات.

```ts
import type { CellContext } from '@tanstack/react-table';
import type { LegacyFeatures } from '@tanstack/react-table/legacy';
import type { ExtendedColumnDef } from '@/types/table';

type ExampleRow = { id: number; name: string };
type ExampleCellContext = CellContext<LegacyFeatures, ExampleRow, unknown>;
type ExampleColumns = ExtendedColumnDef<ExampleRow>[];
```

لإنشاء جدول مورد، استعمل `useTableResources` بدل إنشاء نسخة أخرى من `useLegacyTable`. نوع `ExtendedColumnDef` المحلي مربوط بالفعل بنوع الأعمدة المتوافق مع هذه الطبقة.

### 2.3 شكل بيانات القائمة

العقد الرئيسي معرف عالميًا في [pagination.d.ts](resources/admin/types/shared/pagination.d.ts):

```ts
interface Pagination<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}
```

- `data` تحتوي **صفحة واحدة** من النتائج، و`meta.total` إجمالي النتائج المطابقة للفلاتر.
- `current_page` يبدأ من 1؛ يحوله الهوك إلى `pageIndex` يبدأ من 0.
- `links` كائن الروابط الأربعة؛ يختلف عن `meta.links`، وهي مصفوفة روابط مرقمة.
- `meta.path` رابط قائمة المورد، ويستخدم عند تغيير عدد الصفوف.
- يقرأ التذييل القيم الرقمية كأرقام؛ لا ترسل مثلًا `per_page: '10'`.
- قد يرجع Laravel `from` و`to` بقيمة `null` للقائمة الفارغة رغم أن التعريف الحالي يستخدم `number`. التذييل الحالي يحسب المجال اعتمادًا على `total/per_page/current_page`.
- يطبّع الهوك غياب `meta.links` إلى مصفوفة فارغة عند التخزين؛ وهذا مهم لأن مجموعتي التصنيفات والوسوم لا تضيفانها في `toArray` الخاص بهما.

يوجد fallback لبعض حقول paginator المسطحة مثل `current_page` و`first_page_url`، لكنه **ليس ضمانًا لدعم كل شكل Laravel مسطح**: إذا كانت `raw.links` مصفوفة فسيأخذها الهوك كما هي بدل بناء كائن الروابط الأربعة. استخدم العقد الموحّد أعلاه.

### 2.4 أسماء مستقلة يجب عدم الخلط بينها

| المعنى | المقالات | التصنيفات | الوسوم |
| --- | --- | --- | --- |
| `tableId` في Redux | `blogs` | `blog-categories` | `blog-tags` |
| prop من Inertia | `blogs` | `categories` | `tags` |
| `only` للطلب الجزئي | `['blogs']` | `['categories']` | `['tags']` |
| مسار Wayfinder | `@/routes/blog` | `@/routes/blog/categories` | `@/routes/blog/tags` |
| نوع الصف | `Blog` | `BlogCategory` | `BlogTag` |

`only` يحتوي أسماء props، وليس `tableId` أو اسم route. التحديث الجزئي يعمل عند زيارة مكوّن صفحة Inertia نفسه؛ لذلك لا تستخدمه بديلًا للانتقال إلى صفحة تحرير مختلفة. [توثيق Inertia v3](https://inertiajs.com/docs/v3/data-props/partial-reloads).

<a id="recipe"></a>

## 3. تركيب جدول خطوة بخطوة

المثال التالي وصفة تعليمية لإعادة تركيب جدول تصنيفات Blog بالملفات والمسارات الموجودة. يوضح الحد الأدنى: عرض، بحث، فرز، تصفح، إضافة وتعديل عبر Drawer، وحذف. الترجمة والسويتش والعروض البديلة موضحة في الأقسام التالية. لا تُضف ملفات بنفس الأسماء إن كانت موجودة بالفعل.

### 3.1 نوع المورد والخدمة

أعد استخدام [BlogCategory](Modules/Blog/resources/assets/admin/types/category.ts) و[خدمة التصنيفات](Modules/Blog/resources/assets/admin/services/blog_category.service.ts). يجب أن تعيد خدمة الحفظ الصف النهائي القادم من السيرفر، لا payload النموذج ولا كائن Axios كاملًا.

### 3.2 هوك العمليات

مثال مكانه `hooks/blog-categories/useBlogCategoryActions.ts`:

```ts
import { useTranslation } from 'react-i18next';
import { useResourceActions } from '@/features/table';
import { destroy } from '@/routes/blog/categories';
import type { BlogCategory } from '../../types/category';

export function useBlogCategoryActions({ tableId, tableData }: {
    tableId: string;
    tableData: BlogCategory[];
}) {
    const { t } = useTranslation('blog');

    return useResourceActions<BlogCategory>({
        tableId,
        tableData,
        resourceName: t('Category'),
        getId: (item) => item.id,
        getName: (item) => item.name,
        destroyRoute: destroy,
    });
}
```

### 3.3 هوك الأعمدة

مثال مكانه `hooks/blog-categories/useBlogCategoryColumns.tsx`:

```tsx
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { actionsCell, centeredTextCell, dateCell, textCell } from '@/components/table';
import type { ExtendedColumnDef } from '@/types/table';
import type { BlogCategory } from '../../types/category';

export function useBlogCategoryColumns(actions: {
    editRow: (item: BlogCategory) => void;
    deleteRow?: (item: BlogCategory) => Promise<void>;
}) {
    const { t } = useTranslation('blog');
    const { editRow, deleteRow } = actions;

    return useMemo((): ExtendedColumnDef<BlogCategory>[] => [
        {
            accessorKey: 'id',
            header: () => t('column_id'),
            nonHideable: true,
            cell: centeredTextCell,
        },
        {
            accessorKey: 'name',
            header: () => t('column_name'),
            cell: textCell,
        },
        {
            accessorKey: 'created_at',
            header: () => t('column_created_at'),
            cell: dateCell(false),
        },
        {
            accessorKey: 'actions',
            header: () => t('column_actions'),
            nonHideable: true,
            enableSorting: false,
            cell: actionsCell({ onEdit: editRow, onDelete: deleteRow }),
        },
    ], [deleteRow, editRow, t]);
}
```

### 3.4 هوك مزامنة السيرفر

مثال مكانه `hooks/blog-categories/useBlogCategoryServerSync.ts`. اسم `syncStatusFromUrl` هنا مقصود؛ هو الاسم الذي يستدعيه الهوك الجامع الحالي.

```ts
import type { SortingState } from '@tanstack/react-table';
import { useServerSync } from '@/features/table';
import { index } from '@/routes/blog/categories';

export function useBlogCategoryServerSync(args: {
    tableId: string;
    search: string;
    sorting: SortingState;
    pageSize: number;
}) {
    const sync = useServerSync({
        ...args,
        getIndexUrl: () => index().url,
        only: ['categories'],
    });

    return {
        syncStatusFromUrl: sync.syncFiltersFromUrl,
        onSortingChange: sync.onSortingChange,
        searchData: sync.searchData,
        changePage: sync.changePage,
        changePageSize: sync.changePageSize,
    };
}
```

### 3.5 هوك التجميع

مثال مكانه `hooks/blog-categories/useTableBlogCategories.ts`:

```ts
import { useTableResources } from '@/features/table';
import type { BlogCategory } from '../../types/category';
import { useBlogCategoryActions } from './useBlogCategoryActions';
import { useBlogCategoryColumns } from './useBlogCategoryColumns';
import { useBlogCategoryServerSync } from './useBlogCategoryServerSync';

export function useTableBlogCategories({ categories }: {
    categories: Pagination<BlogCategory>;
}) {
    return useTableResources<
        BlogCategory,
        ReturnType<typeof useBlogCategoryActions>,
        ReturnType<typeof useBlogCategoryServerSync>
    >({
        resources: categories,
        tableId: 'blog-categories',
        useActions: useBlogCategoryActions,
        useColumns: useBlogCategoryColumns,
        useServerSync: useBlogCategoryServerSync,
    });
}
```

تحديد الأنواع الثلاثة يحافظ على أنواع الدوال والفلاتر الراجعة. الاكتفاء بـ `<BlogCategory>` كما في بعض الاستخدامات الحالية يسمح بالعمل، لكنه يستعمل الأنواع الافتراضية المرنة ويقلل دقة TypeScript لبعض الحقول الإضافية.

### 3.6 مكوّن التجميع مع النموذج

مثال مكانه `components/blog-categories/SectionListBlogCategories.tsx`، يعيد استخدام الـ Drawer الحالي. يعتمد التحديث بعد الحفظ هنا على إعادة جلب prop المورد، حتى تعكس القائمة الفرز والفلاتر والإجماليات الفعلية.

```tsx
import { useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import SectionListGeneric from '@/components/table/SectionListGeneric';
import { useTableBlogCategories } from '../../hooks/blog-categories/useTableBlogCategories';
import { getBlogCategoryColumnLabels } from '../../lables/getBlogCategoryColumnLabels';
import type { BlogCategory } from '../../types/category';
import BlogCategoryDrawerForm from './forms/BlogCategoryForm';

export default function SectionListBlogCategories() {
    const categories = usePage().props.categories as Pagination<BlogCategory>;
    const { t } = useTranslation('blog');
    const hook = useTableBlogCategories({ categories });
    const columnLabels = useMemo(() => getBlogCategoryColumnLabels(t), [t]);

    return (
        <>
            <SectionListGeneric
                tableId={hook.tableId}
                initHook={hook}
                columnLabels={columnLabels}
            />
            <BlogCategoryDrawerForm
                open={hook.isFormOpen}
                item={hook.formItem}
                onOpenChange={(open) => {
                    if (!open) {
                        hook.closeForm();
                    }
                }}
                onSaved={() => router.reload({ only: ['categories'] })}
            />
        </>
    );
}
```

هذا يعيد جلب البيانات بعد **حفظ النموذج** فقط. الحذف في `useResourceActions` ما زال يزيل الصف محليًا، وتفاصيل توقيته موضحة في [قسم العمليات](#mutations). صفحة `pages/blog-categories.tsx` تكتفي ببيانات الصفحة والتخطيط وعرض هذا المكوّن.

<a id="table-hook"></a>

## 4. مرجع useTableResources

المصدر: [useTableResource.ts](resources/admin/features/table/hooks/useTableResource.ts). اسم الملف مفرد، واسم الدالة `useTableResources` بالجمع.

### المدخلات

| الخاصية | النوع/العقد | وظيفتها |
| --- | --- | --- |
| `resources` | `Pagination<T>` | البيانات والترقيم من prop المورد |
| `tableId` | `string` | مفتاح حالة الجدول |
| `useActions` | `({ tableId, tableData }) => actions` | يجب أن يعيد `addRow` و`updateRow`؛ بقية الدوال يمررها الهوك |
| `useColumns` | `(actions) => columns` | يستقبل `editRow` وإجراءات المورد |
| `useServerSync` | `({ tableId, search, sorting, pageSize }) => sync` | يستقبل حالة الجدول ويعيد معالجات الطلبات |
| `hasCreate` | `boolean`، افتراضيًا `true` | عندما يكون `false` يصبح `onCreate` الافتراضي `undefined` |

مرّر مراجع هوكات ثابتة على مستوى الملف؛ لا تغيّر ترتيب استدعاء الهوكات أو نوعها بحسب شرط أثناء التصيير.

### المخرجات

| المجموعة | الحقول | ملاحظات |
| --- | --- | --- |
| العرض | `table`, `tableId`, `columns`, `isClient` | `isClient` مهيأ حاليًا إلى `true` دائمًا؛ ليس اختبارًا حقيقيًا لبيئة المتصفح |
| الإنشاء/التعديل | `hasCreate`, `onCreate`, `editRow`, `isFormOpen`, `formItem`, `closeForm` | `formItem === null` للإنشاء؛ `closeForm` يصفر العنصر |
| تعديل النسخة المحلية | `addRow`, `updateRow` | تمرير مباشر لما يعيده هوك العمليات؛ لا يرسلان طلب حفظ |
| البحث | `search`, `searchData(text)` | الغلاف يضيف `perPage` إلى معالج السيرفر |
| التصفح | `changePage(url)`, `changePageSize(size, path)` | موصولان أيضًا داخل `table.options.meta` |
| العرض البديل | `viewMode`, `setViewMode(mode)` | قيمة نصية داخل Redux |
| التحديد الجماعي | `selectedRowIds`, `selectedCount`, `toggleSelectRow`, `selectAllRows`, `clearRowSelection` | لا يرسم الهوك checkbox أو شريط bulk actions |
| امتدادات المورد | بقية `buttonActions` و`restServerSync` | مثل `deleteRow`, `translateRow`, `statusFilter` |

**انتبه لترتيب الدمج:** الأعمدة تستقبل `{ editRow, ...buttonActions }`، والكائن الراجع ينتهي بإجراءات المورد ثم حقول المزامنة الإضافية. إذا أعاد هوك العمليات `editRow` فسيستبدل سلوك فتح Drawer الافتراضي؛ هذا مقصود في المقالات حيث يفتح صفحة تحرير. تجنب تصادم أسماء الامتدادات مع خصائص الهوك الأساسية.

الهوك لا يعيد `isLoading` أو `pagination` أو `sorting` مباشرة؛ اقرأها من selectors عند الحاجة. وإذا استخدمت `useResourceActions` فإن `rows` المعاد **كائن عمليات** (`rows.add/update/remove`)، وليس مصفوفة بيانات؛ المصفوفة تأتي من `selectTableData`.

<a id="server-sync"></a>

## 5. البحث والفرز والفلاتر والتصفح

المصدر: [useServerSync.ts](resources/admin/features/table/hooks/useServerSync.ts).

كل طلب قائمة يمر عبر `router.get` بخيارات `preserveState: true` و`preserveScroll: true` و`replace: true` و`only`. يتم ضبط `isLoading` عند `onStart` وإطفاؤه عند `onFinish`. استخدام `replace` يعني أن كل تغيير بحث/فلتر لا ينشئ مدخل تاريخ مستقلًا.

| الدالة | المعلمات | ما ترسله |
| --- | --- | --- |
| `searchData` | `(text, perPage)` | `search`, `per_page`، الفرز، الفلاتر |
| `onSortingChange` | `(updater, perPage)` | أول عنصر فرز فقط: `sort_by`, `sort_order`، مع البحث والفلاتر |
| `setFilter` | `(key, value)` | فلتر واحد مع بقية الحالة؛ يعيد `pageIndex` إلى صفر |
| `setFilters` | `({ key: value, ... })` | عدة فلاتر في طلب واحد؛ يعيد `pageIndex` إلى صفر |
| `changePage` | `(url: string \| null)` | رابط السيرفر مع الفرز والفلاتر؛ يتجاهل `null` |
| `changePageSize` | `(size, path)` | `per_page` الجديد، البحث، الفرز، الفلاتر؛ يعيد `pageIndex` إلى صفر |
| `syncFiltersFromUrl` | `()` | يقرأ البحث والفلاتر من `window.location.search` دون طلب جديد |

البحث والفرز والفلاتر وحجم الصفحة تستهدف رابط القائمة دون معامل `page` عادةً، فتعود الاستجابة للصفحة الأولى. البحث والفرز لا يصفران `pageIndex` محليًا فورًا؛ يصححه وصول استجابة السيرفر.

### 5.1 البحث ليس Debounce

[FilterSection](resources/admin/components/table/FilterSection.tsx) يحتفظ بنص الكتابة محليًا. الطلب يحصل عند Enter، أو زر المسح، أو حذف النص كله بعد بحث نشط. كتابة الأحرف وحدها لا ترسل طلبًا. تعديل `setSearch` في Redux وحده لا يبحث في السيرفر ولا يفلتر البيانات محليًا.

### 5.2 تعريف فلتر

| حقل `FilterConfig` | المعنى |
| --- | --- |
| `key` | اسم الحالة داخل `filterValues` |
| `param` | اسم query parameter الذي يفهمه السيرفر |
| `emptyValue` | قيمة «الكل» التي تُحذف من معاملات الطلب |
| `default` | قيمة الحالة الأولية قبل مزامنة الرابط |
| `allowedValues` | قائمة قيم صالحة للقراءة من الرابط |
| `inValidValue` | دالة ترجع `true` عند كون القيمة غير صالحة |

مثال كامل لهوك مقالات مع فلتر حالة وتصنيف، مكانه `hooks/blogs/useBlogServerSync.ts`:

```ts
import type { SortingState } from '@tanstack/react-table';
import { useServerSync, type FilterConfig } from '@/features/table';
import { index } from '@/routes/blog';

type FilterKey = 'status' | 'category_id';
const FILTERS: FilterConfig<FilterKey>[] = [
    {
        key: 'status',
        param: 'status',
        emptyValue: 'all',
        allowedValues: ['active', 'inactive'],
    },
    {
        key: 'category_id',
        param: 'category_id',
        emptyValue: 'all',
        inValidValue: (value) => !/^[1-9]\d*$/.test(value),
    },
];

export function useBlogServerSync(args: {
    tableId: string;
    search: string;
    sorting: SortingState;
    pageSize: number;
}) {
    const sync = useServerSync<FilterKey>({
        ...args,
        getIndexUrl: () => index().url,
        only: ['blogs'],
        filters: FILTERS,
    });

    return {
        statusFilter: sync.filterValues.status,
        categoryFilter: sync.filterValues.category_id,
        filterByStatus: (value: string) => sync.setFilter('status', value),
        filterByCategory: (value: string) => sync.setFilter('category_id', value),
        resetFilters: () => sync.setFilters({ status: 'all', category_id: 'all' }),
        syncStatusFromUrl: sync.syncFiltersFromUrl,
        onSortingChange: sync.onSortingChange,
        searchData: sync.searchData,
        changePage: sync.changePage,
        changePageSize: sync.changePageSize,
    };
}
```

اربط قيمة الفلتر ومعالجه بعنصر واجهة داخل `initHook.filterActions`، كما في [SectionListBlogs](Modules/Blog/resources/assets/admin/components/blogs/SectionListBlogs.tsx). استخدم `setFilters` لتحديث فلاتر مترابطة معًا بدل استدعاء `setFilter` مرتين متتاليتين، لأن كل استدعاء يبني من لقطة الحالة الحالية ويرسل طلبًا منفصلًا.

قواعد دقيقة:

- فحص `allowedValues/inValidValue` يحصل عند **قراءة الرابط فقط**؛ `setFilter` لا يتحقق منهما. التحقق المعتمد يبقى على السيرفر.
- إذا عرّفت `allowedValues` و`inValidValue` معًا، فالقائمة لها الأولوية ولا تُستدعى الدالة.
- `default` لا يظل مطبقًا إن غابت القيمة عن الرابط عند المزامنة؛ تتحول إلى `emptyValue`.
- الهوك لا يقرأ `sort_by/sort_order` من الرابط، ولا يقرأ `resources.filters` التي يعيدها Blog. توافق الفلاتر لا يعني توافق مؤشر الفرز الابتدائي.
- `changePage` لا يضيف `search/per_page` من حالته؛ يجب أن تحتوي روابط السيرفر عليهما. استدعاء `withQueryString()` موجود في قوائم Blog ويحفظهما.
- تذييل السيرفر يوفر أول/سابق/تالي/آخر وأحجام 10، 20، 30، 40، 50. لا يرسم أرقام صفحات `meta.links` حاليًا.
- لا تفترض أن `router.get` أو `searchData` يعيدان Promise اكتمال طلب يمكن انتظارها؛ ربط الاكتمال يعتمد على callbacks الخاصة بـ Inertia.

### 5.3 الفرز المسموح على السيرفر

| المورد | الحقول المقبولة |
| --- | --- |
| المقالات | `id`, `title`, `slug`, `created_at`, `updated_at` |
| التصنيفات | `id`, `name`, `slug`, `description`, `is_active`, `created_at`, `updated_at` |
| الوسوم | `id`, `name`, `slug`, `is_active`, `created_at`, `updated_at` |

القيمة غير المدعومة تعود إلى `created_at`، والاتجاه الافتراضي `desc`. عطّل `enableSorting` لأي عمود لا يقابله فرز مدعوم، خصوصًا الأعمدة المركبة والإجراءات. عمود `description` في جدول المقالات الحالي قابل للنقر للفرز رغم أنه خارج القائمة المقبولة؛ لا تنسخ هذا السلوك إلى مورد جديد.

<a id="columns"></a>

## 6. الأعمدة والخلايا الجاهزة

### 6.1 عقد العمود

| الخاصية | الاستخدام الصحيح |
| --- | --- |
| `accessorKey` | مفتاح الحقل؛ يستعمله renderer للوصول إلى عمود TanStack |
| `id` | معرّف صريح لعمود مركب لا يملك `accessorKey`؛ المسار الحالي يدعمه وقت التشغيل |
| `accessorFn` | تحويل قيمة الخلية أو إرجاع الصف كاملًا لخلية مركبة |
| `header` | النص أو دالة العرض؛ هو مصدر عنوان رأس الجدول |
| `cell` | دالة/مكوّن يعيد خلية كاملة؛ لا توجد إضافة تلقائية لـ `<td>` |
| `nonHideable` | منع إخفاء العمود بواسطة خوارزمية التجاوب المحلية |
| `enableSorting` | عطّله عندما لا يوجد فرز صحيح لهذا العمود على السيرفر |
| `label` | موجود في النوع الموسع؛ لا يستعمله renderer الحالي بدل `header` |

تعريف `TableColumnDescriptor` يفرض `accessorKey` في بعض واجهات العرض المنخفضة المستوى، رغم أن `Table.tsx` يقبل `id` fallback وقت التشغيل. استخدم `ExtendedColumnDef<T>` للأعمدة المعتادة، ولا تفترض تطابق الأنواع المنخفضة المستوى مع كل ميزات TanStack.

اجعل معرّف العمود واحدًا وواضحًا؛ إذا استعملت `id` و`accessorKey` مختلفين في العمود نفسه فواجهة العرض تفضّل `accessorKey`، وقد لا تجد العمود الذي عرّفه TanStack بالـ `id` الآخر. الوصول المتداخل الذي ينتج معرّفًا محوّلًا يحتاج مراجعة مماثلة؛ الأفضل معرّف بسيط و`accessorFn` عند تركيب البيانات.

### 6.2 كل renderer مسؤول عن TableCell

[Row.tsx](resources/admin/components/table/Row.tsx) يعرض نتيجة `flexRender` مباشرة. لذلك المثال التالي صحيح، وإرجاع نص فقط أو `<div>` مباشرةً غير مناسب داخل الصف:

```tsx
import type { CellContext } from '@tanstack/react-table';
import type { LegacyFeatures } from '@tanstack/react-table/legacy';
import { TableCell } from '@/components/ui/table';

type NamedRow = { id: number; name: string };

export function NameCell({ row }: CellContext<LegacyFeatures, NamedRow, unknown>) {
    return <TableCell>{row.original.name}</TableCell>;
}
```

لا تضف `<TableCell>` حول خلية جاهزة تعيده أصلًا؛ ستنتج خلايا متداخلة. وكذلك لا تحذف `cell` اعتمادًا على renderer النصي الافتراضي في TanStack، لأن غلاف `<td>` مطلوب في هذا المشروع.

### 6.3 كتالوج الخلايا

الخلايا التالية مصدرة من [components/table/index.ts](resources/admin/components/table/index.ts):

| الخلية | طريقة تمريرها إلى `cell` | القيمة المطلوبة والسلوك |
| --- | --- | --- |
| `textCell` | `textCell` | نص/رقم/ReactNode؛ `null/undefined` تصبح فراغًا؛ لا تمرر كائنًا خامًا |
| `centeredTextCell` | `centeredTextCell` | يحول القيمة إلى نص ويعرضها بالوسط؛ الكائن يحتاج تحويلًا مخصصًا |
| `descriptionCell` | `descriptionCell` | نص طويل يعرض بحد سطرين |
| `booleanBadgeCell` | `booleanBadgeCell('نعم', 'لا')` | truthiness؛ مرر boolean حقيقيًا لأن النص `'false'` يُعد صحيحًا |
| `badgeCell` | `badgeCell` | كائن `{ label, color }`؛ اللون قيمة CSS |
| `dateCell` | `dateCell()` أو `dateCell(false)` | تاريخ مع الوقت افتراضيًا، أو تاريخ فقط؛ غير الصالح يعرض `-` |
| `currencyCell` | `currencyCell('YER')` | قيمة رقمية/نص رقمي، والقيمة الفارغة تعرض `-` |
| `sarCurrencyCell` | `sarCurrencyCell` | قيمة رقمية مع أيقونة الريال؛ ليست factory فلا تستدعها بـ `()` |
| `listCell` | `listCell('، ')` | مصفوفة قيم قابلة للتحويل إلى نص؛ حوّل مصفوفة الكائنات إلى أسمائها أولًا |
| `actionsCell` | `actionsCell(handlers)` | يمرر `row.original` للمعالجات؛ أيقونات مع تلميحات |
| `SwitchCell` | `SwitchCell(onChange)` | خاص باتفاقية `is_active`؛ callback يعيد القيمة المنطقية النهائية |

ملفان إضافيان غير مصدرين في ملف التجميع:

- [EventCell.tsx](resources/admin/components/table/cells/EventCell.tsx): الدالة `eventCell` تعرض `row.original.title/description` داخل `TableCell`.
- [downloadCell.tsx](resources/admin/components/table/cells/downloadCell.tsx): يستقبل `getValue()` ويستدعي `onDownload(raw)`، لكنه **لا يعيد TableCell**. يجب تغليفه في renderer يضيف خلية؛ لا تستعمله مباشرة مثل بقية الخلايا. لا ينفذ تحميل الملف بنفسه.

### 6.4 إجراءات الصف

`actionsCell` يقبل لكل مفتاح إما دالة، أو كائنًا يحتوي:

```ts
type RowAction<T> = {
    onClick: (item: T) => void;
    isVisible?: (item: T) => boolean;
    Icon?: import('lucide-react').LucideIcon;
    label?: string;
    color?: string;
    size?: number;
    className?: string;
};
```

المفاتيح ذات أيقونة وتسمية افتراضيتين: `onEdit`, `onDelete`, `onForceDelete`, `onTranslate`, `onLayout`, `onView`, `onDownload`, `onRestore`, `onPassword`, `onWalletTopUp`, `onReceipt`.

للإجراء المخصص أعطِ `Icon` و`label` صراحةً، وإلا قد يصبح بلا أيقونة مفيدة. الترتيب يتبع ترتيب مفاتيح الكائن. `isVisible` يخفي الإجراء بصريًا؛ الصلاحية الحقيقية تُفحص على السيرفر. التسمية الافتراضية لـ `onDelete` هي «Move to trash»، لكنها لا تحدد نوع الحذف المنفذ؛ عدّل التسمية إذا كانت عملية المورد مختلفة.

المقالات والتصنيفات والوسوم تستخدم خلايا قوائم منسدلة خاصة داخل [cells](Modules/Blog/resources/assets/admin/cells). استخدمها إذا احتجت القائمة الحالية، أو `actionsCell` العام للأيقونات المباشرة. تمرير `initHook.deleteRow` وحده لا ينشئ زر حذف؛ الزر يأتي من تعريف العمود أو العرض البديل.

<a id="details"></a>

## 7. التجاوب ونافذة التفاصيل

### 7.1 كيف تختار الواجهة الأعمدة المرئية؟

[TableCustomize](resources/admin/components/table/table-customize.tsx) يستدعي [useVisibleColumns](resources/admin/hooks/use-visible-columns.ts):

1. يقيس عرض حاوية الجدول بواسطة `ResizeObserver`، ويتابع أيضًا تغيير حجم النافذة.
2. يحسب السعة التقريبية: `max(1, floor(width / 120))`، وليست قياسًا فعليًا لعرض محتوى كل خلية.
3. يضيف كل أعمدة `nonHideable` أولًا، ثم يكمل من أول الأعمدة حسب ترتيب التعريف.
4. يعيد ترتيب فهارس الأعمدة المرئية وفق ترتيبها الأصلي.
5. عند غياب `ResizeObserver` يعرض جميع الأعمدة.

إذا زاد عدد الأعمدة الإلزامية عن السعة فستظل كلها ظاهرة. اختر عمود الهوية/العنوان والإجراءات بحسب الحاجة، ولا تجعل معظم الأعمدة `nonHideable`.

عرض 120px قابل للتغيير في استدعاء الهوك المنخفض المستوى عبر `columnWidth`، لكنه غير مكشوف كـ prop في `SectionListGeneric/TableCustomize` الحاليين. لا يوجد منتقي يدوي للأعمدة أو حفظ لتفضيلات إخفائها حاليًا.

عند إخفاء عمود واحد على الأقل، يظهر زر `+` في بداية الصف ويفتح نافذة التفاصيل. إذا ظهرت كل الأعمدة يختفي هذا الزر. `handleRowClick` في السياق ليس معالجًا تلقائيًا للنقر على `<tr>`؛ زر التفاصيل في `Table.tsx` يستعمل dispatch صريحًا.

### 7.2 ColumnLabels تخص نافذة التفاصيل

المصدر: [DialogComponenet.tsx](resources/admin/components/table/DialogComponenet.tsx). اسم الملف يحتوي هذه التهجئة فعلًا.

| الخاصية | تأثيرها في نافذة التفاصيل |
| --- | --- |
| `label` | اسم الحقل؛ إن لم يوجد تُعرض تسمية المفتاح |
| `hidden` | استبعاد الحقل من النافذة |
| `accessorFn(value)` | تحويل قيمة **الحقل نفسه** قبل العرض والنسخ |
| `render(value)` | عرض React مخصص للقيمة بعد `accessorFn` |
| `prefix`, `suffix` | إضافات مرئية قبل/بعد قيمة غير `null/undefined` |

نافذة التفاصيل تمر على `Object.entries(selectedRow)`، ولا تمر على تعريفات الأعمدة. لذلك:

- `columnLabels.updated_at.hidden = true` لا يخفي عمود `updated_at` من الجدول.
- وضع label باسم `actions` لا يضيف حقلًا جديدًا إذا لم يكن موجودًا في كائن الصف.
- الحقول الموجودة في الصف وغير المعرفة في labels تظهر أيضًا؛ أخفِ الحقول التقنية مثل `__row_state` إن استعملتها.
- لا تعتمد على `hidden` لحماية بيانات حساسة؛ لا ترسلها أصلًا إلى المتصفح.
- لا تعرض كل الحقول المتداخلة تلقائيًا كسطور منفصلة؛ استخدم `accessorFn/render` لتقديم العلاقات بصورة مفهومة.

مثال دالة labels لمكان داخل `lables/`:

```ts
import type { ColumnLabels } from '@/types/table';

export function getDetailsLabels(t: (key: string) => string): Record<string, ColumnLabels> {
    return {
        title: { label: t('column_title') },
        content: { label: t('column_content'), hidden: true },
        category: {
            label: t('column_category'),
            accessorFn: (value) => value?.name ?? null,
        },
        tags: {
            label: t('column_tags'),
            accessorFn: (value) => Array.isArray(value)
                ? value.map((tag) => tag.name)
                : [],
        },
        __row_state: { label: '', hidden: true },
    };
}
```

تأكد من عقد `tags` الفعلي أولًا؛ المثال يفترض مصفوفة، بينما بعض استجابات collections قد تغلفها بـ `data`. لا تغيّر النوع لإخفاء اختلاف استجابة السيرفر.

### 7.3 العرض والنسخ والتحديد الفردي

النافذة تدعم تلقائيًا القيم المنطقية، الأرقام، تواريخ ISO، الروابط، البريد، الكائنات كـ JSON، والمصفوفات كوسوم مع عرض أول خمسة عناصر وزر للتوسعة. زر النسخ ينسخ القيمة بعد `accessorFn`، وليس الناتج البصري لدالة `render`.

لفتحها من زر أو بطاقة، أرسل `tableActions.setSelectedRow({ tableId, row })`؛ لإغلاقها استخدم `clearSelectedRow`. الصف المختار مخزن ككائن مستقل: تحديثه أو حذفه من `data` لا يحدّث هذا الكائن تلقائيًا. أغلق التفاصيل أو حدّث اختيارها عند العملية إذا كانت النافذة مفتوحة.

<a id="mutations"></a>

## 8. العمليات والنماذج وتحديث الصفوف

### 8.1 ما يفعله useResourceActions فعلًا

المصدر: [useResourceActions.ts](resources/admin/features/table/hooks/useResourceActions.ts).

| المدخل | وظيفته الفعلية |
| --- | --- |
| `tableId`, `tableData` | ربط عمليات الصف بحالة المورد |
| `resourceName` | اسم المورد في رسائل التأكيد والنجاح والفشل |
| `getId`, `getName` | استخراج المعرف والاسم من الصف |
| `destroyRoute` | دالة Wayfinder تعيد `{ url, method }` |
| `updateRoute`, `extractUpdated` | موجودان في نوع الخيارات لكن التنفيذ الحالي لا يستخدمهما |

المخرجات: `addRow`, `updateRow`, `deleteRow`, `rows`.

مسار الحذف الحالي: تأكيد `confirmAlertDialog` → طلب Axios عبر `destroyRoute` → عند نجاحه `rows.remove(id)` → إزالة محلية بعد مهلة الحركة. عند الإلغاء لا يرسل الطلب، وعند الفشل يعرض toast ولا يحذف الصف محليًا.

**`await deleteRow(item)` لا يضمن اكتمال HTTP:** الدالة تنتظر التأكيد ثم تبدأ `toast.promise` دون إرجاع/انتظار وعد الطلب نفسه. لذلك لا تكتب بعدها مباشرة `router.reload` أو عملية bulk متسلسلة بافتراض أن الحذف انتهى. إن احتجت إعادة تحميل بعد الحذف، اربطها بنجاح الطلب في مسار حذف مخصص داخل هوك المورد، مع الحفاظ على التأكيد ومعالجة الفشل.

الهوك يستورد Axios مباشرة من `axios`؛ خدمات Blog تستخدم `@/lib/axios` ذي interceptors خاصة. لا تفترض أن تخصيص العميل الثاني ينطبق آليًا على الحذف في الهوك العام.

### 8.2 العمليات المحلية ليست طلبات سيرفر

المصدران: [tableRows.ts](resources/admin/features/table/utils/tableRows.ts)، [rowState.ts](resources/admin/features/table/utils/rowState.ts).

| العملية | السلوك |
| --- | --- |
| `rows.add(item)` / `addRow(item)` | إدراج في أول الصفحة، وسم `created`، إزالة الوسم بعد 1200ms |
| `rows.update(item)` / `updateRow(item)` | دمج الحقول في صف موجود بالـ id، وسم `updated`، إزالة الوسم بعد 800ms |
| `rows.remove(id)` | وسم `deleted` ثم إزالة الصف بعد 420ms |
| `rows.toggleSelect(id)` | تبديل التحديد الجماعي |
| `rows.selectAll()` | استبدال التحديد بمعرفات البيانات الموجودة حاليًا |
| `rows.clearSelection()` | إلغاء التحديد الجماعي |

حدود هذه الأدوات:

- `addRow` ليس upsert رغم اسم نوع payload؛ لا يمنع تكرار المعرف.
- `updateRow` لا يضيف صفًا غير موجود، وإنما يدمج التغييرات في الموجود.
- لا تضبط `meta.total/last_page/from/to`، ولا تقص عدد السجلات إلى `pageSize`.
- لا تعيد تطبيق فلتر السيرفر أو ترتيبه. قد تبقى فئة معطلة في قائمة «النشط»، أو يظهر سجل جديد في صفحة لا ينتمي إليها.
- لا يوجد rollback شبكي تلقائي؛ الاسم `addOptimisticRow` لا يتصل بالسيرفر.
- المؤقتات غير مربوطة بدورة حياة المكوّن؛ لا تفترض إلغاءها عند مغادرة الصفحة أو إعادة استخدام `tableId`.
- الجدول يضيف كلاسات `row-created/row-updated/row-deleted`. المراجعة لم تجد تعريفات لهذه الكلاسات في `resources`؛ وجود الوسم والمهلة لا يضمن تأثيرًا بصريًا دون CSS فعّال لها.

### 8.3 متى أعيد تحميل المورد؟

المبدأ المعماري للمشروع أن السيرفر مصدر الحقيقة. استخدم إعادة جلب prop المورد بعد نجاح الحفظ عندما تتأثر الفلاتر أو الفرز أو الإجماليات:

```ts
import { router } from '@inertiajs/react';

export function refreshCategoriesAfterSave(): void {
    router.reload({ only: ['categories'] });
}
```

تطبيق التصنيفات والوسوم الحالي يستعمل `addRow(saved)/updateRow(saved)` بعد نجاح الحفظ بدل إعادة الجلب. هذا تحديث محلي بصف مؤكد من السيرفر، لكنه لا يعيد حساب القائمة. إذا أضفت تحديثًا محليًا لتحسين الاستجابة، فلا تعتبره بديلًا عن جلب القائمة عند تغير شروطها. ولا تضف الصف مرة أخرى في callback إعادة التحميل.

### 8.4 خدمة الحفظ وعقد الاستجابة

استخدم دوال Wayfinder الموجودة بدل تركيب URL يدويًا. دالة route تعيد الطريقة والرابط، ويمكن تمريرهما إلى `api.request`. [مرجع Wayfinder](https://github.com/laravel/wayfinder).

في Blog، ليست كل الاستجابات تحت `response.data.data`:

| العملية | شكل الاستجابة الذي يقرأه المستهلك |
| --- | --- |
| قائمة مورد | prop أو جسم JSON فيه `data`, `links`, `meta`, `filters` |
| حفظ تصنيف | controller يعيد `{ category: ... }` لطلب JSON |
| حفظ وسم | controller يعيد `{ tag: ... }` لطلب JSON |
| حفظ مقال | خدمة المقالات تدعم `data` أو `blog` أو جسم الصف المباشر؛ `BlogResource` يحدد `$wrap = null` |
| قراءة ترجمة تصنيف/وسم | `{ translation: ... }` |

القاعدة: اقرأ عقد endpoint نفسه. `res.data.data` صحيح لمورد مغلف بـ `data`، ولا يصح فرضه على استجابة `{ category }`. في خدمة جديدة استخدم استخراجًا واضحًا ومطابقًا للاستجابة؛ لا تعتمد على سلسلة fallbacks لتغطية عقد غير معروف.

مثال تعليمي لخدمة التصنيفات، مكانها `services/blog_category.service.ts`:

```ts
import api from '@/lib/axios';
import { store, update } from '@/routes/blog/categories';
import type { BlogCategory, BlogCategoryPayload } from '../types/category';

export async function saveCategory(
    item: BlogCategory | null,
    payload: BlogCategoryPayload,
): Promise<BlogCategory> {
    const route = item ? update(item.id) : store();
    const response = await api.request<{ category: BlogCategory }>({
        url: route.url,
        method: route.method,
        data: payload,
    });

    return response.data.category;
}
```

### 8.5 ربط النموذج

- `onCreate` يفتح نموذجًا بعنصر `null`؛ `editRow(row)` يمرر السجل الحالي؛ `closeForm` يغلق ويصفر العنصر.
- ضع منطق submit في hook وخدمة الحفظ في `services`، ومكوّن الحقول في ملف النموذج؛ لا تضع طلبات الحفظ داخل تعريف الأعمدة.
- امنع تكرار submit بـ `processing`، واعرض أخطاء 422 باستخدام `normalizeValidationErrors`، واستدعِ `onSaved` فقط بعد نجاح السيرفر.
- هيئ قيم النموذج عند الفتح وتغير العنصر، وصفّر الأخطاء عند الإغلاق. استخدم `name` للحقول المقروءة من `FormData`.
- داخل `<form>` يجب أن تحمل الأزرار غير المخصصة للإرسال `type="button"`.
- حافظ على `useDirection` واتجاه Drawer وفق النمط الموجود، وافصل حالة الترجمة عن حالة إنشاء/تعديل المورد.
- لا تضع hook في util أو event handler. الخلايا ذات الحالة المحلية تكون مكوّنات React مستقلة أو factories تعيد مكوّنًا كما في `blogSwitchCell`.

المثال الفعلي: [useBlogCategoryDrawerForm](Modules/Blog/resources/assets/admin/hooks/blog-categories/useBlogCategoryDrawerForm.ts) و[BlogCategoryForm](Modules/Blog/resources/assets/admin/components/blog-categories/forms/BlogCategoryForm.tsx).

### 8.6 عقدا السويتش مختلفان

| الخلية | callback | معنى القيمة الراجعة |
| --- | --- | --- |
| `SwitchCell` المشتركة | `(itemWithNextIsActive) => Promise<boolean>` | القيمة النهائية لـ `checked`؛ `false` قد يعني أن التعطيل نجح |
| `blogSwitchCell` | `(item, nextValue) => Promise<boolean>` | نجاح العملية؛ `true` للنجاح حتى إذا كانت الحالة الجديدة `false` |

في `blogSwitchCell` تتغير الحالة المحلية فورًا ويُعطّل السويتش أثناء الطلب، ثم يتراجع عند الفشل. في الخلية المشتركة ينتظر callback قبل اعتماد النتيجة، ولا يوجد loading guard. كلاهما يهيئ `useState` من قيمة أولية دون effect لمتابعة تغير قيمة الصف لاحقًا؛ اختبر تحديث الصف من مصدر آخر ولا تفترض أن السويتش يعكسه تلقائيًا.

<a id="views"></a>

## 9. العروض البديلة والسياق

العروض الإضافية تُعرّف عبر `TableViewOption[]` في `initHook.views`، وتعيش مكوّناتها داخل `components/[resource]/views/`. لا تضع عرض القائمة والبطاقات كاملًا داخل `SectionList`.

| حقل الخيار | الوظيفة |
| --- | --- |
| `value` | معرّف النمط؛ القيمة `table` محجوزة لعرض الجدول الافتراضي |
| `label` | اسم مترجم يظهر في التلميح |
| `icon` | أيقونة زر النمط |
| `render({ tableId, initHook })` | دالة تعرض مكوّن النمط البديل |

إذا لم توجد `views` يظهر الجدول. إذا كانت قيمة Redux غير متاحة في الخيارات يرجع العرض لأول خيار، لكنه لا يكتب هذا التصحيح في Redux تلقائيًا. زر التبديل يظهر عند وجود أكثر من خيار ويتنقل بينها دائريًا. الخيار `table` يستخدم الجدول حتى لو مررت له `render`؛ أي خيار آخر بلا `render` يعود أيضًا لعرض الجدول.

الـ footer ونافذة التفاصيل يظلان ضمن الغلاف المشترك في العروض البديلة. هذه العروض تعرض الصفحة الحالية من Redux، وليس كل النتائج.

### 9.1 ماذا يوفر TableContext؟

`tableId`, `visibleColumns`, `handleRowClick`, `actions`, `onCreate`, `hasCreate`, `showCreate`.

- `useTableContext()` يشترط وجود Provider ويرمي خطأ خارجه.
- `useOptionalTableContext()` يعيد `undefined` عند غياب السياق.
- `SectionListGeneric` ينشئ Provider الخارجي، و`TableCustomize` يدمج سياقه مع `visibleColumns` داخل الجدول.
- `visibleColumns` فهارس رقمية، وليست أسماء الأعمدة، وليست حالة TanStack `columnVisibility`.
- لن تحصل البطاقات على إجراءاتها بمجرد وجود `deleteRow/editRow` في hook؛ مرر كائن `actions` بالأسماء التي تقرؤها (`onEdit/onDelete/onTranslate`).

مثال hook عرض مبسط، مكانه `components/blogs/views/useBlogViews.tsx`. يحتوي حالة تحميل وحالة فراغ لأن الغلاف لا يضيفهما تلقائيًا للعرض المخصص:

```tsx
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TableViewOption } from '@/components/table/SectionListGeneric';
import { useTableContext } from '@/context/TableContext';
import { selectTableData, selectTableIsLoading, tableActions } from '@/features/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Blog } from '../../../types/blog';
import BlogEmptyState from './BlogEmptyState';

function BlogTitlesView() {
    const { tableId, onCreate } = useTableContext();
    const dispatch = useAppDispatch();
    const { t } = useTranslation('main');
    const id = tableId ?? 'blogs';
    const blogs = useAppSelector((state) => selectTableData<Blog>(state, id));
    const loading = useAppSelector((state) => selectTableIsLoading(state, id));

    if (loading) {
        return <p role="status">{t('Loading...')}</p>;
    }
    if (blogs.length === 0) {
        return <BlogEmptyState onCreate={onCreate} />;
    }

    return (
        <ul>
            {blogs.map((blog) => (
                <li key={blog.id}>
                    <button
                        type="button"
                        onClick={() => dispatch(tableActions.setSelectedRow({ tableId: id, row: blog }))}
                    >
                        {blog.title}
                    </button>
                </li>
            ))}
        </ul>
    );
}

export function useBlogViews(): TableViewOption[] {
    const { t } = useTranslation('blog');
    return useMemo(() => [
        { value: 'table', label: t('view_table') },
        { value: 'list', label: t('view_list'), render: () => <BlogTitlesView /> },
    ], [t]);
}
```

للقوائم الأكبر افصل `BlogTitlesView` إلى ملف مستقل، وأضف مفاتيح الترجمة لأي نص جديد. قبل وصول hydration الأول قد تكون Redux فارغة و`isLoading` غير نشطة؛ إذا لزم منع ومضة الحالة الفارغة فعرّف جاهزية البيانات صراحةً، ولا تعتمد على `isClient` الحالي.

### 9.2 اختيار Drawer أو صفحة مستقلة

المقالات تستخدم صفحات إنشاء وتحرير وترجمة مستقلة، بينما التصنيفات والوسوم تستخدم Drawers. للمسارات الجديدة أو المعدّلة استخدم الدوال المتولدة الموجودة:

```ts
import { router } from '@inertiajs/react';
import { create, edit, translate } from '@/routes/blog';

export const openCreateBlog = () => router.visit(create().url);
export const openEditBlog = (id: number) => router.visit(edit(id).url);
export const openTranslateBlog = (id: number) => router.visit(translate(id).url);
```

هذا أوضح من تركيب `${index().url}/${id}/edit` المستخدم في بعض ملفات Blog الحالية. لا تعدّل ملفات routes المتولدة يدويًا.

<a id="state"></a>

## 10. التحديد وحالة Redux

### 10.1 أنواع الحالة ومكان حفظها

الحالة محفوظة تحت `state.table.tables[tableId]`:

| الحقل | القيمة الأولية | نطاقه |
| --- | --- | --- |
| `search` | `''` | البحث المرسل، وليس النص الذي لم يضغط المستخدم Enter عليه |
| `viewMode` | `'table'` | طريقة العرض |
| `data` | `[]` | الصفحة الحالية مع وسم حركة اختياري |
| `isLoading` | `false` | حالة جلب القائمة |
| `pagination` | `{ pageIndex: 0, pageSize: 10 }` | حالة التصفح للجدول |
| `sorting` | `[]` | حالة الفرز؛ الطلب يستخدم أول عنصر فقط |
| `serverPagination` | `null` | `meta` و`links` القادمان من السيرفر |
| `selectedRow` | `null` | كائن معاينة تفاصيل واحد |
| `selectedRowIds` | `[]` | معرفات التحديد الجماعي |
| `selectedRowsMap` | `{}` | خريطة اختبار التحديد |
| `lastUpdated` | timestamp | يتحدث عند hydration؛ ليس توقيت كل تعديل محلي |

الفلاتر المخصصة وحالة النموذج ليست في هذا الكائن: الفلاتر في `useServerSync`، وحالة فتح النموذج في `useTableResources`، ونص البحث أثناء الكتابة في `SearchBox`، والأعمدة المرئية في `useVisibleColumns`.

لا توجد آلية persist إلى localStorage في store الحالي. لا يُحذف الجدول تلقائيًا عند unmount، فتظل حالته ما دام store نفسه قائمًا. إعادة تحميل المتصفح تعيد بناء store. `resetTable/removeTable` يعالجان Redux فقط، ولا يصفران URL أو حالة الفلاتر المحلية أو النماذج تلقائيًا.

### 10.2 selectors

كلها متاحة من `@/features/table`، وتأخذ `(state, tableId)` إلا ما ذُكر:

| الدالة | النتيجة |
| --- | --- |
| `selectTableData<T>` | الصفوف الحالية |
| `selectTableSearch` | نص البحث |
| `selectTableViewMode` | النمط |
| `selectTableIsLoading` | حالة التحميل |
| `selectTablePagination` | التصفح المحلي |
| `selectTableSorting` | الفرز |
| `selectTableServerPagination` | ترقيم السيرفر أو `null` |
| `selectTableTotalRows` | إجمالي السيرفر، أو عدد الصفوف إن غاب الإجمالي |
| `selectTableSelectedRow<T>` | صف التفاصيل أو `null` |
| `selectTableSelectedRowIds` | معرفات التحديد الجماعي |
| `selectTableSelectedCount` | عدد المعرفات المختارة |
| `selectTableIsRowSelected(state, tableId, rowId)` | هل المعرف محدد؟ |
| `selectIsTableEmpty` | هل بيانات الصفحة فارغة؟ |
| `selectIsTableHydrated` | فحص تقريبي؛ قد يكون `true` بمجرد إنشاء entry ولو `serverPagination === null` |

عند عدم وجود الجدول ترجع selectors قيمًا افتراضية. `selectIsTableEmpty` لا يميز وحده بين «لم يصل الرد بعد» و«لا توجد نتائج».

### 10.3 إجراءات Redux

الاستيراد: `import { tableActions } from '@/features/table'`. كل payload يحتوي `tableId`.

| الإجراء | بقية payload |
| --- | --- |
| `hydrateFromServer` | `data, pagination, serverPagination` |
| `setLoading` | `isLoading` |
| `setSearch` | `search` |
| `setViewMode` | `viewMode` |
| `setSelectedRow` / `clearSelectedRow` | `row` / لا شيء |
| `setData` | `data`؛ يستبدل البيانات فقط |
| `addRow` | `item, position?: 'start' \| 'end', state?` |
| `updateRow` | `id, changes, state?` |
| `removeRow` | `id`؛ يزيل المعرف من التحديد الجماعي أيضًا |
| `setRowState` | `id, state: 'created' \| 'updated' \| 'deleted' \| null` |
| `toggleSelectRow` | `id` |
| `selectAllRows` / `clearRowSelection` | لا شيء |
| `setPagination` | `pagination` جزئية |
| `setSorting` / `clearSorting` | `sorting` / لا شيء |
| `setServerPagination` | `serverPagination` |
| `resetTable` / `removeTable` | لا شيء |

هذه إجراءات حالة محلية؛ استدعاؤها لا يرسل HTTP. الفرق بين `tableActions.removeRow` و`rows.remove` أن الأول يحذف فورًا، والثاني يضيف مهلة الحركة.

### 10.4 التحديد الجماعي ليس تحديد التفاصيل

- `selectedRow` خاص بنافذة التفاصيل؛ `selectedRowIds` خاص بالعمليات الجماعية. أحدهما لا يغيّر الآخر.
- `selectAllRows` يحدد بيانات الصفحة الموجودة في store فقط؛ ليس كل نتائج قاعدة البيانات.
- `hydrateFromServer` لا يمسح التحديد عند التنقل أو البحث؛ قد تبقى معرفات صفحات سابقة.
- استدعاء `selectAllRows` في صفحة أخرى **يستبدل** المعرفات الحالية بمعرفات تلك الصفحة.
- لا توجد checkboxes أو endpoint حذف جماعي جاهز ضمن الغلاف. أضف واجهة التحديد وعقد العملية على السيرفر إذا احتجتهما.
- لا تعتمد على `table.getSelectedRowModel()`؛ حالة التحديد هنا خاصة بـ Redux وغير موصولة بنظام row selection في TanStack.

مثال مكوّن تحديد من داخل Provider، مستقل عن رسم الخلايا:

```tsx
import { useTableContext } from '@/context/TableContext';
import { selectTableIsRowSelected, tableActions } from '@/features/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function SelectRecord({ id, label }: { id: number; label: string }) {
    const { tableId } = useTableContext();
    const dispatch = useAppDispatch();
    const checked = useAppSelector((state) =>
        tableId ? selectTableIsRowSelected(state, tableId, id) : false,
    );

    if (!tableId) {
        return null;
    }

    return (
        <input
            type="checkbox"
            aria-label={label}
            checked={checked}
            onChange={() => dispatch(tableActions.toggleSelectRow({ tableId, id }))}
        />
    );
}
```

إذا وضعته داخل عمود فغلّفه بـ `TableCell` في renderer ذلك العمود. حدّد سياسة واضحة لمسح التحديد عند تغيير الفلاتر، ثم نفذها صراحةً؛ ليست افتراضية في الميزة.

<a id="components"></a>

## 11. مرجع مكوّنات العرض

### 11.1 SectionListGeneric

| prop | الاستخدام |
| --- | --- |
| `tableId` | معرّف مطابق للهوك |
| `initHook` | نتيجة هوك المورد مع تخصيصات العرض |
| `columnLabels` | إعدادات نافذة التفاصيل |
| `children` | قسم فلترة إضافي أعلى شريط الأدوات داخل CardHeader |
| `showCreate` | التحكم المباشر في ظهور الإضافة |
| `createTooltip`, `createLabel`, `createIcon` | تخصيص زر الإضافة |

أهم امتدادات `initHook` المستهلكة فعليًا:

| المفتاح | الاستخدام |
| --- | --- |
| `table`, `columns`, `isClient` | ضرورية لعرض الجدول |
| `searchData(value)` | تنفيذ البحث؛ إذا غاب يغيّر الغلاف Redux فقط |
| `onCreate`, `hasCreate`, `showCreate` | سلوك زر الإضافة |
| `createTooltip`, `createLabel`, `createIcon` | بدائل إن لم تمررها مباشرة إلى المكوّن |
| `filterActions` | JSX بجانب أزرار شريط الأدوات |
| `views` | طرق العرض المتاحة |
| `actions` | إجراءات السياق للبطاقات والقوائم |
| `handleRowClick` | تمرير إلى السياق؛ لا يربطه الجدول بنقر الصف كاملًا |
| `enableSorting` | تعطيل واجهة الفرز لجميع الأعمدة عند `false` |
| `rowSkeleton(visibleColumns, columnCount, pageSize)` | استبدال renderer صفوف التحميل |

أولوية ظهور الإضافة:

```text
showCreate المباشر
    ?? initHook.showCreate
    ?? (initHook.hasCreate !== false && Boolean(initHook.onCreate))
```

لكن `FilterSection` يشترط وجود `onCreate` أيضًا. `showCreate={true}` وحده لا ينشئ إجراءً، و`showCreate={false}` يخفي الزر ويمنع تمرير `onCreate` للعروض البديلة عبر السياق. إخفاء الإضافة لا يخفي التعديل والحذف أو يمنح/يلغي صلاحية على السيرفر.

للجدول المخصص للقراءة فقط: استخدم `hasCreate: false`، وعرّف أعمدة بلا إجراءات تعديل/حذف، ولا تمررها في سياق البطاقات. لا تعطِ `destroyRoute` رابطًا فارغًا ثم تترك زر الحذف ظاهرًا؛ يمكن لهوك العمليات الخاص بالقراءة إرجاع `addRow/updateRow` كدوال محلية غير مستخدمة مع حذف الإجراءات الشبكية من الواجهة.

### 11.2 بقية المكوّنات

| الملف | دوره وكيفية استخدامه |
| --- | --- |
| [Table.tsx](resources/admin/components/table/Table.tsx) | رسم الجدول، الفرز، التجاوب، تفاصيل الصف، skeleton والتذييل |
| [Row.tsx](resources/admin/components/table/Row.tsx) | رسم خلية واحدة بـ `flexRender`؛ الاسم لا يعني أنه يرسم صفًا كاملًا |
| [RowSkeleton.tsx](resources/admin/components/table/RowSkeleton.tsx) | عدد الصفوف = `pageSize`؛ `columnCount` يتضمن عمود التفاصيل عند وجوده |
| [FilterSection.tsx](resources/admin/components/table/FilterSection.tsx) | البحث اليدوي، `extraActions`، تبديل العرض والإضافة |
| [FooterTable.tsx](resources/admin/components/table/FooterTable.tsx) | يختار تذييل السيرفر أو التصفح المحلي بحسب `manualPagination` |
| [ServerPaginationFooterTable.tsx](resources/admin/components/table/ServerPaginationFooterTable.tsx) | يستقبل `{ links, meta }`, `onPageChange`, `onPageSizeChange?` |
| [ComboboxSelect.tsx](resources/admin/components/table/ComboboxSelect.tsx) | Select عادي بلا بحث؛ `data: { value, label }[]`, `value`, `onSelect`, `commandEmptyText`, `className`؛ يزيل القيم الفارغة/المكررة |
| [DropdownMenuExport.tsx](resources/admin/components/table/DropdownMenuExport.tsx) | واجهة CSV/PDF/print؛ التنفيذ في `onExport(format)`، ويدعم `disabled` |

`DropdownMenuExport` غير مركب تلقائيًا. يمكن وضعه داخل `filterActions` مع handler مخصص. لا يصدر كل النتائج بمجرد وجوده؛ اختر صراحةً تصدير الصفحة أو النتائج المطابقة، ووفر الخدمة اللازمة لذلك.

التذييل المحلي موجود لمن يبني جدولًا محليًا مستقلًا. تغيير `FooterTable` وحده لا يحوّل `useTableResources` إلى جدول محلي؛ الهوك يفرض الفرز والترقيم اليدويين ولا يجهز row model للتصفح المحلي.

التذييل اليدوي يفضّل `serverPagination` في Redux، ثم `table.options.meta.pagination` كبديل. يحتاج `meta.onChangePage`، وإلا لا يظهر. `useTableResources` يجهز هذه القيم ومعالج تغيير حجم الصفحة تلقائيًا.

`@/components/table` يصدّر الخلايا فقط؛ استورد المكوّنات الأخرى من ملفاتها المباشرة. أما `@/features/table` فيصدّر reducer/actions/types/selectors/hooks وأدوات الصفوف.

<a id="blog"></a>

## 12. خريطة تطبيق Blog

### 12.1 المقالات

مسار القراءة المقترح:

1. [pages/blog.tsx](Modules/Blog/resources/assets/admin/pages/blog.tsx).
2. [SectionListBlogs](Modules/Blog/resources/assets/admin/components/blogs/SectionListBlogs.tsx).
3. [useTableBlog](Modules/Blog/resources/assets/admin/hooks/blogs/useTableBlog.tsx).
4. [useBlogActions](Modules/Blog/resources/assets/admin/hooks/blogs/useBlogActions.ts)، [useBlogColumns](Modules/Blog/resources/assets/admin/hooks/blogs/useBlogColumns.tsx)، [useBlogServerSync](Modules/Blog/resources/assets/admin/hooks/blogs/useBlogServerSync.ts).
5. [views](Modules/Blog/resources/assets/admin/components/blogs/views)، [getBlogColumnLabels](Modules/Blog/resources/assets/admin/lables/getBlogColumnLabels.ts).
6. [BlogController](Modules/Blog/app/Http/Controllers/BlogController.php) و[BlogCollection](Modules/Blog/app/Transformers/BlogCollection.php).

المقالات تعرض `table/list/cards`. `editRow` و`translateRow` يفتحان صفحات مستقلة، ويُستبدل `onCreate` في `SectionListBlogs` للتنقل إلى صفحة إنشاء. الفلاتر في الهوك تشمل الحالة والتصنيف، لكن شريط الأدوات الحالي يرسم **فلتر الحالة فقط**. بيانات خيارات التصنيفات تحتاج مصدرًا عند إضافة واجهة فلتر التصنيف؛ لا ينشئها الهوك تلقائيًا.

### 12.2 التصنيفات والوسوم

| الجزء | التصنيفات | الوسوم |
| --- | --- | --- |
| التجميع | [SectionListBlogCategories](Modules/Blog/resources/assets/admin/components/blog-categories/SectionListBlogCategories.tsx) | [SectionListBlogTags](Modules/Blog/resources/assets/admin/components/blog-tags/SectionListBlogTags.tsx) |
| الهوكات | [hooks/blog-categories](Modules/Blog/resources/assets/admin/hooks/blog-categories) | [hooks/blog-tags](Modules/Blog/resources/assets/admin/hooks/blog-tags) |
| النموذج | [BlogCategoryForm](Modules/Blog/resources/assets/admin/components/blog-categories/forms/BlogCategoryForm.tsx) | [BlogTagForm](Modules/Blog/resources/assets/admin/components/blog-tags/forms/BlogTagForm.tsx) |
| الترجمة | [BlogCategoryTranslateForm](Modules/Blog/resources/assets/admin/components/blog-categories/forms/BlogCategoryTranslateForm.tsx) | [BlogTagTranslateForm](Modules/Blog/resources/assets/admin/components/blog-tags/forms/BlogTagTranslateForm.tsx) |
| الخدمات | [blog_category.service](Modules/Blog/resources/assets/admin/services/blog_category.service.ts) | [blog_tag.service](Modules/Blog/resources/assets/admin/services/blog_tag.service.ts) |
| السيرفر | [BlogCategoryController](Modules/Blog/app/Http/Controllers/BlogCategoryController.php) | [BlogTagController](Modules/Blog/app/Http/Controllers/BlogTagController.php) |

كلاهما يستخدم الجدول الافتراضي وDrawer إنشاء/تعديل وDrawer ترجمة مستقلًا. تفعيل/تعطيل `is_active` يمر عبر `blogSwitchCell` → `handleToggleActive` → الخدمة → `resource.rows.update(updated)`. خدمة تبديل الحالة الحالية تعيد إرسال الحقول المطلوبة للتحديث العام؛ ليست endpoint مستقلًا لتبديل boolean فقط.

### 12.3 ملفات التوافق القديمة

- [hooks/useTableBlogs.ts](Modules/Blog/resources/assets/admin/hooks/useTableBlogs.ts) يعيد تصدير `useTableBlog`، وليس تنفيذ جدول آخر.
- [type.d.ts](Modules/Blog/resources/assets/admin/type.d.ts) يعيد تصدير الأنواع من `types/`.
- [label.tsx](Modules/Blog/resources/assets/admin/label.tsx) و[lables/blogColumnLabels.tsx](Modules/Blog/resources/assets/admin/lables/blogColumnLabels.tsx) يقدمان إعادة تصدير لدوال labels.

عند إضافة كود جديد ارجع للتنفيذ الأساسي في `hooks/[resource]` و`types` و`lables`، ولا تنشئ مجموعة ثالثة من الملفات. تهجئة `lables` هي الموجودة في المشروع حاليًا.

<a id="findings"></a>

## 13. ملاحظات التحليل وحدود التنفيذ الحالي

هذه نتائج مراجعة الشيفرة، وليست قائمة إصلاحات منفذة. ميّز بين ميزة مكتملة وبين أدوات أولية تحتاج ربطًا من المورد.

| الملاحظة | أثرها | التعامل الصحيح عند الاستخدام |
| --- | --- | --- |
| هوك التجميع يستدعي `syncStatusFromUrl`، وهوكات Blog الثلاثة تعيد `syncFiltersFromUrl` | البيانات قد تكون مفلترة من السيرفر بينما البحث/الفلاتر في الواجهة غير مستعادة من URL؛ الطلب التالي قد يفقدها | استخدم alias الوارد في الوصفة؛ إصلاح الملفات الحالية مهمة مستقلة |
| لا توجد مزامنة للفرز الابتدائي من URL أو `resources.filters` | النتائج قد تكون مرتبة بلا مؤشر رأس مطابق | هيئ حالة الفرز صراحةً إذا كان ذلك مطلوبًا، ولا تفترض أن alias الفلاتر يصلحه |
| بحث الجدول يعمل بـ Enter والمسح | وصفه بأنه بحث فوري مؤجل غير دقيق | وثّق تجربة البحث الحالية وأبقِ النص المحلي منفصلًا |
| فرز وصف المقال خارج allowlist السيرفر | قد يظهر اتجاه فرز لا يمثل العمود الفعلي | `enableSorting: false` لذلك العمود، أو دعم سيرفر صريح |
| `updateRoute/extractUpdated` غير مستخدمين في `useResourceActions` | تمريرهما لا ينشئ طلب تعديل ولا يربط switch | نفّذ التحديث في service ثم تعامل مع الصف النهائي |
| `deleteRow` لا يعيد وعد HTTP | التسلسل عبر `await deleteRow` قد يبدأ مبكرًا | اربط العمل التالي بالنجاح الحقيقي للطلب |
| الإضافة/الحذف المحليان لا يحدثان meta | إجمالي التذييل/عدد صفحات لا يطابق الصفوف حتى جلب جديد | أعد جلب المورد بعد العمليات المؤثرة |
| `ColumnLabels.hidden` للتفاصيل فقط | عمود الجدول قد يبقى ظاهرًا | اضبط تعريف الأعمدة نفسه؛ التجاوب يعتمد `nonHideable` |
| `isClient` ثابت `true` | ليس guard ضد الوصول إلى `window/document` أثناء SSR | أبقِ الوصول للمتصفح داخل handlers/effects أو guards فعلية |
| `selectIsTableHydrated` يقبل entry بـ pagination تساوي `null` | قد يعطي جاهزية مبكرة | استخدم حالة جاهزية صريحة أو تحققًا من ترقيم السيرفر |
| العروض المخصصة لا تحصل على skeleton تلقائي | بطاقات Blog الحالية تبقى ببياناتها القديمة أثناء الطلب | اقرأ `selectTableIsLoading` داخل العرض |
| عرض الجدول لا يحتوي رسالة «لا توجد نتائج» | جسم الجدول فارغ عند `data.length === 0` | لا تفترض وجود empty-state prop؛ يتطلب توسيعًا للمكوّن أو عرضًا مخصصًا |
| التحديد والتفاصيل يبقيان عند hydration | معرفات قديمة أو نافذة تعرض نسخة قديمة | اختر سياسة مسح/تحديث صريحة |
| بطاقات وقائمة Blog تبدأ إخفاء العنصر قبل تأكيد الحذف | إلغاء التأكيد أو فشل الطلب قد يترك العنصر مخفيًا/معطلًا محليًا | لا تنسخ هذا النمط؛ اربط الحركة بالنجاح وأعد الحالة عند الإلغاء/الفشل |
| `SwitchCell` و`blogSwitchCell` لهما عقدا boolean مختلفان | تفسير `false` خطأً يسبب حالة واجهة خاطئة | استخدم العقد الخاص بكل خلية |
| حالة السويتش المحلية لا تتابع props بعد mount | قد لا تعكس تحديثًا خارجيًا على الصف | راجع المزامنة أو اجعل الخلية controlled عند تطويرها |
| `downloadCell` بلا غلاف خلية | بنية HTML غير صحيحة عند استعماله مباشرة | أضف `TableCell` في renderer المستهلك |
| fallback paginator المسطح يأخذ `links` كما هي | مصفوفة links لا توفر `first/next` للتذييل | قدم شكل `Pagination<T>` الموحّد |

في حالات التزامن، `isLoading` boolean واحد وليس عداد طلبات. واجهة التصفح لا تمنع جميع الطلبات أثناء التحميل؛ اختبر سرعة تغيير الفلاتر والصفحات عند توسيع الميزة. كذلك لا توجد virtualization أو إعادة ترتيب أعمدة أو تصدير خادمي أو bulk mutation جاهزة في هذه الطبقة.

<a id="verification"></a>

## 14. حل المشكلات والتحقق

### 14.1 تشخيص سريع

| العرض | ما ينبغي فحصه أولًا |
| --- | --- |
| الجدول فارغ رغم وجود نتائج | اسم prop، شكل `resources.data`، تطابق `tableId`، وجود Provider |
| البحث يغير النص دون نتائج | وجود `initHook.searchData` والضغط على Enter وصحة `only` |
| رابط مفلتر يفتح بقيم واجهة فارغة | alias `syncStatusFromUrl`؛ لا يعالجه تغيير labels |
| فقدان البحث في الصفحة التالية | احتفاظ روابط pagination بـ query string على السيرفر |
| رأس عمود أو خلية لا يظهران | تطابق معرف TanStack مع `accessorKey/id`، وخوارزمية الأعمدة المرئية |
| تحذير HTML حول `td/tr` | renderer بلا `TableCell` أو تغليف خلية جاهزة مرتين |
| التذييل غائب | `serverPagination` و`table.options.meta.onChangePage` |
| أزرار التالي/السابق معطلة خطأً | شكل `links` ككائن، وقيم URLs، وليست `meta.links` |
| زر الإضافة غائب | أولوية `showCreate`، قيمة `hasCreate`، وجود `onCreate` |
| البطاقة لا تنفذ تعديلًا/حذفًا | `initHook.actions` وأسماء `onEdit/onDelete` في السياق |
| السجل مكرر أو ترتيب الصفحة غير صحيح | استعمال `addRow` أكثر من مرة أو الاعتماد على التحديث المحلي بدل السيرفر |
| إجمالي النتائج لم يتغير بعد حذف | meta لا تتحدث محليًا؛ اربط إعادة جلب بنجاح HTTP |
| `useTableContext must be used within a TableProvider` | وضع المكوّن خارج الغلاف/Provider |
| عمود بقي ظاهرًا رغم `hidden: true` | هذا إعداد للتفاصيل، وليس لظهور أعمدة الجدول |

### 14.2 قائمة تحقق عند إنشاء جدول

- نوع الصف يطابق Resource الفعلي وعلاقاته، ومعرفه ثابت وغير مكرر.
- المسارات من Wayfinder، والعمليات تستخدم طريقة HTTP التي يعيدها route.
- هوكات المورد مفصولة، وصفحة Inertia رفيعة، والـ views في مجلدها.
- `only` يطابق prop، ومعرف الجدول موحد وفريد.
- كل خلية تعيد `TableCell` واحدة، وكل عمود قابل للفرز مدعوم على السيرفر.
- البحث، الفرز، الفلاتر، حجم الصفحة وروابط التنقل تحافظ على المعاملات المطلوبة.
- `syncStatusFromUrl` موصول؛ والتحقق من فرز URL منفصل إن احتجته.
- إنشاء/تعديل/ترجمة/حذف ناجح وفاشل وإلغاء التأكيد لا يتركون حالة عرض عالقة.
- بعد الإضافة أو الحذف أو تغيير حقل فلترة، تعكس القائمة والإجماليات نتيجة السيرفر.
- التحديد الجماعي له سياسة واضحة للصفحات والفلاتر، ولا يخلط مع تفاصيل الصف.
- اختُبر عرض ضيق وRTL/LTR، وحالة التحميل والفراغ في كل view.
- نصوص المستخدم مترجمة، وأزرار داخل النماذج تحمل نوعًا صريحًا.
- الصلاحيات والتحقق موجودان في السيرفر؛ إخفاء الزر مساعد بصري فقط.

### 14.3 الاختبارات المتاحة ونطاقها

[اختبار توافق الواجهة](tests/Unit/frontend-upgrade.test.mjs) يحتوي اختبارًا محددًا للجدول، يتحقق من عدم تغيير ترتيب الصفوف محليًا في الوضع اليدوي ومن عدد الصفحات وcallback الفرز:

```sh
node --test --test-name-pattern="table compatibility" tests/Unit/frontend-upgrade.test.mjs
```

هذا الاختبار نجح أثناء إعداد التوثيق. لا يغطي دورة Inertia أو الفلاتر أو CRUD أو التفاعل في المتصفح.

اختبارات Blog الموجودة: [BlogControllerTest.php](Modules/Blog/tests/Feature/BlogControllerTest.php). يمكن تشغيلها بعد تغيير سلوك الوحدة:

```sh
php artisan test --compact Modules/Blog/tests/Feature/BlogControllerTest.php
```

للتغييرات البرمجية شغّل أيضًا فحص الأنواع المناسب للمشروع:

```sh
npm run types
```

الأمران الأخيران هنا إرشادات للتحقق بعد تعديل الكود، وليسا ادعاءً بأنهما نُفذا أثناء كتابة هذا الدليل. اختبار عرض قائمة مفلترة بـ `assertOk` وحده لا يثبت صحة نتائج الفلترة؛ عند توسيع الاختبارات تحقق من معرفات النتائج وmeta وروابطها أيضًا.

<a id="references"></a>

## 15. المراجع

- [بنية الواجهة المعتمدة](frontend-architecture.md) و[بنية الباكند](backend-architecture.md): تنظيم ملفات المورد وحدود المسؤوليات.
- [نقطة تصدير الميزة](resources/admin/features/table/index.ts)، [الأنواع](resources/admin/features/table/tableSlice.types.ts)، [reducers](resources/admin/features/table/tableSlice.ts)، [selectors](resources/admin/features/table/tableSlice.selectors.ts).
- [أنواع مكوّنات الجدول](resources/admin/types/table/index.d.ts) و[SectionListGeneric](resources/admin/components/table/SectionListGeneric.tsx) و[TableContext](resources/admin/context/TableContext.tsx).
- [Inertia v3: Partial Reloads](https://inertiajs.com/docs/v3/data-props/partial-reloads): مرجع `only` وإعادة جلب prop في الصفحة نفسها.
- [Laravel Wayfinder](https://github.com/laravel/wayfinder): مرجع دوال المسارات المتولدة.

عند اختلاف تعليق داخل ملف أو مثال قديم مع التنفيذ، ارجع إلى جسم الدالة الحالي وعقد استجابة المورد. هذا الدليل يذكر تلك الاختلافات صراحةً كي لا تتحول إلى افتراضات عند بناء جدول جديد.
