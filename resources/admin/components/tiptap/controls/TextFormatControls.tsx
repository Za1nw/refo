import type { Editor } from "@tiptap/core";
import {
	Bold,
	ChevronDown,
	Code,
	Italic,
	Strikethrough,
	Subscript,
	Superscript,
	Underline,
} from "lucide-react";
import {
	memo,
	type ComponentType,
	type KeyboardEvent,
	type SVGProps,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Small classNames helper (avoids bringing external utils)
function cx(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(" ");
}

type TextFormatControlsProps = {
	editor?: Editor | null;
	className?: string;
	menuOrientation?: "horizontal" | "vertical";
	dir?: "ltr" | "rtl";
};

// Config shape for extensible commands
type Cmd = (editor: Editor) => void;
type IsActive = (editor: Editor) => boolean;
type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type ButtonConfig = {
	key: string;
	label: string;
	icon: IconType;
	isActive: IsActive;
	command: Cmd;
};

const ToolbarButton = memo(function ToolbarButton({
	icon: Icon,
	label,
	isOn,
	onPress,
	"data-key": dataKey,
}: {
	icon: IconType;
	label: string;
	isOn: boolean;
	onPress: () => void;
	"data-key": string;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			title={label}
			aria-label={label}
			aria-pressed={isOn}
			data-toolbar-item="true"
			data-key={dataKey}
			onClick={onPress}
			className={cx(
				"h-10 w-10 rounded-none transition-colors",
				// Unified active/hover styles
				isOn ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
				// Focus ring for keyboard users
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
			)}
		>
			<Icon className="h-4 w-4" />
		</Button>
	);
});

ToolbarButton.displayName = "ToolbarButton";

export default function TextFormatControls({
	editor,
	className,
	menuOrientation = "horizontal",
	dir,
}: TextFormatControlsProps) {
	// Determine direction (RTL/LTR)
	const computedDir: "ltr" | "rtl" =
		dir ??
		(typeof document !== "undefined" ? (document.dir as "ltr" | "rtl") : undefined) ??
		"ltr";

	// Re-render only when editor updates/selection changes
	const [, setTick] = useState(0);
	useEffect(() => {
		if (!editor) return;
		const update = () => setTick((t) => (t + 1) % 1_000_000);
		editor.on("transaction", update);
		editor.on("selectionUpdate", update);
		editor.on("update", update);
		return () => {
			editor.off("transaction", update);
			editor.off("selectionUpdate", update);
			editor.off("update", update);
		};
	}, [editor]);

	// Configs: add/remove items here to extend toolbar easily
	const mainButtons: ButtonConfig[] = useMemo(
		() => [
			{
				key: "bold",
				label: "Toggle bold",
				icon: Bold,
				isActive: (e) => e.isActive("bold"),
				command: (e) => e.chain().focus().toggleBold().run(),
			},
			{
				key: "italic",
				label: "Toggle italic",
				icon: Italic,
				isActive: (e) => e.isActive("italic"),
				command: (e) => e.chain().focus().toggleItalic().run(),
			},
			{
				key: "underline",
				label: "Toggle underline",
				icon: Underline,
				isActive: (e) => e.isActive("underline"),
				command: (e) => e.chain().focus().toggleUnderline().run(),
			},
		],
		[]
	);

	const menuButtons: ButtonConfig[] = useMemo(
		() => [
			{
				key: "superscript",
				label: "Toggle superscript",
				icon: Superscript,
				isActive: (e) => e.isActive("superscript"),
				command: (e) => e.chain().focus().toggleSuperscript().run(),
			},
			{
				key: "subscript",
				label: "Toggle subscript",
				icon: Subscript,
				isActive: (e) => e.isActive("subscript"),
				command: (e) => e.chain().focus().toggleSubscript().run(),
			},
			{
				key: "strike",
				label: "Toggle strikethrough",
				icon: Strikethrough,
				isActive: (e) => e.isActive("strike"),
				command: (e) => e.chain().focus().toggleStrike().run(),
			},
			{
				key: "code",
				label: "Toggle inline code",
				icon: Code,
				isActive: (e) => e.isActive("code"),
				command: (e) => e.chain().focus().toggleCode().run(),
			},
		],
		[]
	);

	// Keyboard navigation across toolbar buttons (Arrow keys)
	const containerRef = useRef<HTMLDivElement | null>(null);
	const onKeyDownToolbar = useCallback(
		(e: KeyboardEvent<HTMLDivElement>) => {
			const key = e.key;
			if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) return;

			const root = containerRef.current;
			if (!root) return;

			const items = Array.from(
				root.querySelectorAll<HTMLElement>('[data-toolbar-item="true"]')
			).filter((el) => !el.hasAttribute("disabled"));

			if (items.length === 0) return;

			const currentIndex = items.findIndex((el) => el === e.target);
			if (currentIndex === -1) return;

			// Map keys considering direction
			const isHorizontal = true; // primary toolbar is horizontal
			let delta = 0;

			if (isHorizontal) {
				if (key === "ArrowLeft") delta = computedDir === "rtl" ? +1 : -1;
				if (key === "ArrowRight") delta = computedDir === "rtl" ? -1 : +1;
				if (key === "ArrowUp") delta = -1; // allow up/down to move too
				if (key === "ArrowDown") delta = +1;
			}

			if (delta !== 0) {
				e.preventDefault();
				const next = (currentIndex + delta + items.length) % items.length;
				items[next]?.focus();
			}
		},
		[computedDir]
	);

	if (!editor) return null;

	// Render
	return (
		<div
			ref={containerRef}
			role="toolbar"
			aria-label="تنسيق النص"
			aria-orientation="horizontal"
			dir={computedDir}
			onKeyDown={onKeyDownToolbar}
			className={cx(
				"flex items-center rounded-md border divide-x divide-border bg-background",
				// Responsive & scrollable on small screens
				"max-w-full overflow-x-auto sm:overflow-x-hidden flex-nowrap",
				className
			)}
		>
			{/* Main buttons */}
			<div className="flex">
				{mainButtons.map((b) => {
					const isOn = b.isActive(editor);
					const onPress = () => b.command(editor);
					return (
						<ToolbarButton
							key={b.key}
							data-key={b.key}
							icon={b.icon}
							label={b.label}
							isOn={isOn}
							onPress={onPress}
						/>
					);
				})}
			</div>

			{/* Dropdown with extra formats */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						title="المزيد من تنسيقات النص"
						aria-label="المزيد من تنسيقات النص"
						data-toolbar-item="true"
						className={cx(
							"h-10 w-10 rounded-none transition-colors",
							"hover:bg-accent/50",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						)}
					>
						<div className="flex items-center">
							<span className="text-xs font-medium">Aa</span>
							<ChevronDown className="ml-1 h-3 w-3" />
						</div>
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="start" sideOffset={4} className="p-2 w-auto">
					<DropdownMenuGroup
						className={cx(
							"gap-1",
							menuOrientation === "vertical" ? "flex flex-col" : "flex flex-row"
						)}
					>
						{menuButtons.map((b) => {
							const active = b.isActive(editor);
							const Icon = b.icon;
							return (
								<DropdownMenuCheckboxItem
									key={b.key}
									checked={active}
									onCheckedChange={() => b.command(editor)}
									title={b.label}
									aria-label={b.label}
									className={cx(
										"p-2 cursor-pointer",
										active ? "bg-accent text-accent-foreground" : "",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									)}
								>
									<Icon className="h-4 w-4" />
								</DropdownMenuCheckboxItem>
							);
						})}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
