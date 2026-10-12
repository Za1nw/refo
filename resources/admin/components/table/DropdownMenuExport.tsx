import { FileTextIcon, FileSpreadsheetIcon, PrinterIcon, ChevronDownIcon, ShareIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ExportFormat = "csv" | "pdf" | "print";

interface DropdownMenuExportProps {
  className?: string;
  /**
   * يتم استدعاؤها عند اختيار صيغة تصدير معيّنة.
   * تركنا التنفيذ الفعلي (طلب API، توليد ملف، إلخ) لمن يستخدم المكوّن،
   * لأن طريقة التصدير تختلف من جدول لآخر.
   */
  onExport?: (format: ExportFormat) => void;
  /** تعطيل كل خيارات التصدير (مثلاً أثناء تحميل البيانات) */
  disabled?: boolean;
}

/**
 * ملاحظة منطقية مهمة:
 * كانت عناصر القائمة في النسخة السابقة بدون أي onClick، أي أن الضغط
 * عليها لا يفعل شيئًا فعليًا. أضفنا الآن `onExport` كخاصية اختيارية
 * بحيث يصبح المكوّن "عام" (generic) ويُستخدم من أي جدول، بينما يبقى
 * التنفيذ الفعلي لعملية التصدير في مكان استخدام المكوّن.
 */
export default function DropdownMenuExport({ className, onExport, disabled }: DropdownMenuExportProps) {
  const handleSelect = (format: ExportFormat) => {
    onExport?.(format);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className} disabled={disabled}>
          <ShareIcon />
          Export
          <ChevronDownIcon className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => handleSelect("csv")}>
          <FileSpreadsheetIcon />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSelect("pdf")}>
          <FileTextIcon />
          Export as Pdf
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSelect("print")}>
          <PrinterIcon />
          Export as Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
