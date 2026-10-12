import * as React from "react"
import { createRoot } from "react-dom/client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmAlertDialogOptions = {
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    confirmVariant?: React.ComponentProps<typeof AlertDialogAction>["variant"]
    cancelVariant?: React.ComponentProps<typeof AlertDialogCancel>["variant"]
    size?: React.ComponentProps<typeof AlertDialogContent>["size"]
}

type ConfirmDialogViewProps = {
    title: string
    description: string
    confirmText: string
    cancelText: string
    confirmVariant: NonNullable<ConfirmAlertDialogOptions["confirmVariant"]>
    cancelVariant: NonNullable<ConfirmAlertDialogOptions["cancelVariant"]>
    size: NonNullable<ConfirmAlertDialogOptions["size"]>
    onClose: (result: boolean) => void
}

const ConfirmDialogView: React.FC<ConfirmDialogViewProps> = ({
    title,
    description,
    confirmText,
    cancelText,
    confirmVariant,
    cancelVariant,
    size,
    onClose,
}) => (
    <AlertDialog
        open
        onOpenChange={(open) => {
            if (!open) {
                onClose(false)
            }
        }}
    >
        <AlertDialogContent size={size}>
            <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel variant={cancelVariant} onClick={() => onClose(false)}>
                    {cancelText}
                </AlertDialogCancel>
                <AlertDialogAction variant={confirmVariant} onClick={() => onClose(true)}>
                    {confirmText}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
)

export function confirmAlertDialog({
    title,
    description,
    confirmText,
    cancelText,
    confirmVariant = "destructive",
    cancelVariant = "outline",
    size = "sm",
}: ConfirmAlertDialogOptions): Promise<boolean> {
    const container = document.querySelector<HTMLDivElement>("#confirm-dialog")
    if (!container) return Promise.resolve(false)
    if (container.hasChildNodes()) return Promise.resolve(false)

    return new Promise((resolve) => {
        const root = createRoot(container)
        let resolved = false

        const handleClose = (result: boolean) => {
            if (resolved) {
                return
            }

            resolved = true
            root.unmount()
            container.innerHTML = ""
            resolve(result)
        }

        const resolvedTitle = title?.trim() || "هل أنت متأكد؟"
        const resolvedDescription = description?.trim() || "لا يمكن التراجع عن هذا الإجراء."
        const resolvedCancelVariant = cancelVariant ?? "outline"
        const resolvedConfirmVariant = confirmVariant ?? "destructive"

        root.render(
            <ConfirmDialogView
                title={resolvedTitle}
                description={resolvedDescription}
                cancelText={cancelText || "إلغاء"}
                confirmText={confirmText || "تأكيد"}
                cancelVariant={resolvedCancelVariant}
                confirmVariant={resolvedConfirmVariant}
                size={size}
                onClose={handleClose}
            />,
        )
    })
}


export function ConfirmInDiv() {
    return <div id="confirm-dialog" />
}
