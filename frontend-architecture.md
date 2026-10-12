# Frontend Architecture

> **اقرأ هذا الملف أولًا قبل بناء أو تعديل أي موديول فرونت اند.**
> يصف البنية الكاملة المتّبعة في هذا المشروع بحيث يمكن لأي AI session
> جديدة إنشاء موديول فرونت اند جاهز للإنتاج دون الحاجة لاستقبال الملفات المصدرية.
>
> هذا الملف هو المرجع الوحيد لكل ما يخص الفرونت اند. للهيكلية العامة
> للباك-إند (Laravel Modules، Actions، Services، إلخ) راجع
> `backend-architecture.md` بدل هذا الملف.

---

## 0. أين تعيش ملفات الفرونت اند

كل ملفات فرونت-إند الموديول (بدون استثناء) تعيش تحت:

```text
modules/[module-name]/resources/assets/admin/
```

وصفحات الدخول (Inertia page entry points — الملفات التي تُطابق
`Inertia::render('...')` من الكونترولر) تعيش تحديدًا تحت:

```text
modules/[module-name]/resources/assets/admin/pages/
```

صفحة الدخول (`pages/Index.tsx` مثلاً) تبقى **رفيعة** — مهمتها الوحيدة
تمرير الـ props من Inertia إلى مكوّن `SectionList[Module]` (الموصوف في
القسم 14 أدناه)، وليس احتواء أي منطق. لا تضع state أو fetching منطق
داخل ملف `pages/` نفسه.

```tsx
// pages/Index.tsx
import SectionListCouriers from '../components/SectionListCouriers';

export default function Index() {
    return <SectionListCouriers />;
}
```

---

## 1. Stack التقني

| طبقة | الأداة |
|---|---|
| Framework | Laravel 12 + Inertia.js |
| UI Library | React + TypeScript |
| Styling | Tailwind CSS |
| Component Library | shadcn/ui |
| Table | TanStack Table v8 (عبر `useTableResources`) |
| Forms | `useForm` من `@inertiajs/react` أو `useState` يدوي |
| HTTP Client | `axios` عبر `@/lib/axios` |
| Routing (type-safe) | Wayfinder — يولّد دوال من routes Laravel |
| Notifications | `sonner` (toast) |
| i18n | `react-i18next` |

---

## 2. بنية المجلدات لكل موديول

كل موديول (مثل `couriers`, `merchants`, `accounting-periods`) يتبع نفس الهيكل:

```
modules/[module-name]/resources/assets/admin
├── pages/
│   └── Index.tsx                    ← Inertia page entry point (رفيع جدًا، انظر القسم 0)
├── [ModuleName]Status.ts            ← enum قيم الحالة + helper getAllStatuses()
├── types/
│   └── [modelName].ts              ← TypeScript interface للموديل
├── contexts/
│   └── Form[X]Context.tsx          ← Context للـ Dialogs الثانوية
├── actions/
│   └── [ActionName].tsx            ← Row-action factory functions
├── cells/
│   └── [cellName].tsx              ← خلايا جدول مخصصة
├── lables/
│   └── get[Module]ColumnLabels.ts  ← أسماء الأعمدة (مترجمة)
├── services/
│   └── [module].service.ts         ← axios calls (save/delete/fetch)
├── hooks/
│   ├── [module]/
│   │   ├── use[Module]Actions.tsx  ← يدمج useResourceActions + row actions
│   │   ├── use[Module]Columns.tsx  ← تعريف أعمدة الجدول
│   │   ├── use[Module]ServerSync.tsx ← filters + pagination + sorting
│   │   └── useTable[Module].tsx    ← يجمع الثلاثة في useTableResources
│   └── forms/
│       └── use[Module]Form.ts      ← منطق فورم الإنشاء/التعديل
└── components/
    ├── [Module]DrawerForm.tsx       ← Drawer الإنشاء/التعديل الرئيسي
    ├── forms/
    │   └── form[SecondaryAction].tsx ← Dialog الإجراءات الثانوية
    └── SectionList[Module].tsx     ← الصفحة الرئيسية (Entry point)
```

---

## 3. Type Interface

يجب أن يعكس الـ interface بدقة ما يُرسله الباكند (Inertia props أو JSON).

```typescript
// types/courier.ts
export default interface Courier {
    id: number;
    name: string;
    phone: string;
    identity_number: string;
    vehicle_type: string;
    vehicle_number: string;
    governorate_id: number | null;
    governorate_name: string | null;
    district_id: number | null;
    district_name: string | null;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    // علاقات مُحمَّلة من الباكند:
    // creditLimit?: CreditLimit;
    // balance?: number;
}
```

