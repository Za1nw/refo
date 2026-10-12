import api from '@/lib/axios';
import categories from '@/routes/blog/categories';
import type { BlogCategory, BlogCategoryPayload, BlogCategoryTranslationPayload } from '../types/category';

export async function saveCategory(item: BlogCategory | null, payload: BlogCategoryPayload): Promise<BlogCategory> {
    const route = item ? categories.update(item.id) : categories.store();

    const response = await api.request({
        url: route.url,
        method: route.method,
        data: payload,
    });

    return response.data?.category ?? response.data?.data ?? response.data;
}

export async function deleteCategory(id: number): Promise<void> {
    const route = categories.destroy(id);
    await api.request({
        url: route.url,
        method: route.method,
    });
}

export async function toggleCategoryStatus(item: BlogCategory, isActive: boolean): Promise<BlogCategory> {
    const route = categories.update(item.id);
    const response = await api.request({
        url: route.url,
        method: route.method,
        data: {
            name: item.name,
            description: item.description,
            is_active: isActive,
        },
    });

    return response.data?.category ?? response.data?.data ?? response.data;
}

export async function getCategoryTranslation(id: number): Promise<{ locale: string; name: string; description: string }> {
    const route = categories.translate(id);
    const response = await api.request({
        url: route.url,
        method: route.method,
    });

    return response.data?.translation ?? { locale: 'en', name: '', description: '' };
}

export async function saveCategoryTranslation(id: number, payload: BlogCategoryTranslationPayload): Promise<BlogCategory> {
    const route = categories.translate.update(id);
    const response = await api.request({
        url: route.url,
        method: route.method,
        data: payload,
    });

    return response.data?.category ?? response.data?.data ?? response.data;
}
