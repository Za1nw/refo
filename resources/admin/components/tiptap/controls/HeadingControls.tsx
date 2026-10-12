import type { Editor } from "@tiptap/core";
import {
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    Text,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { HeadingValue } from "@/components/tiptap/types";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type HeadingControlsProps = { editor?: Editor | null };

export default function HeadingControls({ editor }: HeadingControlsProps) {
    const [currentHeading, setCurrentHeading] = useState<HeadingValue>("paragraph");

    useEffect(() => {
        if (!editor) return;

        const updateHeading = () => {
            // استخدم isActive لاكتشاف نوع العنوان الحالي
            const activeLevel =
                ([1, 2, 3, 4, 5, 6] as const).find((lvl) =>
                    editor.isActive("heading", { level: lvl })
                ) ?? null;

            setCurrentHeading(
                activeLevel ? (`h${activeLevel}` as HeadingValue) : "paragraph"
            );
        };

        editor.on?.("selectionUpdate", updateHeading);
        // تحديث الحالة مباشرة عند التركيب لأول مرة
        updateHeading();

        return () => {
            editor.off?.("selectionUpdate", updateHeading);
        };
    }, [editor]);

    const handleHeadingChange = (value: HeadingValue) => {
        if (!editor) return;

        const { from, to } = editor.state.selection;
        const start = editor.view.state.doc.resolve(from).start();
        const end = editor.view.state.doc.resolve(to).end();

        if (value === "paragraph") {
            editor
                .chain()
                .focus()
                .setTextSelection({ from: start, to: end })
                .setParagraph()
                .run();
        } else {
            const level = parseInt(value.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6;
            editor
                .chain()
                .focus()
                .setTextSelection({ from: start, to: end })
                .toggleHeading({ level })
                .run();
        }
    };

    // تكييف onValueChange (Select يستدعي string)
    const onSelectChange = (value: string) => {
        handleHeadingChange(value as HeadingValue);
    };

    return (
        <Select
            value={currentHeading === "paragraph" ? undefined : currentHeading}
            onValueChange={onSelectChange}
        >
            <SelectTrigger className="w-auto min-h-10.5 bg-background!">
                <SelectValue placeholder="Heading" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="paragraph">
                        <Text className="w-4 h-4" />
                    </SelectItem>
                    <SelectItem value="h1">
                        <Heading1 className="w-4 h-4" />
                    </SelectItem>
                    <SelectItem value="h2">
                        <Heading2 className="w-4 h-4" />
                    </SelectItem>
                    <SelectItem value="h3">
                        <Heading3 className="w-4 h-4" />
                    </SelectItem>
                    <SelectItem value="h4">
                        <Heading4 className="w-4 h-4" />
                    </SelectItem>
                    <SelectItem value="h5">
                        <Heading5 className="w-4 h-4" />
                    </SelectItem>
                    <SelectItem value="h6">
                        <Heading6 className="w-4 h-4" />
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export const HeadingButton = ({ editor }: { editor: Editor | null }) => {
    return <HeadingControls editor={editor} />;
};
