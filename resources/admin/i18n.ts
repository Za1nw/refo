import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';


interface SingleLocaleTranslations {
    [namespace: string]: {
        [key: string]: string;
    };
}

export interface Translations {
    [locale: string]: SingleLocaleTranslations;
}

let initializing: Promise<typeof i18n> | null = null;

function getPreferredLocale(locale?: string): string {
    return locale || document.documentElement.lang || 'ar';
}

function isNonEmptyObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && Object.keys(value).length > 0;
}

function normalizeTranslations(translations?: Translations): Translations {
    return isNonEmptyObject(translations) ? translations : {};
}

function getNamespaces(translations: Translations, locale: string): string[] {
    const localeTranslations = translations[locale];

    if (isNonEmptyObject(localeTranslations)) {
        return Object.keys(localeTranslations);
    }

    if (isNonEmptyObject(translations)) {
        const firstLocale = Object.keys(translations)[0];
        const firstLocaleTranslations = firstLocale ? translations[firstLocale] : undefined;
        return isNonEmptyObject(firstLocaleTranslations) ? Object.keys(firstLocaleTranslations) : [];
    }

    return [];
}

function pickAvailableLocale(translations: Translations, preferredLocale: string): string | null {
    if (isNonEmptyObject(translations[preferredLocale])) {
        return preferredLocale;
    }

    const firstLocale = Object.keys(translations)[0];
    return firstLocale || null;
}

/**
 * تهيئة i18next.
 *
 * - إذا كانت الترجمات غير موجودة: يهيّئ i18n بموارد فارغة (بدون كسر التطبيق).
 * - إذا كان i18n مهيّأ مسبقًا: يدمج الترجمات الجديدة فقط.
 */
export function initI18n(translations?: Translations, locale?: string): Promise<typeof i18n> {
    const safeTranslations = normalizeTranslations(translations);
    const preferred = getPreferredLocale(locale);
    const availableLocale = pickAvailableLocale(safeTranslations, preferred);
    const lng = availableLocale ?? preferred;

    if (i18n.isInitialized) {
        const current = i18n.language || preferred;

        return updateTranslations(safeTranslations, current).then(async () => {
            if (availableLocale && availableLocale !== i18n.language) {
                await i18n.changeLanguage(availableLocale);
            }

            return i18n;
        });
    }

    if (initializing) {
        return initializing;
    }

    const namespaces = getNamespaces(safeTranslations, lng);
    const ns = namespaces.length > 0 ? namespaces : ['common'];

    initializing = i18n
        .use(initReactI18next)
        .init({
            resources: safeTranslations,
            lng,
            fallbackLng: lng,
            ns,
            defaultNS: ns[0] || 'common',
            interpolation: {
                escapeValue: false,
            },
            react: {
                useSuspense: false,
            },
            partialBundledLanguages: true,
           initAsync: true,
        })
        .then(() => i18n)
        .finally(() => {
            initializing = null;
        });

    return initializing;
}

// تحديث الترجمات عند تغيير الصفحة (دمج فقط)
export async function updateTranslations(translations?: Translations, locale?: string): Promise<void> {
    const safeTranslations = normalizeTranslations(translations);

    if (!i18n.isInitialized) {
        await initI18n(safeTranslations, locale);
        return;
    }

    if (!isNonEmptyObject(safeTranslations)) {
        return;
    }

    const preferred = locale || i18n.language || getPreferredLocale();
    const lng = pickAvailableLocale(safeTranslations, preferred);

    if (!lng) {
        return;
    }

    const localeTranslations = safeTranslations[lng];

    if (!isNonEmptyObject(localeTranslations)) {
        return;
    }

    let hasUpdates = false;

    Object.entries(localeTranslations).forEach(([namespace, newResources]) => {
        const existingResources = i18n.getResourceBundle(lng, namespace) || {};

        const hasChanges = Object.keys(newResources).some(
            (key) => !existingResources[key] || existingResources[key] !== newResources[key],
        );

        if (!hasChanges) {
            return;
        }

        const mergedResources = { ...existingResources, ...newResources };
        i18n.addResourceBundle(lng, namespace, mergedResources, true, true);
        hasUpdates = true;
    });

    if (hasUpdates) {
        await i18n.reloadResources([lng]);
        // تغيير اللغة (حتى لو نفس القيمة) لضمان إعادة الرسم في react-i18next.
        await i18n.changeLanguage(lng);
    }
}


// Hook للاستخدام في المكونات
export function useI18n() {
    return {
        t: i18n.t,
        i18n,
        isReady: i18n.isInitialized,
        language: i18n.language,
        updateTranslations: (translations: Translations) => updateTranslations(translations),
    };
}


const t = (key: string, namespace?: string) =>
    i18n.t(key, { ns: namespace });

const tMain = (key: string, options?: Record<string, unknown>) => i18n.t(key, { ns: 'main', ...options });
export { i18n, t, tMain };
