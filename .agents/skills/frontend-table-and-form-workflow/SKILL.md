---
name: frontend-table-and-form-workflow
description: Guide, standards, and copy-pasteable boilerplate for creating React/Inertia frontend tables with server-side pagination, interactive cells (Switch, Select, HoverCard), row action menus, drawer/dialog forms, and Wayfinder service layers in the Manafe project.
---

# مهارة إنشاء الجداول والفورمات والـ Services في الفرونت إند (Frontend Table & Form Workflow)

تغطي هذه المهارة كل ما يلزم لبناء موديول فرونت إند متكامل في لوحة التحكم (لوحة تحكم منافع) باستخدام **React + Inertia + TypeScript + TanStack Table + Tailwind + Shadcn UI**.

---

## 1. الهيكل المعتمد للمجلدات في أي موديول

كل موديول فرونت إند يجب أن يكون تنظيمه كالآتي:

```text
Modules/[ModuleName]/resources/assets/admin/
├── pages/
│   └── [ModulePage].tsx             ← صفحة دخول Inertia (نظيفة ورفيعة جداً)
├── types/
│   └── [model].ts                   ← تعريف الـ TypeScript Interface
├── enums/
│   └── [enum_name].ts               ← الـ Enums ودوال المساعدة (مثل getAllStatuses)
├── lables/
│   └── get[Module]ColumnLabels.ts   ← أسماء الأعمدة المترجمة وإعدادات الإخفاء
├── services/
│   ├── [module].service.ts          ← عمليات CRUD الأساسية واستدعاءات السيرفر
│   └── [module]_actions.service.ts  ← (اختياري) للعمليات الخاصة الحساسة
├── cells/
│   ├── [customCell].tsx             ← خلايا مخصصة (HoverCard، مبالغ، مجمعة)
│   ├── [module]ActionsCell.tsx      ← قائمة الإجراءات المنسدلة Dropdown
│   └── [module]SwitchCell.tsx       ← خلايا تفاعلية (سويتش حظر/تفعيل)
├── hooks/
│   ├── [module]/
│   │   ├── use[Module]Actions.ts    ← إدارة أحداث الصفوف والديالوجات
│   │   ├── use[Module]Columns.tsx   ← تعريف أعمدة TanStack Table
│   │   ├── use[Module]ServerSync.ts ← إدارة التصفح والبحث والفرز والفلاتر
│   │   └── useTable[Module].tsx     ← هوك التجميع عبر useTableResources
│   └── forms/
│       └── use[Module]Form.ts       ← إدارة حالة الفورم والتحقق والأخطاء
└── components/
    ├── [resource]/
    │   ├── views/                   ← مجلد أنماط العرض البديلة (كروت، قوائم، حالة فارغة)
    │   │   ├── [Model]CardsView.tsx ← واجهة عرض الكروت (Grid Cards)
    │   │   ├── [Model]ListView.tsx  ← واجهة عرض القائمة (List View)
    │   │   ├── [Model]EmptyState.tsx← واجهة الحالة الفارغة
    │   │   ├── use[Model]Views.tsx  ← هوك تجميع وتجهيز أنماط العرض مع الأيقونات والترجمات
    │   │   ├── [Model]Card.tsx      ← بطاقة العنصر الفردية
    │   │   └── index.ts             ← تجميع وتصدير العروض والهوك
    │   ├── forms/                   ← حقول مخصصة أو أقسام الفورم
    │   ├── [Model]DrawerForm.tsx    ← فورم الإضافة والتعديل الجانبي (Drawer)
    │   └── SectionList[Model].tsx   ← المكون الرئيسي الرفيع للجدول والفورم
```

---

## 2. الخطوة 1: تعريف الواجهات والأنواع (Types & Enums)

```typescript
// types/user.ts
export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    is_active: boolean;
    is_banned: boolean;
    created_at: string;
    updated_at: string;
}
```

```typescript
// enums/user_status.ts
export enum UserRole {
    Admin = 'admin',
    Merchant = 'merchant',
    Courier = 'courier',
    Customer = 'customer',
}

export function getAllUserRoles(): UserRole[] {
    return Object.values(UserRole);
}
```

---