**القاعدة:** لا تضع منطقًا في الـ type — فقط شكل البيانات.

---

## 4. Status Enum

```typescript
// CourierStatus.ts
export enum CourierStatus {
    Active = 'active',
    Inactive = 'inactive',
    Suspended = 'suspended',
}

export function getAllCourierStatuses(): CourierStatus[] {
    return Object.values(CourierStatus);
}
```

يُستخدم في الفورم لعرض قائمة الحالات وفي الـ `isVisible` في الأعمدة.

---

## 5. Context للـ Dialogs الثانوية

عندما يكون للموديول **dialogs إضافية** (غير فورم الإنشاء/التعديل الرئيسي) مثل
"تسجيل حركة مالية" أو "سياسة الائتمان" أو "إغلاق فترة"، تُستخدم هذه البنية:

```typescript
// contexts/FormCrediTransactionContext.tsx
type FormCrediTransactionContextType = {
    openCreditPolicy: boolean;
    setOpenCreditPolicy: (open: boolean) => void;
    openFinancialTransaction: boolean;
    setOpenFinancialTransaction: (open: boolean) => void;
    item: Courier | null;      // الصف المختار في الجدول
    setItem: (item: Courier | null) => void;
    rows: Courier[];           // نسخة من rows الجدول الحالية
    setRows: (rows: Courier[]) => void;
};
```

**القواعد:**
- Context واحد لكل موديول يضم **كل** dialogs الثانوية.
- يُلف الـ Provider حول **الصفحة الكاملة** (في الـ page entry point أو أعلى
  مستوى ممكن).
- `rows` مطلوب لأن الـ service function تحتاجه لتحديث الجدول بعد الحفظ.
- استخدم `useMemo` على الـ value لمنع re-renders غير ضرورية.

```typescript
const value = useMemo(
    () => ({ openCreditPolicy, setOpenCreditPolicy, ... }),
    [openCreditPolicy, openFinancialTransaction, item, rows]
);
```

---

## 6. Row Action Factories

بدلًا من تعريف handlers مباشرة داخل الـ hook، كل إجراء على صف هو **factory
function** تُنشئ الـ handler:

```typescript
// actions/CourierCreditPolicyUpdated.tsx
export default function createCourierCreditPolicyUpdated(
    setOpenCreditPolicy: (v: boolean) => void,
    setOpenFinancialTransaction: (v: boolean) => void,
    setItem: (item: Courier) => void,
) {
    return function (row: Courier): void {
        setItem(row);
        setOpenCreditPolicy(true);
        setOpenFinancialTransaction(false); // ← أغلق الـ dialogs الأخرى
    };
}
```

**القاعدة:** كل dialog له factory function مستقلة تضمن حالة نظيفة (dialog واحد
مفتوح في نفس الوقت). أسماء الـ factories تعكس **الحدث** الذي يُطلقها
(`CreditPolicyUpdated`, `FinancialTransactionRecorded`).

---

## 7. Column Labels

```typescript
// lables/getCourierColumnLabels.ts
export function getCourierColumnLabels(
    t: (key: string) => string,
): Record<keyof Courier, ColumnLabels> {
    return {
        id: { label: 'ID' },
        name: { label: t('Name') },
        status: { label: t('Status') },
        notes: { label: t('Notes') },
        // الأعمدة المخفية افتراضيًا:
        governorate_id: { label: t('Governorate ID'), hidden: true },
        updated_at: { label: t('Updated At'), hidden: true },
        // ...
    };
}
```

**القاعدة:** `hidden: true` للأعمدة التقنية (IDs، timestamps المساعدة).
يُمرَّر `t` من الخارج — لا تستدعِ `useTranslation` داخل هذه الدالة.

---

## 8. Custom Cells

نوعان رئيسيان من الخلايا:

### أ) خلية بسيطة — بيانات مباشرة

```typescript
// cells/infoVeicle.tsx
export const infoVeicleCell = ({ getValue }: { getValue?: () => Courier }) => {
    const courier = getValue?.();
    return (
        <TableCell className="text-center">
            {courier?.vehicle_type + ' - ' + courier?.vehicle_number}
        </TableCell>
    );
};
```

تُستخدم عندما يكون `accessorFn: (row) => row` (الصف بالكامل كـ value).

### ب) خلية غنية — HoverCard

