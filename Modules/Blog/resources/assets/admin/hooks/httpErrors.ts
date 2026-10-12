import axios from 'axios';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

export function normalizeValidationErrors(rawErrors: unknown): Record<string, string> {
    if (!isRecord(rawErrors)) {
        return {};
    }

    const next: Record<string, string> = {};

    Object.entries(rawErrors).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            next[key] = String(value[0] ?? '');
            return;
        }

        next[key] = String(value ?? '');
    });

    return next;
}

export function getAxiosErrorMessage(
    error: unknown,
    options?: {
        fallback?: string;
        statusMessages?: Record<number, string>;
    },
): string {
    const fallback = options?.fallback ?? 'Something went wrong.';

    if (!axios.isAxiosError(error)) {
        return fallback;
    }

    const status = error.response?.status;

    if (status && options?.statusMessages?.[status]) {
        return options.statusMessages[status];
    }

    const data = error.response?.data;
    const message = isRecord(data) ? data.message : null;

    if (typeof message === 'string' && message.trim() !== '') {
        return message;
    }

    return fallback;
}
