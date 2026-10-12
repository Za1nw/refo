import { Check, Search, X } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

import { ICON_ALIASES, ICONS } from "./icons"
import { useIconPicker } from "./useIconPicker"
import { isSvgValue, svgToDataUrl } from "./utils"

export type IconPickerProps = {
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  maxResults?: number
  disabled?: boolean
}

export function IconPicker({
  value,
  onChange,
  placeholder = "اختر أيقونة",
  maxResults = 120,
  disabled = false,
}: IconPickerProps) {
  const {
    open,
    search,
    setSearch,
    onOpenChange,
    selected,
    selectedName,
    filtered,
    customOption,
    hasQuery,
    selectIcon,
    clearIcon,
    setCustomValue,
  } = useIconPicker({
    value,
    onChange,
    icons: ICONS,
    aliases: ICON_ALIASES,
    maxResults,
  })

  const hasSelection = selectedName.trim().length > 0
  const [svgText, setSvgText] = React.useState("")
  const [svgError, setSvgError] = React.useState<string | null>(null)
  const [showSvgPaste, setShowSvgPaste] = React.useState(false)

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && customOption) {
      event.preventDefault()
      selectIcon(customOption.name)
    }
  }

  const handlePasteSvg = () => {
    const trimmed = svgText.trim()

    if (!trimmed) {
      setSvgError("الرجاء لصق كود SVG أولاً")
      return
    }

    if (!trimmed.toLowerCase().includes("<svg")) {
      setSvgError("القيمة الملصوقة ليست SVG صالح")
      return
    }

    if (trimmed.length > 1_000_000) {
      setSvgError("حجم SVG كبير جدًا")
      return
    }

    setSvgError(null)
    setCustomValue(svgToDataUrl(trimmed))
    setSvgText("")
  }

  React.useEffect(() => {
    if (!open) {
      setSvgText("")
      setSvgError(null)
      setShowSvgPaste(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          disabled={disabled}
          className="hover:bg-primary/55 data-[state=open]:bg-primary/55 cursor-pointer"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-md border border-primary bg-muted/40 text-primary">
              {selectedName ? (
                isSvgValue(selectedName) ? (
                  <img src={selectedName} alt="selected svg" className="size-4 object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">{selectedName}</span>
                )
              ) : (
                <Search className="size-4" />
              )}
            </span>
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-3xl">
        <DialogTitle>اختر أيقونة</DialogTitle>
        <DialogDescription className="text-muted-foreground text-sm">
          ابحث عن اسم الأيقونة أو اختر من الشبكة. سيتم حفظ الاسم كنص في قاعدة البيانات.
        </DialogDescription>

        <div className="min-h-0 space-y-3 py-8 scrollbar overflow-y-scroll pe-1 [scrollbar-gutter:stable]">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 inset-s-3 size-4 -translate-y-1/2" />
            <Input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="ابحث أو اكتب اسم الأيقونة..."
              className="ps-9"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs">
              {hasQuery ? `عدد النتائج: ${filtered.length}` : `أول ${filtered.length} أيقونة`}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSvgPaste((prev) => !prev)}
                className="gap-1"
              >
                {showSvgPaste ? "إخفاء SVG" : "لصق SVG"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearIcon}
                className="gap-1"
              >
                <X className="size-3.5" />
                بدون أيقونة
              </Button>
            </div>
          </div>

          {showSvgPaste ? (
            <div className="rounded-lg border p-2">
              <div className="mb-2 text-xs text-muted-foreground">
                الصق كود SVG مباشرة (بدون رفع ملف)
              </div>
              <Textarea
                value={svgText}
                onChange={(event) => setSvgText(event.target.value)}
                placeholder={'<svg xmlns="http://www.w3.org/2000/svg" ...>...</svg>'}
                className="min-h-24 font-mono text-xs"
              />
              {svgError ? (
                <p className="mt-2 text-xs text-destructive">{svgError}</p>
              ) : null}
              <div className="mt-2 flex justify-end">
                <Button type="button" size="sm" onClick={handlePasteSvg}>
                  اعتماد SVG الملصوق
                </Button>
              </div>
            </div>
          ) : null}

          <ScrollArea className="max-h-[52vh] rounded-lg border p-2">
            {customOption ? (
              <div className="mb-2 rounded-md border border-primary/30 bg-primary/5 p-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto w-full justify-start gap-3 rounded-lg px-3 py-3 text-start"
                  onClick={() => selectIcon(customOption.name)}
                >
                  <span className="material-symbols-outlined text-[20px]">{customOption.name}</span>
                  <span className="min-w-0 truncate">استخدم: {customOption.name}</span>
                </Button>
              </div>
            ) : null}

            {filtered.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
                لا توجد أيقونات مطابقة.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((icon) => {
                  const isSelected = selectedName === icon.name

                  return (
                    <Button
                      key={icon.name}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className="h-auto min-h-24 flex-col gap-2 rounded-lg px-2 py-3"
                      onClick={() => selectIcon(icon.name)}
                      title={icon.name}
                    >
                      <span className="material-symbols-outlined text-[22px]">{icon.name}</span>
                      <span className="w-full truncate text-[11px]">{icon.label}</span>
                      {isSelected ? <Check className="size-3.5" /> : null}
                    </Button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const SelectIcon = IconPicker
