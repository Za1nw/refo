import { confirmAlertDialog } from '@/components/custom/ConfirmDialog';
import { toast } from 'sonner';
import { getAxiosErrorMessage } from './httpErrors';

/**
 * Hook عام للحذف لأي جدول (Governorate / Merchant / أي شيء)
 *
 * الفكرة:
 * - تمرر له API function
 * - يطبق confirm + toast + optimistic update
 */
export function useDeleteRow<T extends { id: number; name?: string }>({
    deleteApi,
    setData,
    getResourceName,
    tMain,
}: {
    deleteApi: (id: number) => Promise<any>;
    setData: (updater: (prev: T[]) => T[]) => void;
    getResourceName: () => string;
    tMain: (key: string, params?: any) => string;
}) {

    return async (row: T) => {

        // 1️⃣ تأكيد الحذف
        const ok = await confirmAlertDialog({
            title: tMain('confirm_delete', {
                name: row.name ?? '',
                resource: getResourceName(),
            }),
            description: tMain('confirm_delete_description', {
                name: row.name ?? '',
                resource: getResourceName(),
            }),
        });

        if (!ok) return;

        const toastId = `delete-${row.id}`;

        // 2️⃣ تنفيذ الحذف مع toast
        toast.promise(
            async () => {
                await deleteApi(row.id);
            },
            {
                id: toastId,

                // رسالة تحميل
                loading: tMain('deleting', {
                    name: row.name ?? '',
                    resource: getResourceName(),
                }),

                // نجاح
                success: () => {
                    setData((prev) =>
                        prev.filter((r) => r.id !== row.id)
                    );

                    return tMain('deleted', {
                        name: row.name ?? '',
                        resource: getResourceName(),
                    });
                },

                // خطأ
                error: (err) =>
                    getAxiosErrorMessage(err, {
                        fallback: tMain('Failed to delete. Please try again.'),
                        statusMessages: {
                            403: tMain('You do not have permission to delete.'),
                        },
                    }),
            }
        );
    };
}
