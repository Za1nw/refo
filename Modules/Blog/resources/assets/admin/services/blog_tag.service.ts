import api from '@/lib/axios';
import tags from '@/routes/blog/tags';
import type { BlogTag, BlogTagPayload, BlogTagTranslationPayload } from '../types/tag';

export async function saveTag(item: BlogTag | null, payload: BlogTagPayload): Promise<BlogTag> {
    const route = item ? tags.update(item.id) : tags.store();

    const response = await api.request({
        url: route.url,
        method: route.method,
        data: payload,
    });

    return response.data?.tag ?? response.data?.data ?? response.data;
}

export async function deleteTag(id: number): Promise<void> {
    const route = tags.destroy(id);
    await api.request({
        url: route.url,
        method: route.method,
    });
}

export async function toggleTagStatus(item: BlogTag, isActive: boolean): Promise<BlogTag> {
    const route = tags.update(item.id);
    const response = await api.request({
        url: route.url,
        method: route.method,
        data: {
            name: item.name,
            is_active: isActive,
        },
    });

    return response.data?.tag ?? response.data?.data ?? response.data;
}

export async function getTagTranslation(id: number): Promise<{ locale: string; name: string }> {
    const route = tags.translate(id);
    const response = await api.request({
        url: route.url,
        method: route.method,
    });

    return response.data?.translation ?? { locale: 'en', name: '' };
}

export async function saveTagTranslation(id: number, payload: BlogTagTranslationPayload): Promise<BlogTag> {
    const route = tags.translate.update(id);
    const response = await api.request({
        url: route.url,
        method: route.method,
        data: payload,
    });

    return response.data?.tag ?? response.data?.data ?? response.data;
}