```typescript
// cells/infoCell.tsx
export const InfoCourierCell = ({ getValue }: { getValue?: () => Courier }) => {
    const courier = getValue?.();
    // تعرض avatar + اسم + هاتف في الجدول
    // وعند hover: بطاقة تفصيلية مع copy للهاتف والهوية
};
```

**القاعدة للـ HoverCard:**
- `openDelay={200} closeDelay={100}` دائمًا.
- الزر داخل `HoverCardTrigger` يحتوي على المعلومة الأساسية فقط.
- محتوى الـ HoverCard: مقسّم بـ `border-b` بين القسم الرئيسي والتفاصيل.
- عناصر قابلة للنسخ تستخدم نمط `group/cursor-pointer` مع أيقونة
  `CopyIcon` تظهر عند hover و`CheckIcon` عند النسخ لمدة 2 ثانية.

---

## 9. Service Functions

```typescript
// services/courier.service.ts
export async function saveCourier(
    item: Courier | null,
    payload: CourierPayload,
): Promise<Courier> {
    const url = item ? update(item.id).url : store().url;
    const method = item ? 'put' : 'post';
    const res = await api[method](url, payload);
    return res.data.data; // ← دائمًا res.data.data لـ Laravel JsonResource
}
```

**القواعد:**
- الـ service لا تعرض توست ولا تغلق dialogs — هذا دور الـ hook الذي يستدعيها.
- استثناء: الـ **form-level services** (مثل `saveCourierCreditLimits`) تعرض
  توست وتغلق الـ dialog لأنها مستدعاة مباشرة من `onSubmit` في Dialog.
- دائمًا استخدم `api.get/post/put/delete` من `@/lib/axios`.
- الـ URLs من Wayfinder: `import { store, update, destroy } from '@/routes/courier'`.

**نمط الـ form-level service (Dialog):**
```typescript
export async function saveCourierCreditLimits(
    data: any,
    reset: () => void,
    setOpen: (open: boolean) => void,
    rows: Courier[],
    setError: Function,
): Promise<void> {
    const toastId = toast.loading('...');
    try {
        await api.post(store().url, data);
        toast.success('...', { id: toastId });
        router.reload({ only: ['couriers'] }); // ← partial reload دائمًا
        reset();
        setOpen(false);
    } catch (error: any) {
        if (error?.response?.status === 422) {
            const errors = normalizeValidationErrors(error.response.data?.errors);
            Object.entries(errors).forEach(([field, msg]) => setError(field, msg));
        }
        toast.error(getAxiosErrorMessage(error), { id: toastId });
    }
}
```

**مبدأ التحديث:** `router.reload({ only: ['resourceName'] })` دائمًا بدل
Optimistic Update — البيانات تأتي من الباكند وهو مصدر الحقيقة.

---

## 10. الـ Hooks الأربعة

هذه هي قلب كل موديول. كل موديول يملك النسخ التالية:

### أ) `use[Module]Actions`

```typescript
export function useCourierActions({ tableId, tableData }) {
    const { t } = useTranslation('couriers');
    // ← useTranslation يُستدعى هنا (Hook حقيقي)، ثم يُمرَّر t للـ factories
    
    const { setOpenCreditPolicy, setOpenFinancialTransaction, setItem }
        = useFormCrediTransactionContext();

    const resource = useResourceActions({
        tableId,
        tableData,
        resourceName: t('Courier'),
        getId: (x) => x.id,
        getName: (x) => x.name,
        destroyRoute: destroy,    // ← من Wayfinder
        updateRoute: update,      // ← من Wayfinder
        extractUpdated: (res) => res.data?.Courier ?? null,
    });

    // ← كل row action إضافية تُنشأ بـ useMemo
    const FinancialTransactionRecorded = useMemo(
        () => createFinancialTransactionRecorded(
            setOpenCreditPolicy, setOpenFinancialTransaction, setItem
        ),
        [resource.rows], // ← dependency: rows فقط
    );

    return { ...resource, FinancialTransactionRecorded, CourierCreditPolicyUpdated };
}
```

**إن لم يكن للمورد destroy/update** (مثل الفترات المحاسبية Immutable):
```typescript
const noopRoute = () => ({ url: '' });
useResourceActions({ ..., destroyRoute: noopRoute, updateRoute: noopRoute, extractUpdated: () => null });
```

### ب) `use[Module]Columns`

