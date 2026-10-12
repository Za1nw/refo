/**
 * ===========================================================================
 * نقطة التصدير الموحدة لميزات الجداول (Admin Table Feature Module)
 * ===========================================================================
 * يجمع ويصدّر هذا الملف كافة المكونات، الهوكات، الأنواع، المحددات، وإجراءات Redux
 * الخاصة بنظام إدارة الجداول في لوحة التحكم.
 */

// الأنواع والمحددات
export * from './tableSlice.types';
export * from './tableSlice.selectors';

// إجراءات وريدوسر Redux
export { tableActions, default as tableReducer } from './tableSlice';
export { default } from './tableSlice';

// الهوكات الأساسية
export * from './hooks/useTableResource';
export * from './hooks/useResourceActions';
export * from './hooks/useServerSync';

// أدوات التلاعب بالصفوف
export * from './utils/tableRows';
export * from './utils/rowState';
