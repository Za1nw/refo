/**
 * نقطة تصدير موحّدة لكل "خلايا" الجدول (Cell Renderers) الجاهزة للاستخدام
 * في تعريف أعمدة tanstack/react-table، بحيث يستوردها أي جدول في المشروع
 * من مسار واحد بدل استيراد كل خلية من ملفها الفرعي.
 */
export { textCell } from "./cells/textCell";
export { centeredTextCell } from "./cells/centeredTextCell";
export { descriptionCell } from "./cells/descriptionCell";
export { booleanBadgeCell } from "./cells/booleanBadgeCell";
export { badgeCell } from "./cells/badgeCell";
export { dateCell } from "./cells/dateCell";
export { currencyCell } from "./cells/currencyCell";
export { listCell } from "./cells/listCell";
export { actionsCell } from "./cells/actionsCell";
export { sarCurrencyCell } from "./cells/sarCurrencyCell";
export { SwitchCell } from "./cells/switchCell";