```typescript
export function useCourierColumns({ editRow, deleteRow, FinancialTransactionRecorded, ... }) {
    const { t } = useTranslation('couriers');
    
    const columns = useMemo((): ExtendedColumnDef<Courier>[] => [
        {
            accessorKey: 'name',
            header: () => t('Name'),
            accessorFn: (row) => row,   // ← مرر الصف كاملًا لخلايا HoverCard
            nonHideable: true,
            cell: InfoCourierCell,
        },
        {
            id: 'courier_vehicle',      // ← id يدوي للأعمدة المركّبة
            header: () => t('Vehicle'),
            accessorFn: (row) => row,
            cell: infoVeicleCell,
        },
        {
            accessorKey: 'balance',
            header: () => t('Balance'),
            accessorFn: (row) => row.balance ?? '-',
            cell: centeredTextCell,     // ← cell جاهزة من @/components/table
        },
        {
            accessorKey: 'created_at',
            cell: dateCell(false),      // ← false = لا تعرض الوقت
        },
        {
            accessorKey: 'actions',
            nonHideable: true,
            enableSorting: false,
            cell: actionsCell({
                onEdit: editRow ?? (() => {}),
                onDelete: deleteRow ?? (async () => {}),
                // Row actions إضافية:
                FinancialTransactionRecorded: {
                    onClick: FinancialTransactionRecorded ?? (async () => {}),
                    Icon: Wallet,
                    color: 'text-blue-500',
                    label: t('Record Financial Transaction'),
                    isVisible: (row: Courier) => row.status === 'active', // ← شرط الظهور
                },
            }),
        },
    ], [deleteRow, editRow, t, FinancialTransactionRecorded]);

    return columns;
}
```

**مهم:** لا تكرر `t` في مصفوفة الـ dependencies.

### ج) `use[Module]ServerSync`

```typescript
// الفلاتر تُعرَّف خارج الـ hook (ثوابت)
const STATUS_FILTER: FilterConfig<'status'> = {
    key: 'status',           // ← اسم الـ key في filterValues
    param: 'status',         // ← اسم الـ query param المُرسَل للباكند
    emptyValue: 'all',       // ← القيمة الافتراضية (= لا فلتر)
    allowedValues: ['open', 'closed'], // ← للقيم الثابتة
    // inValidValue: (v) => !/^\d+$/.test(v), // ← للقيم الديناميكية (IDs)
};

export function useCourierServerSync({ tableId, search, sorting, pageSize }) {
    const sync = useServerSync({
        tableId, search, sorting, pageSize,
        getIndexUrl: () => index().url,  // ← Wayfinder
        only: ['couriers'],               // ← Inertia partial reload props
        filters: [STATUS_FILTER],         // ← حذف السطر إن لا فلاتر
    });

    return {
        // كل فلتر: قيمة + setter
        statusFilter: sync.filterValues.status as StatusValue,
        filterByStatus: (next: StatusValue) => sync.setFilter('status', next),
        
        // دائمًا هذه الأربعة:
        syncStatusFromUrl: sync.syncFiltersFromUrl,
        onSortingChange: sync.onSortingChange,
        searchData: sync.searchData,
        changePage: sync.changePage,
        changePageSize: sync.changePageSize,
    };
}
```

### د) `useTable[Module]`

```typescript
export function useTableCourier({ couriers }: { couriers: Pagination<Courier> }) {
    return useTableResources<Courier>({
        resources: couriers,
        tableId: 'couriers',          // ← string فريد لكل جدول
        useActions: useCourierActions,
        useColumns: useCourierColumns,
        useServerSync: useCourierServerSync,
    });
}
```

هذا الملف **لا يحتوي أي منطق** — فقط يجمع الثلاثة.

---

## 11. Form Hook

```typescript
// hooks/forms/useCourierForm.ts
export function useCourierForm({ item, onSaved, onClose, t, tMain }) {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // حالات إضافية للـ Select fields:
    const [status, setStatus] = useState(CourierStatus.Active);
    const [governorateId, setGovernorateId] = useState('');

    useEffect(() => {
        // مزامنة الحالة مع الـ item عند الفتح
        setStatus(item?.status ?? CourierStatus.Active);
        // ...
    }, [item]);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (processing) return;
        setProcessing(true);
        setErrors({});

        const form = new FormData(e.currentTarget);
        const payload = { name: String(form.get('name') ?? '').trim(), ... };

        const toastId = toast.loading(tMain(item ? 'updating' : 'creating', { ... }));

        try {
            const saved = await saveCourier(item, payload);
            toast.success(tMain(item ? 'updated' : 'created', { ... }), { id: toastId });
            onSaved?.(saved);
            onClose();
        } catch (error: any) {
            if (error?.response?.status === 422) {
                setErrors(normalizeValidationErrors(error.response.data?.errors));
            }
            toast.error(getAxiosErrorMessage(error), { id: toastId });
        } finally {
            setProcessing(false);
        }
    };

    return { submit, processing, errors, status, setStatus, ..., resetAndClose };
}
```

