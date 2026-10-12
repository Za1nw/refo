import api from '@/lib/axios';
import { destroy, store, update } from '@/routes/blog';
import type { Blog, BlogPayload } from '../types/blog';

export async function deleteBlog(id: number): Promise<void> {
    const route = destroy(id);
    await api.request({
        url: route.url,
        method: route.method,
    });
}

export async function saveBlog(item: Blog | null, payload: FormData | BlogPayload): Promise<Blog> {
    const route = item ? update(item.id) : store();

    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const headers: Record<string, string> = {};

    if (isFormData) {
        if (item) {
            (payload as FormData).append('_method', 'PUT');
        }
        headers['Content-Type'] = 'multipart/form-data';
    }

    const response = await api.request({
        url: route.url,
        method: item && isFormData ? 'post' : route.method,
        data: payload,
        headers,
    });

    return response.data?.data ?? response.data?.blog ?? response.data;
}