## 3. الخطوة 2: طبقة الخدمات (Services Layer) مع Wayfinder

دائمًا نستخدم راوتات **Laravel Wayfinder** المولدة تلقائيًا والعميل الموحد `@/lib/axios`.

```typescript
// services/user.service.ts
import api from '@/lib/axios';
import { store, update, destroy } from '@/routes/admin/users';
import type { User } from '../types/user';

export type UserPayload = {
    name: string;
    email: string;
    phone: string;
    role: string;
    is_active: boolean;
    password?: string;
};

// حفظ (إنشاء أو تعديل)
export async function saveUser(item: User | null, payload: UserPayload): Promise<User> {
    const route = item ? update(item.id) : store();

    const response = await api.request({
        url: route.url,
        method: route.method,
        data: payload,
    });

    // إذا كانت الاستجابة مغلفة عبر JsonResource من لارافيل:
    return response.data?.data ?? response.data?.user;
}

// حذف مستخدم
export async function deleteUser(id: number): Promise<void> {
    const route = destroy(id);
    await api.request({
        url: route.url,
        method: route.method,
    });
}
```

### العمليات المخصصة الحساسة (مثل تبديل الحظر / تفعيل الحساب):
```typescript
// services/user_actions.service.ts
import api from '@/lib/axios';
import { toggleBan, toggleStatus } from '@/routes/admin/users';
import type { User } from '../types/user';

export async function toggleUserBan(userId: number, isBanned: boolean): Promise<User> {
    const route = toggleBan(userId);
    const response = await api.patch(route.url, { is_banned: isBanned });
    return response.data?.data ?? response.data?.user;
}
```

---

## 4. الخطوة 3: أسماء الأعمدة (Column Labels)

```typescript
// lables/getUserColumnLabels.ts
import type { ColumnLabels } from '@/types/table';
import type { User } from '../types/user';

export function getUserColumnLabels(
    t: (key: string) => string,
): Record<keyof User | string, ColumnLabels> {
    return {
        id: { label: 'ID' },
        name: { label: t('Name') },
        email: { label: t('Email') },
        phone: { label: t('Phone') },
        role: { label: t('Role') },
        is_active: { label: t('Status') },
        is_banned: { label: t('Ban Status') },
        created_at: { label: t('Created At') },
        updated_at: { label: t('Updated At'), hidden: true },
        actions: { label: t('Actions') },
    };
}
```

---

## 5. الخطوة 4: الخلايا المخصصة والتفاعلية (Interactive Cells)

### أ) خلية سويتش تفاعلية للحظر أو تغيير الحالة (`SwitchCell`)
الخلية تدير حالة داخلية مؤقتة وتحدث السيرفر مع إرجاع الحالة السابقة في حال حدوث خطأ (`Optimistic rollback`):

```tsx
// cells/userBanSwitchCell.tsx
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { TableCell } from '@/components/ui/table';
import type { CellContext } from '@tanstack/react-table';
import type { User } from '../types/user';

export function userBanSwitchCell(onToggleBan: (user: User, nextValue: boolean) => Promise<boolean>) {
    return function UserBanCell({ row }: CellContext<User, unknown>) {
        const user = row.original;
        const [isBanned, setIsBanned] = useState<boolean>(Boolean(user.is_banned));
        const [loading, setLoading] = useState(false);

        const handleChange = async (checked: boolean) => {
            setLoading(true);
            setIsBanned(checked); // تحديث تفاؤلي فوري في الواجهة

            try {
                const success = await onToggleBan(user, checked);
                if (!success) {
                    setIsBanned(!checked); // تراجع إذا فشلت العملية
                }
            } catch {
                setIsBanned(!checked); // تراجع عند حدوث استثناء
            } finally {
                setLoading(false);
            }
        };

        return (
            <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                    <Switch
                        checked={isBanned}
                        disabled={loading}
                        onCheckedChange={handleChange}
                        className={isBanned ? 'data-[state=checked]:bg-destructive' : ''}
                    />
                    <span className="text-xs text-muted-foreground">
                        {isBanned ? 'محظور' : 'نشط'}
                    </span>
                </div>
            </TableCell>
        );
    };
}
```