**القواعد:**
- `FormData` للحقول البسيطة (inputs بـ `name`).
- `useState` لحقول الـ `Select` و `Switch` و غيرها من controlled components.
- `processing` guard في بداية `submit` لمنع double-submit.
- `t` و `tMain` يُمرَّران كـ props وليس داخل الـ hook.

---

## 12. DrawerForm Component

```typescript
export default function CourierDrawerForm({ open, item, onOpenChange, onSaved }) {
    const { t } = useTranslation('couriers');
    const { t: tMain } = useTranslation('main');
    const dir = useDirection(); // ← 'rtl' | 'ltr'

    const { submit, processing, errors, ... } = useCourierForm({ item, onSaved, onClose: () => onOpenChange(false), t, tMain });

    return (
        <Drawer
            direction={dir === 'rtl' ? 'left' : 'right'} // ← RTL-aware
            open={open}
            onOpenChange={onOpenChange}
        >
            <DrawerContent dir="ltr"> {/* ← dir=ltr دائمًا على DrawerContent */}
                <div dir={dir}> {/* ← dir الصحيح داخليًا */}
                    <DrawerHeader>...</DrawerHeader>
                    
                    <form className="flex h-[90%] flex-col" onSubmit={submit}>
                        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
                            {/* الحقول */}
                            <div className="grid gap-3">
                                <Label htmlFor="field-id" className="required-label">...</Label>
                                <Input id="field-id" name="field_name" defaultValue={item?.field ?? ''} />
                                <InputError message={errors.field_name} />
                            </div>
                        </div>
                        
                        <DrawerFooter>
                            <Button type="submit" disabled={processing}>
                                {processing && <LoaderCircleIcon className="h-4 w-4 animate-spin" />}
                                {title}
                            </Button>
                            <DrawerClose asChild>
                                <Button type="button" variant="outline" onClick={resetAndClose}>
                                    {tMain('Cancel')}
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
```

**القواعد:**
- `dir="ltr"` على `DrawerContent` نفسه، و `dir={dir}` على الـ wrapper الداخلي.
- `className="flex h-[90%] flex-col"` على الـ form.
- `no-scrollbar flex-1 overflow-y-auto` على حاوية الحقول.
- `defaultValue` (uncontrolled) للـ inputs العادية — `value` + `onChange` فقط للـ Select وما شابه.

---

## 13. Secondary Dialog Forms

نمط Dialog ثانوي (يُفتح من row action):

```typescript
// components/forms/formCreditPolicy.tsx

// 1. الفورم نفسه (component منفصل)
function CourierCreditLimitForm() {
    const { item, setOpenCreditPolicy, rows } = useFormCrediTransactionContext();
    
    const { data, setData, reset, processing, errors, setError } = useForm({
        courier_id: item?.id ?? '',
        credit_limit: item?.creditLimit?.credit_limit ?? '',
        // ...
    });
    // ← useForm من @inertiajs/react للـ dialogs (وليس useState يدوي)
    // ← القيم الابتدائية من item مباشرة

    const submit = async (e) => {
        e.preventDefault();
        await saveCourierCreditLimits(data, reset, setOpenCreditPolicy, rows, setError);
    };

    return (
        <form onSubmit={submit}>
            <FieldGroup className="grid gap-4 py-4">
                <Field data-invalid={!!errors.field_name}>
                    <FieldLabel>...</FieldLabel>
                    <Input value={data.field} onChange={(e) => setData('field', e.target.value)} />
                    <FieldDescription>...</FieldDescription>
                    {errors.field_name && <FieldError errors={[{ message: errors.field_name }]} />}
                </Field>
            </FieldGroup>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
                <Button type="submit" disabled={processing}>Save</Button>
            </DialogFooter>
        </form>
    );
}

// 2. الـ Dialog wrapper
export function FormCreditPolicy() {
    const { openCreditPolicy, setOpenCreditPolicy, item } = useFormCrediTransactionContext();
    
    return (
        <Dialog open={openCreditPolicy} onOpenChange={setOpenCreditPolicy}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>...</DialogTitle>
                    <DialogDescription>...</DialogDescription>
                </DialogHeader>
                {item && <CourierCreditLimitForm />}  {/* ← guard: item موجود */}
            </DialogContent>
        </Dialog>
    );
}
```

