import RadiusControl from './RadiusControl';

type ThemeControlsProps = {
    errors?: Record<string, string>;
};

export default function ThemeControls({ errors = {} }: ThemeControlsProps) {
    return (
        <section className="space-y-2">
            <div>
                <h4 className="text-sm font-semibold">استدارة الحواف</h4>
                <p className="text-sm text-muted-foreground">
                    تحكم بدرجة نعومة زوايا عناصر الواجهة.
                </p>
            </div>
            <RadiusControl errors={errors} />
        </section>
    );
}