### ب) خلية اختيار منسدل مباشر داخل الجدول (`SelectCell`)
تسمح بتغيير حقل مثل "الدور" أو "الحالة" مباشرة من سطر الجدول:

```tsx
// cells/userRoleSelectCell.tsx
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TableCell } from '@/components/ui/table';
import type { CellContext } from '@tanstack/react-table';
import type { User } from '../types/user';
import { UserRole, getAllUserRoles } from '../enums/user_status';

export function userRoleSelectCell(onChangeRole: (user: User, newRole: UserRole) => Promise<void>) {
    return function UserRoleCell({ row }: CellContext<User, unknown>) {
        const user = row.original;
        const [role, setRole] = useState<UserRole>(user.role as UserRole);
        const [updating, setUpdating] = useState(false);

        const handleRoleChange = async (val: string) => {
            const nextRole = val as UserRole;
            const prevRole = role;
            setRole(nextRole);
            setUpdating(true);

            try {
                await onChangeRole(user, nextRole);
            } catch {
                setRole(prevRole); // تراجع عند الخطأ
            } finally {
                setUpdating(false);
            }
        };

        return (
            <TableCell className="text-center">
                <Select value={role} onValueChange={handleRoleChange} disabled={updating}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {getAllUserRoles().map((r) => (
                            <SelectItem key={r} value={r} className="text-xs">
                                {r}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
        );
    };
}
```

### ج) خلية قائمة الإجراءات المنسدلة (`DropdownMenu Actions`)
لإظهار قائمة خيارات شاملة لكل صف مع حراس حسب حالة السجل:

```tsx
// cells/userActionsCell.tsx
import { TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontalIcon,
    PencilIcon,
    Trash2Icon,
    EyeIcon,
    KeyRoundIcon,
    BanIcon,
    CheckCircleIcon,
} from 'lucide-react';
import type { CellContext } from '@tanstack/react-table';
import type { User } from '../types/user';

export interface UserRowActions {
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    onView?: (user: User) => void;
    onChangePassword?: (user: User) => void;
    onToggleBan?: (user: User, isBanned: boolean) => void;
}

export function userActionsCell(actions: UserRowActions) {
    return function UserActionsComponent({ row }: CellContext<User, unknown>) {
        const user = row.original;

        return (
            <TableCell className="text-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        {actions.onView && (
                            <DropdownMenuItem onClick={() => actions.onView!(user)}>
                                <EyeIcon className="me-2 h-4 w-4 text-primary" />
                                <span>عرض الملف</span>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => actions.onEdit(user)}>
                            <PencilIcon className="me-2 h-4 w-4" />
                            <span>تعديل</span>
                        </DropdownMenuItem>

                        {actions.onChangePassword && (
                            <DropdownMenuItem onClick={() => actions.onChangePassword!(user)}>
                                <KeyRoundIcon className="me-2 h-4 w-4" />
                                <span>تغيير كلمة المرور</span>
                            </DropdownMenuItem>
                        )}

                        {actions.onToggleBan && (
                            <DropdownMenuItem
                                onClick={() => actions.onToggleBan!(user, !user.is_banned)}
                                className={user.is_banned ? 'text-emerald-600' : 'text-amber-600'}
                            >
                                {user.is_banned ? (
                                    <>
                                        <CheckCircleIcon className="me-2 h-4 w-4" />
                                        <span>إلغاء الحظر</span>
                                    </>
                                ) : (
                                    <>
                                        <BanIcon className="me-2 h-4 w-4" />
                                        <span>حظر المستخدم</span>
                                    </>
                                )}
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={() => actions.onDelete(user)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2Icon className="me-2 h-4 w-4" />
                            <span>حذف</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        );
    };
}
```

---

## 6. الخطوة 5: الهوكات الأربعة للجدول (The 4 Hooks)