---

## 14. SectionList — Entry Point

```typescript
// components/SectionListCouriers.tsx
export default function SectionListCouriers(): JSX.Element {
    const couriers = usePage().props.couriers as Pagination<Courier>;
    const { t } = useTranslation('couriers');
    const { t: tMain } = useTranslation('main');
    const { setRows } = useFormCrediTransactionContext(); // ← مزامنة rows مع Context

    const {
        deleteRow, isFormOpen, formItem, closeForm, onCreate, addRow, updateRow,
        // فلاتر:
        statusFilter, filterByStatus,
        rows, tableId,
        ...hookProps    // ← الباقي يذهب لـ SectionListGeneric
    } = useTableCourier({ couriers });

    useEffect(() => { setRows(rows); }, [rows]); // ← مزامنة rows دائمًا

    const columnLabels = useMemo(() => getCourierColumnLabels(t), [t]);

    return (
        <>
            <SectionListGeneric
                tableId={tableId}
                initHook={{
                    ...hookProps,
                    deleteRow,
                    onCreate,
                    // الفلاتر تُمرَّر كـ filterActions JSX:
                    filterActions: (
                        <div className="flex flex-wrap items-center gap-2">
                            <Select value={statusFilter} onValueChange={(v) => filterByStatus(v as ...)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder={t('Status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{tMain('All')}</SelectItem>
                                    <SelectItem value="active">{t('Active')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ),
                }}
                columnLabels={columnLabels}
            />

            {/* Drawer الإنشاء/التعديل */}
            <CourierDrawerForm
                open={isFormOpen}
                item={formItem}
                onOpenChange={(open) => { if (!open) closeForm(); }}
                onSaved={(saved) => {
                    formItem ? updateRow(saved) : addRow(saved);
                }}
            />

            {/* Dialogs الثانوية — بدون props (تقرأ من Context) */}
            <FormFinancialTransaction />
            <FormCreditPolicy />
        </>
    );
}
```

**القواعد:**
- `...hookProps` يحمل كل ما يحتاجه `SectionListGeneric` (search/sort/pagination).
- `deleteRow` و `onCreate` يُمرَّران صراحةً (لا تُدمج في `...hookProps`).
- الـ Dialogs الثانوية لا تحتاج props — تقرأ من Context مباشرة.
- الـ `formItem` موجود = تعديل، `null` = إنشاء.

---

## 15. قواعد عامة لا تُكسر

| القاعدة | السبب |
|---|---|
| `router.reload({ only: [...] })` بدل Optimistic Update | الباكند هو مصدر الحقيقة |
| `res.data.data` لـ JsonResource | Laravel يُغلف الـ response |
| `useTranslation` في الـ Hook أو Component، لا في factory/util | قواعد React Hooks |
| `t` و `tMain` كـ props للـ form hooks | الـ hooks قابلة للاختبار بدون context |
| `useMemo` على كل القيم في Context provider | منع re-renders |
| `useMemo` على column definitions | الأعمدة ثقيلة الحساب |
| `defaultValue` لـ inputs بسيطة، `value + onChange` لـ Select/Switch | أداء أفضل |
| `{item && <Form />}` في الـ Dialog | منع render بلا بيانات |
| `processing` guard في بداية submit | منع double-submit |
| `dir="ltr"` على DrawerContent + `dir={dir}` على الـ wrapper | RTL support |
| أسماء الـ factories تعكس الحدث لا الإجراء | وضوح النية |

---

## 16. خريطة التماثل بين الموديولات

عند إنشاء موديول جديد، استبدل كل `Courier`/`courier` باسم الموديول الجديد:

```
CourierStatus.ts              → [Module]Status.ts
types/courier.ts              → types/[modelName].ts
contexts/FormCrediTrContext   → contexts/Form[X]Context.tsx
actions/CreditPolicyUpdated   → actions/[ActionName].tsx
cells/infoCell.tsx            → cells/[name]Cell.tsx
lables/getCourierLabels.ts    → lables/get[Module]ColumnLabels.ts
services/courier.service.ts   → services/[module].service.ts
hooks/.../useCourierActions   → hooks/.../use[Module]Actions.tsx
hooks/.../useCourierColumns   → hooks/.../use[Module]Columns.tsx
hooks/.../useCourierServerSync→ hooks/.../use[Module]ServerSync.tsx
hooks/.../useTableCourier     → hooks/.../useTable[Module].tsx
hooks/forms/useCourierForm    → hooks/forms/use[Module]Form.ts
components/CourierDrawerForm  → components/[Module]DrawerForm.tsx
components/forms/formCredit   → components/forms/form[Action].tsx
components/SectionListCouriers→ components/SectionList[Module].tsx
```

