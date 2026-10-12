
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";


export const downloadCell = (onDownload: (item: any) => void) => ({ getValue }: any) => {
    const raw = getValue?.() as string | null | undefined;
    if (raw === null || raw === undefined || raw === "") {
        return <span className="text-muted-foreground">لا يوجد</span>;
    }
    return <Button variant='ghost' size='icon' onClick={() => onDownload(raw)}>
        <Download className="inline-block mr-1" size={16} />
    </Button>;
};