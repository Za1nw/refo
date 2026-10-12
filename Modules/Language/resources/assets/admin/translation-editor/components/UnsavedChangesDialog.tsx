import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type UnsavedChangesDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDiscard: () => void;
    onContinueEditing: () => void;
};

export default function UnsavedChangesDialog({ open, onOpenChange, onDiscard, onContinueEditing }: UnsavedChangesDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>هناك تعديلات غير محفوظة</DialogTitle>
                    <DialogDescription>
                        إذا غادرت الآن قد تفقد بعض التغييرات غير المحفوظة. يمكنك الاستمرار في التحرير أو تجاهل التعديلات والمتابعة.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={onContinueEditing} type="button">
                        مواصلة التحرير
                    </Button>
                    <Button variant="destructive" onClick={onDiscard} type="button">
                        تجاهل والمتابعة
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