### 1) هوك العمليات (`use[Module]Actions.ts`)
```typescript
// hooks/users/useUserActions.ts
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { confirmAlertDialog } from '@/components/custom/ConfirmDialog';
import { getAxiosErrorMessage } from '@/hooks/httpErrors';
import { useResourceActions } from '@/features/table/hooks/useResourceActions';
import { destroy, update } from '@/routes/admin/users';
import { toggleUserBan } from '../../services/user_actions.service';
import type { User } from '../../types/user';

export function useUserActions({ tableId, tableData }: { tableId: string; tableData: User[] }) {
    const { t: tMain } = useTranslation('main');
    const { t } = useTranslation('users');

    const [passwordTarget, setPasswordTarget] = useState<User | null>(null);

    // الهوك الموحد لعمليات الصف (الحذف والتعديل والإضافة)
    const resource = useResourceActions({
        tableId,
        tableData,
        resourceName: t('User'),
        getId: (x) => x.id,
        getName: (x) => x.name,
        destroyRoute: destroy,
        updateRoute: update,
        extractUpdated: (res) => res.data?.data ?? res.data?.user ?? null,
    });

    // إجراء مخصص لتبديل الحظر مع التوست وتحديث الصف في الجدول
    const handleToggleBan = async (user: User, nextBanned: boolean): Promise<boolean> => {
        const toastId = toast.loading(tMain('updating', { resource: t('User'), name: user.name }));

        try {
            const updated = await toggleUserBan(user.id, nextBanned);
            resource.rows.update(updated);
            toast.success(tMain('updated', { resource: t('User'), name: user.name }), { id: toastId });
            return true;
        } catch (error) {
            toast.error(getAxiosErrorMessage(error), { id: toastId });
            return false;
        }
    };

    return {
        ...resource,
        handleToggleBan,
        passwordTarget,
        setPasswordTarget,
    };
}
```

### 2) هوك الأعمدة (`use[Module]Columns.tsx`)
```tsx
// hooks/users/useUserColumns.tsx
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { centeredTextCell, dateCell, textCell } from '@/components/table';
import type { ExtendedColumnDef } from '@/types/table';
import type { User } from '../../types/user';
import { userBanSwitchCell } from '../../cells/userBanSwitchCell';
import { userActionsCell } from '../../cells/userActionsCell';

export function useUserColumns({
    editRow,
    deleteRow,
    handleToggleBan,
    setPasswordTarget,
}: {
    editRow: (user: User) => void;
    deleteRow: (user: User) => Promise<void>;
    handleToggleBan: (user: User, nextBanned: boolean) => Promise<boolean>;
    setPasswordTarget: (user: User | null) => void;
}) {
    const { t } = useTranslation('users');

    return useMemo((): ExtendedColumnDef<User>[] => [
        {
            accessorKey: 'id',
            header: () => 'ID',
            nonHideable: true,
            cell: centeredTextCell,
        },
        {
            accessorKey: 'name',
            header: () => t('Name'),
            cell: textCell,
        },
        {
            accessorKey: 'phone',
            header: () => t('Phone'),
            cell: textCell,
        },
        {
            accessorKey: 'role',
            header: () => t('Role'),
            cell: centeredTextCell,
        },
        {
            accessorKey: 'is_banned',
            header: () => t('Ban Status'),
            cell: userBanSwitchCell(handleToggleBan),
        },
        {
            accessorKey: 'created_at',
            header: () => t('Created At'),
            cell: dateCell(),
        },
        {
            accessorKey: 'actions',
            header: () => t('Actions'),
            nonHideable: true,
            enableSorting: false,
            cell: userActionsCell({
                onEdit: editRow,
                onDelete: deleteRow,
                onChangePassword: (user) => setPasswordTarget(user),
            }),
        },
    ], [deleteRow, editRow, handleToggleBan, setPasswordTarget, t]);
}
```

### 3) هوك السيرفر والتصفح (`use[Module]ServerSync.ts`)
يدير إرسال واستقبال بيانات التصفح، الفرز، البحث الفوري (Debounced)، وتزامن الـ Query Parameters:

```typescript
// hooks/users/useUserServerSync.ts
import { FilterConfig, useServerSync } from '@/features/table/hooks/useServerSync';
import { index } from '@/routes/admin/users';
import type { SortingState } from '@tanstack/react-table';

type RoleFilterValue = 'all' | 'admin' | 'merchant' | 'courier' | 'customer';

// تعريف فلتر الدور
const ROLE_FILTER: FilterConfig<'role'> = {
    key: 'role',
    param: 'role',
    emptyValue: 'all',
    allowedValues: ['admin', 'merchant', 'courier', 'customer'],
};

const FILTERS = [ROLE_FILTER];

export function useUserServerSync({
    tableId,
    search,
    sorting,
    pageSize,
}: {
    tableId: string;
    search: string;
    sorting: SortingState;
    pageSize: number;
}) {
    const sync = useServerSync({
        tableId,
        search,
        sorting,
        pageSize,
        getIndexUrl: () => index().url,
        only: ['users'], // مهم جداً: اسم الخاصية المرجعة من Inertia للـ Partial Reload
        filters: FILTERS,
    });

    return {
        roleFilter: sync.filterValues.role as RoleFilterValue,
        filterByRole: (next: RoleFilterValue) => sync.setFilter('role', next),
        syncStatusFromUrl: sync.syncFiltersFromUrl,
        onSortingChange: sync.onSortingChange,
        searchData: sync.searchData,
        changePage: sync.changePage,
        changePageSize: sync.changePageSize,
    };
}
```

### 4) هوك التجميع (`useTable[Module].tsx`)
```typescript
// hooks/users/useTableUser.tsx
import { useTableResources } from '@/features/table/hooks/useTableResource';
import { useUserActions } from './useUserActions';
import { useUserColumns } from './useUserColumns';
import { useUserServerSync } from './useUserServerSync';
import type { User } from '../../types/user';

export function useTableUser({ users }: { users: Pagination<User> }) {
    return useTableResources<User>({
        resources: users,
        tableId: 'users', // المعرف الفريد لحالة الجدول في Redux
        useActions: useUserActions,
        useColumns: useUserColumns,
        useServerSync: useUserServerSync,
    });
}
```

---

## 7. الخطوة 6: فورم الإضافة والتعديل (Drawer Form & Hook)

### هوك الفورم (`useUserForm.ts`)
```typescript
// hooks/forms/useUserForm.ts
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getAxiosErrorMessage, normalizeValidationErrors } from '@/hooks/httpErrors';
import { saveUser, type UserPayload } from '../../services/user.service';
import type { User } from '../../types/user';
import { UserRole } from '../../enums/user_status';

export function useUserForm({
    item,
    onSaved,
    onClose,
    t,
    tMain,
}: {
    item: User | null;
    onSaved?: (user: User) => void;
    onClose: () => void;
    t: (key: string) => string;
    tMain: (key: string) => string;
}) {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [role, setRole] = useState<UserRole>(UserRole.Customer);
    const [isActive, setIsActive] = useState(true);

    // مزامنة حالة الحقول مع السجل عند الفتح
    useEffect(() => {
        if (item) {
            setRole((item.role as UserRole) || UserRole.Customer);
            setIsActive(Boolean(item.is_active));
        } else {
            setRole(UserRole.Customer);
            setIsActive(true);
        }
        setErrors({});
    }, [item]);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (processing) return;

        setProcessing(true);
        setErrors({});

        const form = new FormData(e.currentTarget);
        const payload: UserPayload = {
            name: String(form.get('name') ?? '').trim(),
            email: String(form.get('email') ?? '').trim(),
            phone: String(form.get('phone') ?? '').trim(),
            role,
            is_active: isActive,
            password: form.get('password') ? String(form.get('password')) : undefined,
        };

        const toastId = toast.loading(
            tMain(item ? 'updating' : 'creating', {
                resource: t('User'),
                name: item?.name || '',
            }),
        );

        try {
            const saved = await saveUser(item, payload);
            toast.success(
                tMain(item ? 'updated' : 'created', {
                    resource: t('User'),
                    name: saved.name,
                }),
                { id: toastId },
            );
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

    const resetAndClose = () => {
        setErrors({});
        onClose();
    };

    return {
        submit,
        processing,
        errors,
        role,
        setRole,
        isActive,
        setIsActive,
        resetAndClose,
    };
}
```