---

## 17. مثال تطبيقي — Accounting Periods

مثال على موديول بدون `destroy`/`update` (Immutable resource):

- **لا توجد** `destroyRoute`/`updateRoute` → تُمرَّر `noopRoute = () => ({ url: '' })`.
- **لا يوجد** `formItem` (دائمًا `null`) → الـ Drawer هو "إنشاء فقط".
- **Dialog ثانوي واحد** (إغلاق فترة) بدل اثنين.
- الـ Context يحتوي `openClosePeriod` بدل `openCreditPolicy + openFinancialTransaction`.
- زر "إغلاق" يظهر فقط على `row.status === 'open'` عبر `isVisible`.
- تأكيد كتابة اسم الفترة قبل الإغلاق (لأنه إجراء لا رجعة فيه).

---

## الحدود بين الباك-إند والفرونت-إند

- الباك-إند يملك: المصادقة، الصلاحيات، الـ validation، القواعد
  التجارية، الحسابات المالية، سلامة البيانات، الأمان، عقود الـ API.
- الفرونت-إند يملك: الواجهة، تفاعل المستخدم، حالة الواجهة المحلية،
  عرض الفورم، الـ validation المساعد (تجربة استخدام فقط)، تنسيق العرض.
- الـ validation في الفرونت **ليس** آلية أمان — كل قاعدة تجارية مهمة
  يجب أن تُفرض على الباك-إند أيضًا. لا تكرر منطق الحارس (guard) من
  الباك-إند في الفرونت — فقط اعكس نتيجته في الـ UI (إخفاء/تعطيل زر).

للتفاصيل الكاملة لهيكلية الباك-إند راجع `backend-architecture.md`.

---

## 18. حقول البحث/الاختيار (`*SelectField`)

كل حقل بحث/اختيار (`CourierSelectField`, `CustomerSelectField`,
`MerchantSelectField`, `DistrictSelectField`, `GovernorateSelectField`,
`CustomerAddressSelectField` ...) يتبع **نفس القالب بالضبط** — عند
إضافة حقل بحث جديد، انسخ أقرب حقل موجود من هذه القائمة كنقطة بداية،
لا تبني combobox من الصفر:

```text
Popover + Command (shadcn combobox)
  - debounce بحث 400ms عبر useEffect + setTimeout
  - Skeleton أثناء التحميل (عدد صفوف ثابت حسب السياق)
  - CommandEmpty لحالة "لا توجد نتائج"
  - قد يكون disabled حسب حقل أب (مثال: District يعتمد على Governorate،
    CustomerAddress يعتمد على Customer المختار)
```

**حالة خاصة:** بعض حقول الاختيار (`CustomerAddressSelectField`,
`CustomerSelectField`) تعرض خيار "فارغ" صريح (مثال: `عنوان جديد
(غير محفوظ)` / `بلا عميل مسجل`) — هذا **مو غياب اختيار**، هو اختيار
له معنى عملي يتحكم بسلوك الباك-إند. لا تُخفِ هذا الخيار ولا تعامله
كحالة استثناء يجب تجاهلها.

---

## 19. ديالوجات العمليات الفردية بنمط `mode`

عمليات متشابهة شكليًا (سبب نصي + تأكيد، أو اختيار كيان + تأكيد) تشترك
بديالوج واحد عبر `mode` prop، بدل تكرار نفس الـ JSX:

```tsx
<AssignCourierDialog mode="assign" ... />
<AssignCourierDialog mode="reassign" ... />

<ReasonActionDialog mode="cancel" ... />
<ReasonActionDialog mode="unassign" ... />
```

الفرق الوحيد بين الأوضاع هو أي `service`/`_actions.service` function
تُستدعى عند `submit`. كل ديالوج عملية فردية (سواء أحادي أو multi-mode)
يتبع نفس القالب:

```tsx
const [processing, setProcessing] = useState(false);
const submit = async () => {
    setProcessing(true);
    try {
        const result = await someAction(item.id, payload);
        toast.success(...);
        onDone(result);
        close();
    } catch (error) {
        toast.error(getAxiosErrorMessage(error));
    } finally {
        setProcessing(false);
    }
};
```

