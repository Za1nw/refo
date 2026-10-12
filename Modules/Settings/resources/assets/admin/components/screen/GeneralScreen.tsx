import React from 'react';
import { usePage } from '@inertiajs/react';
import {
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AdminEmailsInput from '../ui/AdminEmailsInput';
import {
    CONTACT_SETTING_FIELDS,
    SOCIAL_SETTING_FIELDS,
    SETTINGS_FIELDS,
} from '../../settings-form';
import {
    SlidersHorizontal,
    Phone,
    Share2,
    MailCheck,
    CheckCircle2,
} from 'lucide-react';

interface GeneralScreenProps {
    errors: Record<string, string>;
    wasSuccessful: boolean;
}

// أيقونات منصات التواصل
const WhatsAppIcon = ({ className = 'size-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.417 0-8.009 3.592-8.008 8.01.001 1.488.414 2.899 1.157 4.135l-1.188 4.34 4.469-1.172c1.196.691 2.56 1.059 3.963 1.06h.004c4.417 0 8.009-3.593 8.008-8.013-.001-4.417-3.593-8.008-8.005-8.008z" />
    </svg>
);

const TelegramIcon = ({ className = 'size-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.75 3.99-1.74 6.66-2.88 7.99-3.44 3.8-1.58 4.59-1.86 5.11-1.87.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.26z" />
    </svg>
);

const TwitterXIcon = ({ className = 'size-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const FacebookIcon = ({ className = 'size-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const InstagramIcon = ({ className = 'size-4' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);

export default function GeneralScreen({ errors, wasSuccessful }: GeneralScreenProps) {
    const pageProps = usePage<{ settings?: Record<string, string> }>().props;
    const settings = pageProps.settings ?? {};

    // استخراج الإيميلات المحفوظة مسبقاً
    const initialAdminEmails: string[] = React.useMemo(() => {
        const raw = settings['admin_notification_emails'];
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return typeof raw === 'string' ? raw.split(',').map((e) => e.trim()).filter(Boolean) : [];
        }
    }, [settings]);

    return (
        <>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <SlidersHorizontal className="size-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">
                            الإعدادات العامة
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            إدارة أرقام التواصل وروابط منصات التواصل الاجتماعي والبريد الإلكتروني المعتمد لإشعارات الإدارة.
                        </CardDescription>
                    </div>
                </div>

                {wasSuccessful && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20 animate-in fade-in">
                        <CheckCircle2 className="size-4" />
                        <span>تم حفظ الإعدادات بنجاح</span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="p-6 space-y-8">
                {/* 1. قسم أرقام التواصل المباشر */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                        <Phone className="size-4 text-primary" />
                        <h4 className="text-sm font-bold text-foreground">
                            أرقام التواصل المباشر
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {CONTACT_SETTING_FIELDS.map((field) => (
                            <div key={field.key} className="space-y-2">
                                <Label htmlFor={field.key} className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                    {field.key === 'whatsapp_number' ? (
                                        <WhatsAppIcon className="size-4 text-emerald-500" />
                                    ) : (
                                        <Phone className="size-4 text-primary" />
                                    )}
                                    <span>{field.label}</span>
                                </Label>
                                <Input
                                    id={field.key}
                                    name={`settings[${field.index}][value]`}
                                    type={field.inputType ?? 'text'}
                                    defaultValue={settings[field.key] ?? ''}
                                    placeholder={field.placeholder}
                                    dir="ltr"
                                    className="text-start font-mono"
                                />
                                {field.helpText && (
                                    <p className="text-[11px] text-muted-foreground">{field.helpText}</p>
                                )}
                                <input
                                    type="hidden"
                                    name={`settings[${field.index}][key]`}
                                    value={field.key}
                                />
                                <input
                                    type="hidden"
                                    name={`settings[${field.index}][type]`}
                                    value={field.type}
                                />
                                <InputError message={errors?.[`settings.${field.index}.value`]} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. قسم روابط منصات التواصل الاجتماعي */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                        <Share2 className="size-4 text-sky-500" />
                        <h4 className="text-sm font-bold text-foreground">
                            روابط منصات التواصل الاجتماعي
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {SOCIAL_SETTING_FIELDS.map((field) => {
                            const renderSocialIcon = () => {
                                switch (field.key) {
                                    case 'whatsapp_link':
                                        return <WhatsAppIcon className="size-4 text-emerald-500" />;
                                    case 'telegram_link':
                                        return <TelegramIcon className="size-4 text-sky-500" />;
                                    case 'twitter_link':
                                        return <TwitterXIcon className="size-4 text-foreground" />;
                                    case 'facebook_link':
                                        return <FacebookIcon className="size-4 text-blue-600" />;
                                    case 'instagram_link':
                                        return <InstagramIcon className="size-4 text-pink-600" />;
                                    default:
                                        return <Share2 className="size-4 text-primary" />;
                                }
                            };

                            return (
                                <div key={field.key} className="space-y-2">
                                    <Label htmlFor={field.key} className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        {renderSocialIcon()}
                                        <span>{field.label}</span>
                                    </Label>
                                    <Input
                                        id={field.key}
                                        name={`settings[${field.index}][value]`}
                                        type="url"
                                        defaultValue={settings[field.key] ?? ''}
                                        placeholder={field.placeholder}
                                        dir="ltr"
                                        className="text-start font-mono text-xs"
                                    />
                                    <input
                                        type="hidden"
                                        name={`settings[${field.index}][key]`}
                                        value={field.key}
                                    />
                                    <input
                                        type="hidden"
                                        name={`settings[${field.index}][type]`}
                                        value={field.type}
                                    />
                                    <InputError message={errors?.[`settings.${field.index}.value`]} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. قسم بريد إشعارات الإدارة المتعدد */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                        <MailCheck className="size-4 text-primary" />
                        <div>
                            <h4 className="text-sm font-bold text-foreground">
                                البريد الإلكتروني لإشعارات الإدارة (تنبيهات الطلبات)
                            </h4>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                        أدخل عناوين البريد الإلكتروني للمشرفين المسؤولين عن متابعة الطلبات. سيتم إرسال إشعار فوري وتفاصيل أي طلب منحة أو خدمة تعليمية جديدة مباشرة إلى كافة هذه العناوين.
                    </p>

                    <AdminEmailsInput
                        name={`settings[${SETTINGS_FIELDS.adminNotificationEmails.index}][value]`}
                        initialEmails={initialAdminEmails}
                        error={errors?.[`settings.${SETTINGS_FIELDS.adminNotificationEmails.index}.value`]}
                    />

                    <input
                        type="hidden"
                        name={`settings[${SETTINGS_FIELDS.adminNotificationEmails.index}][key]`}
                        value={SETTINGS_FIELDS.adminNotificationEmails.key}
                    />
                    <input
                        type="hidden"
                        name={`settings[${SETTINGS_FIELDS.adminNotificationEmails.index}][type]`}
                        value={SETTINGS_FIELDS.adminNotificationEmails.type}
                    />
                </div>
            </CardContent>
        </>
    );
}
