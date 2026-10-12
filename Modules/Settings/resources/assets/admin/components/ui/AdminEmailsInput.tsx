import * as React from 'react';
import { Mail, Plus, X, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminEmailsInputProps {
    name?: string;
    initialEmails?: string[];
    onChange?: (emails: string[]) => void;
    error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminEmailsInput({
    name,
    initialEmails = [],
    onChange,
    error: externalError,
}: AdminEmailsInputProps) {
    const [emails, setEmails] = React.useState<string[]>(() => {
        if (!initialEmails || !Array.isArray(initialEmails)) {
            return [];
        }
        return initialEmails.filter((e) => typeof e === 'string' && e.trim().length > 0);
    });

    const [currentInput, setCurrentInput] = React.useState<string>('');
    const [localError, setLocalError] = React.useState<string | null>(null);

    React.useEffect(() => {
        onChange?.(emails);
    }, [emails, onChange]);

    const addEmail = (rawEmail: string) => {
        const trimmed = rawEmail.trim().toLowerCase();
        setLocalError(null);

        if (!trimmed) {
            return;
        }

        if (!EMAIL_REGEX.test(trimmed)) {
            setLocalError('يرجى إدخال بريد إلكتروني صالح (مثال: admin@fursaty.com)');
            return;
        }

        if (emails.includes(trimmed)) {
            setLocalError('هذا البريد الإلكتروني مضاف بالفعل');
            return;
        }

        setEmails((prev) => [...prev, trimmed]);
        setCurrentInput('');
    };

    const removeEmail = (emailToRemove: string) => {
        setEmails((prev) => prev.filter((e) => e !== emailToRemove));
        setLocalError(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEmail(currentInput);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        const extracted = text
            .split(/[,،\s\n\t]+/)
            .map((e) => e.trim().toLowerCase())
            .filter((e) => EMAIL_REGEX.test(e));

        if (extracted.length > 0) {
            setEmails((prev) => {
                const set = new Set([...prev, ...extracted]);
                return Array.from(set);
            });
            setCurrentInput('');
            setLocalError(null);
        } else {
            setLocalError('لم يتم العثور على عناوين بريد إلكتروني صالحة في النص المنسوخ');
        }
    };

    // القيمة المخزنة في الحقل الخفي لتسليمها مع الـ Form
    const serializedValue = JSON.stringify(emails);

    return (
        <div className="space-y-3">
            {/* حقل الإدخال وزر الإضافة */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Mail className="absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type="email"
                        value={currentInput}
                        onChange={(e) => {
                            setCurrentInput(e.target.value);
                            setLocalError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder="أدخل بريد المشرف (مثال: admin@fursaty.com) واضغط Enter"
                        className="ps-9"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => addEmail(currentInput)}
                    className="gap-1.5 shrink-0"
                >
                    <Plus className="size-4" />
                    <span>إضافة بريد</span>
                </Button>
            </div>

            {/* رسائل الخطأ */}
            {(localError || externalError) && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{localError || externalError}</span>
                </div>
            )}

            {/* قائمة الإيميلات المضافة */}
            {emails.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    {emails.map((email) => (
                        <Badge
                            key={email}
                            variant="secondary"
                            className="px-3 py-1.5 text-xs font-mono flex items-center gap-2 rounded-xl bg-primary/10 text-foreground border border-primary/20 hover:bg-primary/15 transition-colors"
                        >
                            <span>{email}</span>
                            <button
                                type="button"
                                onClick={() => removeEmail(email)}
                                className="text-muted-foreground hover:text-destructive transition-colors rounded-full p-0.5"
                                title="حذف هذا البريد"
                            >
                                <X className="size-3.5" />
                                <span className="sr-only">حذف</span>
                            </button>
                        </Badge>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">
                    لم تتم إضافة أي بريد إلكتروني مخصص بعد. في حال عدم إضافة أي بريد، سيتم إرسال التنبيهات تلقائياً لكافة حسابات المشرفين المسجلين في النظام.
                </p>
            )}

            {/* الحقل الخفي لتمرير القيمة كـ JSON */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={serializedValue}
                />
            )}
        </div>
    );
}
