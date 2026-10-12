import * as LucideIcons from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

/**
 * تحويل اسم الأيقونة إلى مفتاح صالح للبحث داخل `lucide-react`.
 *
 * يدعم الأسماء بالصيَغ التالية:
 * - PascalCase: مثل `LayoutGrid`, `NewspaperIcon`
 * - kebab-case / snake_case / مع مسافات: مثل `layout-grid`, `layout_grid`, `layout grid`
 */
export function normalizeLucideIconKey(value: string): string {
    const trimmed = value.trim();

    if (trimmed === '') {
        return '';
    }

    // أغلب أيقونات Lucide تكون PascalCase جاهزة.
    if (/^[A-Za-z][A-Za-z0-9]*$/.test(trimmed)) {
        return trimmed;
    }

    // دعم kebab/snake/spaces وتحويلها إلى PascalCase.
    return trimmed
        .split(/[^A-Za-z0-9]+/g)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

/**
 * حل/استخراج (resolve) مكوّن أيقونة من `lucide-react` بناءً على الاسم المخزّن في البيانات.
 *
 * - يرجّع `null` إذا الاسم فارغ أو الأيقونة غير موجودة.
 * - يحاول أيضًا `${Name}Icon` كـfallback.
 *
 * ملاحظة: نستخدم `import * as LucideIcons` لتفادي كتابة map يدوي لكل أيقونة.
 */
export function resolveLucideIcon(icon?: string | null): LucideIcon | null {
    if (!icon) {
        return null;
    }

    const key = normalizeLucideIconKey(icon);

    if (key === '') {
        return null;
    }

    const exports = LucideIcons as Record<string, unknown>;
    const candidate = exports[key] ?? exports[`${key}Icon`];

    // أيقونات Lucide غالبًا React.forwardRef(...) (نوعها object وقت التشغيل).
    return candidate ? (candidate as LucideIcon) : null;
}
