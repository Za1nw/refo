import { useState } from "react";

import { Switch } from "@/components/ui/switch";
import { TableCell } from "@/components/ui/table";

export const SwitchCell =
  (onChange: (item: any) => Promise<boolean>) =>
  ({ row, getValue }: any) => {
    const item = row.original;
    const value = Boolean(getValue());
    const [checked, setChecked] = useState<boolean>(value);

    return (
      <TableCell className="text-center">
        <Switch
          checked={checked}
          onCheckedChange={async (nextChecked) => {
            try {
              const result = await onChange({ ...item, is_active: nextChecked });

              if (result !== checked) {
                setChecked(result);
              }
            } catch {
              setChecked(checked);
            }
          }}
        />
      </TableCell>
    );
  };