### مكون الـ Drawer (`UserDrawerForm.tsx`)
```tsx
// components/UserDrawerForm.tsx
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { LoaderCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDirection } from '@/components/ui/direction';
import { useUserForm } from '../hooks/forms/useUserForm';
import { getAllUserRoles, UserRole } from '../enums/user_status';
import type { User } from '../types/user';

export default function UserDrawerForm({
    open,
    item,
    onOpenChange,
    onSaved,
}: {
    open: boolean;
    item: User | null;
    onOpenChange: (open: boolean) => void;
    onSaved?: (saved: User) => void;
}) {
    const { t } = useTranslation('users');
    const { t: tMain } = useTranslation('main');
    const dir = useDirection();

    const {
        submit,
        processing,
        errors,
        role,
        setRole,
        isActive,
        setIsActive,
        resetAndClose,
    } = useUserForm({
        item,
        onSaved,
        onClose: () => onOpenChange(false),
        t,
        tMain,
    });

    const title = item ? t('Edit User') : t('Add New User');

    return (
        <Drawer direction={dir === 'rtl' ? 'left' : 'right'} open={open} onOpenChange={onOpenChange}>
            <DrawerContent dir="ltr" className="sm:max-w-xl">
                <div dir={dir} className="flex h-full flex-col">
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription>{title}</DrawerDescription>
                    </DrawerHeader>

                    <form className="flex h-[90%] flex-col" onSubmit={submit}>
                        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                            
                            <div className="grid gap-2">
                                <Label htmlFor="user-name" className="required-label">{t('Name')}</Label>
                                <Input id="user-name" name="name" defaultValue={item?.name ?? ''} required />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="user-email" className="required-label">{t('Email')}</Label>
                                <Input id="user-email" name="email" type="email" defaultValue={item?.email ?? ''} required />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="user-phone" className="required-label">{t('Phone')}</Label>
                                <Input id="user-phone" name="phone" defaultValue={item?.phone ?? ''} required dir="ltr" />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label className="required-label">{t('Role')}</Label>
                                <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('Select Role')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAllUserRoles().map((r) => (
                                            <SelectItem key={r} value={r}>
                                                {r}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>

                            {!item && (
                                <div className="grid gap-2">
                                    <Label htmlFor="user-password" className="required-label">{t('Password')}</Label>
                                    <Input id="user-password" name="password" type="password" required />
                                    <InputError message={errors.password} />
                                </div>
                            )}

                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <Label htmlFor="user-active-toggle" className="cursor-pointer">
                                    {t('Account Active')}
                                </Label>
                                <Switch
                                    id="user-active-toggle"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>
                        </div>

                        <DrawerFooter>
                            <Button type="submit" disabled={processing} className="gap-2">
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

---

---

## 8. الخطوة 7: أنماط العرض المتعددة (`TableViewOption`) ومجلد `views/`

عندما يحتاج الموديول إلى دعم طرق عرض بديلة (مثل: عرض شبكة كروت `Cards`، أو عرض قائمة رأسية `List`)، **يُحظر كتابة هذه المكونات مدمجة داخل ملف `SectionList[Module].tsx`**. بدلاً من ذلك، يتم إنشاؤها داخل مجلد منفصل:
`Modules/[ModuleName]/resources/assets/admin/components/[resource]/views/`

### 1) مكون الحالة الفارغة (`views/[Model]EmptyState.tsx`)
```tsx
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function UserEmptyState({ onCreate }: { onCreate?: () => void }) {
    const { t } = useTranslation('users');

    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-xl font-semibold text-muted-foreground">{t('No users found')}</div>
            <div className="mt-2 text-sm text-muted-foreground">{t('Try adjusting filters or create a new user.')}</div>
            {onCreate ? (
                <div className="mt-4">
                    <Button onClick={onCreate} variant="default">
                        {t('Create User')}
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
```

### 2) مكون عرض القائمة (`views/[Model]ListView.tsx`)
```tsx
import type { JSX } from 'react';
import { useTableContext } from '@/context/TableContext';
import { selectTableData, tableActions } from '@/features/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { User } from '../../../types/user';
import UserEmptyState from './UserEmptyState';

export default function UserListView(): JSX.Element {
    const { tableId = 'users', onCreate } = useTableContext();
    const dispatch = useAppDispatch();
    const users = useAppSelector((state) => selectTableData(state, tableId) as User[]);

    if (users.length === 0) {
        return <UserEmptyState onCreate={onCreate} />;
    }

    return (
        <div className="flex flex-col gap-2">
            {users.map((user) => (
                <div
                    key={user.id}
                    className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm hover:bg-accent/25"
                    onClick={() => dispatch(tableActions.setSelectedRow({ tableId, row: user }))}
                >
                    <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <span className="text-xs font-semibold text-primary">{user.role}</span>
                </div>
            ))}
        </div>
    );
}
```

### 3) مكون عرض الكروت (`views/[Model]CardsView.tsx`)
```tsx
import type { JSX } from 'react';
import { useTableContext } from '@/context/TableContext';
import { selectTableData } from '@/features/table';
import { useAppSelector } from '@/store/hooks';
import type { User } from '../../../types/user';
import UserCard from '../UserCard';
import UserEmptyState from './UserEmptyState';

export default function UserCardsView(): JSX.Element {
    const { tableId = 'users', onCreate } = useTableContext();
    const users = useAppSelector((state) => selectTableData(state, tableId) as User[]);

    if (users.length === 0) {
        return <UserEmptyState onCreate={onCreate} />;
    }

    return (
        <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3 @5xl:grid-cols-4">
            {users.map((user) => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    );
}
```

### 4) هوك تجميع أنماط العرض (`views/useUserViews.tsx`)
```tsx
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List, Table2 } from 'lucide-react';
import type { TableViewOption } from '@/components/table/SectionListGeneric';
import UserCardsView from './UserCardsView';
import UserListView from './UserListView';

export function useUserViews(): TableViewOption[] {
    const { t } = useTranslation('users');

    return useMemo(
        () => [
            {
                value: 'table',
                label: t('view_table'),
                icon: <Table2 size={16} />,
            },
            {
                value: 'list',
                label: t('view_list'),
                icon: <List size={16} />,
                render: () => <UserListView />,
            },
            {
                value: 'cards',
                label: t('view_cards'),
                icon: <LayoutGrid size={16} />,
                render: () => <UserCardsView />,
            },
        ],
        [t],
    );
}

export default useUserViews;
```

### 5) ملف التجميع (`views/index.ts`)
```typescript
export { default as UserEmptyState } from './UserEmptyState';
export { default as UserListView } from './UserListView';
export { default as UserCardsView } from './UserCardsView';
export { useUserViews } from './useUserViews';
```

---

## 9. الخطوة 8: المكون الرئيسي المجمع (`SectionList[Module].tsx`)

يقوم هذا المكون بدمج الجدول والفلاتر وزر الإضافة وأنماط العرض المتعددة في واجهة واحدة نظيفة ورفيعة للغاية:

```tsx
// components/SectionListUsers.tsx
import { useMemo, type JSX } from 'react';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import SectionListGeneric from '@/components/table/SectionListGeneric';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTableUser } from '../hooks/users/useTableUser';
import { getUserColumnLabels } from '../lables/getUserColumnLabels';
import { useUserViews } from './views';
import UserDrawerForm from './UserDrawerForm';
import type { User } from '../types/user';

export default function SectionListUsers(): JSX.Element {
    const users = usePage().props.users as Pagination<User>;
    const { t } = useTranslation('users');
    const { t: tMain } = useTranslation('main');

    const {
        deleteRow,
        isFormOpen,
        formItem,
        closeForm,
        onCreate,
        addRow,
        updateRow,
        roleFilter,
        filterByRole,
        tableId,
        ...hookProps
    } = useTableUser({ users });

    const columnLabels = useMemo(() => getUserColumnLabels(t), [t]);
    const views = useUserViews(); // 👈 استدعاء هوك العروض المفصولة

    return (
        <>
            <SectionListGeneric
                tableId={tableId}
                initHook={{
                    ...hookProps,
                    deleteRow,
                    views,
                    onCreate, // يظهر زر الإضافة في التولبار إذا كان معرّفاً

                    // فلاتر إضافية في شريط الأدوات
                    filterActions: (
                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={roleFilter}
                                onValueChange={(val) => filterByRole(val as any)}
                            >
                                <SelectTrigger className="w-36" aria-label={t('Role')}>
                                    <SelectValue placeholder={t('Role')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{tMain('All Roles')}</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="merchant">Merchant</SelectItem>
                                    <SelectItem value="courier">Courier</SelectItem>
                                    <SelectItem value="customer">Customer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ),
                }}
                columnLabels={columnLabels}
            />

            {/* فورم الإضافة والتعديل */}
            <UserDrawerForm
                open={isFormOpen}
                item={formItem}
                onOpenChange={(open) => {
                    if (!open) closeForm();
                }}
                onSaved={(saved: User) => {
                    if (formItem) {
                        updateRow(saved);
                    } else {
                        addRow(saved);
                    }
                }}
            />
        </>
    );
}
```

---

## 10. الخطوة 9: إخفاء وتخصيص زر الإضافة (`hasCreate` / `showCreate`)

في الجداول المخصصة للقراءة فقط (مثل سجلات التدقيق أو التقارير أو العمليات المالية):

### الخيار 1: عبر الهوك (`useTableResources`):
```typescript
export function useTableAuditLogs({ logs }: { logs: Pagination<AuditLog> }) {
    return useTableResources<AuditLog>({
        resources: logs,
        tableId: 'audit-logs',
        useActions: useAuditLogActions,
        useColumns: useAuditLogColumns,
        useServerSync: useAuditLogServerSync,
        hasCreate: false, // 👈 تعطيل الإضافة وإخفاء الزر تلقائياً
    });
}
```

### الخيار 2: عبر المكون (`SectionListGeneric`):
```tsx
<SectionListGeneric
    tableId="audit-logs"
    initHook={tableHook}
    showCreate={false} // 👈 إخفاء زر الإضافة بشكل قاطع
/>
```

---

## 11. الخطوة 10: صفحة الدخول في Inertia (`pages/[page].tsx`)

```tsx
// pages/users.tsx
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import SectionListUsers from '../components/SectionListUsers';

export default function Users() {
    const { t } = useTranslation('users');

    return (
        <>
            <Head title={t('Users Management')} />
            <div className="relative">
                <div className="absolute z-0 h-32 w-full rounded-b-md bg-primary p-4 md:p-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-background">
                        {t('Users Management')}
                    </h2>
                </div>
                <div className="@container/main relative z-10 mt-16 flex flex-col gap-4 p-4 md:gap-6 md:p-6">
                    <SectionListUsers />
                </div>
            </div>
        </>
    );
}

Users.layout = {
    breadcrumbs: [
        { title: 'Users', href: '#', namespace: 'users' },
    ],
};
```

---

## 12. ملخص أهم القواعد والحلول للأخطاء الشائعة

| المسألة / الخطأ الشائع | الحل الصحيح |
|---|---|
| **فصل أنماط العرض (Views)** | ضع واجهات `CardsView` و `ListView` و `EmptyState` داخل مجلد `views/` ليبقى `SectionList` رفيعاً ونظيفاً. |
| **الجداول للقراءة فقط** | مرّر `hasCreate: false` في الهوك أو `showCreate={false}` في المكون لإخفاء زر الإضافة تماماً. |
| **تحديث السطر بعد التعديل أو الإضافة** | استخدم `updateRow(saved)` للتعديل و `addRow(saved)` للإضافة لتحديث Redux دون إعادة تحميل كامل الصفحة. |
| **استجابة لارافيل مع `JsonResource`** | استخرج النتيجة من `response.data?.data` لأن Resource يغلف الاستجابة بـ `data`. |
| **تصفح البيانات الكبيرة** | يتم التصفح يدويًا بواسطة السيرفر عبر `useServerSync` مع تمرير `only: ['resourceName']` لتسريع التجاوب. |
| **أزرار فرعية داخل الفورم ترسل الـ Submit بالخطأ** | دائمًا أضف `type="button"` لأي زر داخل `<form>` ليس هو زر الحفظ الأساسي. |
| **دعم RTL و LTR للـ Drawer** | استخدم `useDirection()` واجعل `direction={dir === 'rtl' ? 'left' : 'right'}` و `DrawerContent dir="ltr"` مع الحاوية `dir={dir}`. |
| **تصفير حقول النموذج عند الفتح** | ضع `useEffect` داخل هوك الفورم يراقب `[item]` ويضبط القيم أو يصفرها عند الإنشاء الجديد. |