لا `<form>` tag أبدًا داخل Dialog من shadcn/ui — `onClick` مباشرة على
الزر، مو `onSubmit`.

---

## 20. تقسيم طبقة الـ services للموارد شبه-الثابتة

القالب الافتراضي (القسم 9 أعلاه) يستخدم ملف `services/[module].service.ts`
واحد يغطي الإنشاء والتعديل معًا (`saveCourier`). لكن حين يكون المورد
**شبه-ثابت بعد الإنشاء** ولا يوجد له `update` عام — فقط عمليات محددة
بأسماء واضحة (مثال: `Order` — لا `updateOrder`، فقط
`cancelOrder`, `assignCourier`, `recordOrderPayment` ...) — استخدم
تقسيمًا صريحًا بدل ملف واحد:

- `<module>.service.ts` → **الإنشاء فقط** (POST).
- `<module>_actions.service.ts` → **كل شيء آخر** (تعديل جزئي، إلغاء،
  تعيين، تسجيل دفعة...).

كل عملية في `*_actions.service.ts` تطابق **حارس واحد بالضبط** في
الباك-إند (مثال: `recordOrderPayment` يُرفض 422 لو الطلب مدفوع بالكامل
أصلاً). الفرونت **لا يكرر هذا المنطق** — فقط يُخفي/يُعطّل الزر كتجربة
استخدام أفضل، لكن الحارس الحقيقي دائمًا على السيرفر.

---

## 21. قواعد حرجة داخل `submit()`

1. **لا تثق بأي state مشروط بلا تحقق مزدوج عند الإرسال.** مثال: حقل
   يُرسَل فقط إن تحقق شرطان معًا (`isScheduled && scheduledFor`) — حتى
   لو الـ setter المخصص يصفّر الحقل التابع عند إيقاف الشرط، ضع نفس
   الشرط مرة ثانية وقت بناء الـ payload الفعلي كطبقة حماية ثانية.
2. **`String(possibly_null_value)` باگ شائع**: أي حقل قد يكون `null`
   (مثال: `item.merchant_id` لطلبات لا تتطلب تاجر) — `String(null)`
   تنتج النص الحرفي `"null"`. استخدم دائمًا:
   ```ts
   item.merchant_id ? String(item.merchant_id) : ''
   ```
3. حقول تُخفى شرطيًا في الـ UI (مثال: حقل يختفي حسب نوع مختار) يجب أن
   يُصفَّر state ها بالضبط عند تبدّل الشرط، لا تُترك عالقة بقيمة قديمة
   غير مستخدَمة — لا تعتمد فقط على عدم إرسالها لاحقًا في `submit()`.

---

## 22. أخطاء شائعة يجب تجنبها (من تاريخ هذا المشروع الفعلي)

1. **نسيان `type="button"`** على أي زر تفاعلي (ساعة/دقيقة/AM-PM في
   مكوّن اختيار وقت، أو أي Popover/Dialog داخلي) يُستخدم جوه
   `<form onSubmit>` أكبر — بدونها كل ضغطة زر ترسل الفورم الرئيسي فورًا
   بدل مجرد تحديد قيمة. أخطر مكان لهذا الباگ: مكوّنات اختيار
   التاريخ/الوقت المُركّبة (Calendar + أعمدة تمرير للساعة/الدقيقة).
2. **حالة UI مشروطة بلا تصفير state مصاحب** — إخفاء حقل ≠ تصفير قيمته
   (انظر القسم 21).
3. **`String(null)`** ينتج `"null"` كنص حرفي (انظر القسم 21).
4. **استخراج `.data` بدل `.data.data`** من استجابات JsonResource
   المغلّفة تلقائيًا من الباك-إند.
5. **استخدام Tailwind logical utilities (`ms-`/`me-`) على حقول ذات
   اتجاه ثابت مفروض** (أرقام هاتف، حقول إنجليزية إجبارية) بدل
   `useDirection()` + ternary صريح على `dir` — الخلط بين الاثنين ينتج
   تخطيطًا مكسورًا في بعض الحالات. الأزرار البسيطة (أيقونات، مسافات
   عامة) تبقى تستخدم `me-`/`ms-` الطبيعية.
6. **حقل نصي رقمي فارغ يُفرض له صفر افتراضي** — لو الفراغ له دلالة
   عمل حقيقية (مثال: "السعر غير معلوم بعد")، لا تستبدله بـ `0`.
