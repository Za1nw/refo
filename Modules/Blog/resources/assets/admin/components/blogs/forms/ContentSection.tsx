import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBlogFormContext } from '../../../context/BlogFormContext';
import TiptapEditor from '@/components/tiptap/TiptapEditor';
import InputError from '@/components/input-error';
import { ToolbarAction } from '@/components/tiptap/EditorToolbar';
const DEFAULT_ACTIONS: ToolbarAction[] = [
    "undoRedo",
    "heading",
    "fontSize",
    "textFormat",
    "textColor",
    "backgroundColor",
    "align",
    'textDirection',
    "list",
    "link",
    "preview",
    "fullscreen",
];

export default function ContentSection() {
    const { form, t } = useBlogFormContext();

    return (
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="blog-description">{t('Description')}</Label>
                <Textarea
                    id="blog-description"
                    value={form.data.description}
                    onChange={(e) => form.setData('description', e.currentTarget.value)}
                    rows={4}
                />
                {form.errors.description ? <p className="text-sm text-destructive">{form.errors.description}</p> : null}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="blog-content">{t('Content')}</Label>
                <div className="grid gap-2">
                    <TiptapEditor
                        toolbarActions={DEFAULT_ACTIONS}
                        onChange={(value) => form.setData('content', value)}
                        value={form.data.content}
                        maxHeight={200}
                    />
                    <InputError message={form.errors.content} />
                </div>
            </div>
        </div>
    );
}
