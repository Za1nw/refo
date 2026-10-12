import { BoxIcon, SwatchBookIcon, type LucideIcon } from 'lucide-react';
import GeneralScreen from './components/screen/GeneralScreen';
import CustomizationScreen from './components/screen/CustomizationScreen';

export type SettingFieldType = 'string' | 'number' | 'boolean' | 'color' | 'json';
export type MenuStyleOption = 'sidebar' | 'floating' | 'inset';
export type SettingsScreen = 'general' | 'customization';

export const SCREEN = {
    general: GeneralScreen,
    customization: CustomizationScreen,
};

export type SettingField = {
    key: string;
    type: SettingFieldType;
    index: number;
};

export type MenuItem = {
    title: string;
    icon: LucideIcon;
    href: string;
    screen: SettingsScreen;
    isActive?: boolean;
};

export type GeneralSettingField = SettingField & {
    label: string;
    placeholder?: string;
    inputType?: 'text' | 'email' | 'tel';
    helpText?: string;
};

export const SETTINGS_FIELDS = {
    // Customization screen
    primaryColor: { key: 'primary_color', type: 'color', index: 0 },
    secondaryColor: { key: 'secondary_color', type: 'color', index: 1 },
    menuStyle: { key: 'menuStyle', type: 'string', index: 2 },
    radius: { key: 'radius', type: 'number', index: 3 },

    // General screen: Contact numbers
    whatsappNumber: { key: 'whatsapp_number', type: 'string', index: 0 },
    contactNumber: { key: 'contact_number', type: 'string', index: 1 },

    // General screen: Social media links
    whatsappLink: { key: 'whatsapp_link', type: 'string', index: 2 },
    telegramLink: { key: 'telegram_link', type: 'string', index: 3 },
    twitterLink: { key: 'twitter_link', type: 'string', index: 4 },
    facebookLink: { key: 'facebook_link', type: 'string', index: 5 },
    instagramLink: { key: 'instagram_link', type: 'string', index: 6 },

    // General screen: Admin notification emails
    adminNotificationEmails: { key: 'admin_notification_emails', type: 'json', index: 7 },
} as const satisfies Record<string, SettingField>;

export const CONTACT_SETTING_FIELDS: GeneralSettingField[] = [
    {
        ...SETTINGS_FIELDS.whatsappNumber,
        label: 'رقم الواتساب المعتمد للتواصل والمتابعة',
        placeholder: 'مثال: 967777855956+',
        inputType: 'tel',
        helpText: 'الرقم الذي يتواصل الطلاب معه عبر واتساب ومحادثات الخدمة',
    },
    {
        ...SETTINGS_FIELDS.contactNumber,
        label: 'رقم الهاتف / الاتصال المباشر',
        placeholder: 'مثال: 967771234567+',
        inputType: 'tel',
        helpText: 'رقم هاتف الاتصال الرسمي لإدارة المنصة',
    },
];

export const SOCIAL_SETTING_FIELDS: GeneralSettingField[] = [
    {
        ...SETTINGS_FIELDS.whatsappLink,
        label: 'رابط واتساب (محادثة أو مجموعة أو قناة)',
        placeholder: 'https://wa.me/967... أو https://chat.whatsapp.com/...',
        inputType: 'text',
    },
    {
        ...SETTINGS_FIELDS.telegramLink,
        label: 'رابط قناة أو حساب تيليجرام',
        placeholder: 'https://t.me/...',
        inputType: 'text',
    },
    {
        ...SETTINGS_FIELDS.twitterLink,
        label: 'رابط منصة إكس / تويتر',
        placeholder: 'https://x.com/... أو https://twitter.com/...',
        inputType: 'text',
    },
    {
        ...SETTINGS_FIELDS.facebookLink,
        label: 'رابط صفحة أو حساب فيسبوك',
        placeholder: 'https://facebook.com/...',
        inputType: 'text',
    },
    {
        ...SETTINGS_FIELDS.instagramLink,
        label: 'رابط حساب انستقرام',
        placeholder: 'https://instagram.com/...',
        inputType: 'text',
    },
];

export const COLOR_PRESETS = [
    { primary: '#06b6d4', secondary: '#7c3aed', label: 'سماوي وبنفسجي' },
    { primary: '#ef4444', secondary: '#2563eb', label: 'أحمر وأزرق' },
    { primary: '#f97316', secondary: '#8b5cf6', label: 'برتقالي وبنفسجي' },
    { primary: '#ec4899', secondary: '#10b981', label: 'وردي وأخضر' },
] as const;

export const MENU_STYLE_OPTIONS: { key: MenuStyleOption; label: string }[] = [
    { key: 'sidebar', label: 'شريط جانبي' },
    { key: 'floating', label: 'عائم' },
    { key: 'inset', label: 'داخلي' },
];

export const SETTINGS_MENU_ITEMS: MenuItem[] = [
    {
        title: 'عام',
        icon: BoxIcon,
        href: '#',
        screen: 'general',
    },
    {
        title: 'تخصيص',
        icon: SwatchBookIcon,
        href: '#',
        screen: 'customization',
    },
];

export const DEFAULT_PRIMARY_COLOR = '#ff0000';
export const DEFAULT_SECONDARY_COLOR = '#00ff00';
export const DEFAULT_RADIUS = 0.625;
export const DEFAULT_MENU_STYLE: MenuStyleOption = 'inset';
