"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagsInputProps {
  maxTags?: number
  placeholder?: string
  className?: string
  initialValues?: string[]
  onChange?: (values: string[]) => void
}

export function TagsInput({
  maxTags = 15,
  placeholder = "أضف علامة...",
  className,
  initialValues = [],
  onChange,
}: TagsInputProps) {
  const [values, setValues] = React.useState<string[]>(initialValues)
  const [input, setInput] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    onChange?.(values)
  }, [values, onChange])

  const addValue = (val: string) => {
    const trimmed = val.trim()
    setError(null)

    if (!trimmed) {
      setError("لا يمكن إضافة قيمة فارغة")
      return
    }

    if (values.includes(trimmed)) {
      setError("هذه العلامة موجودة مسبقاً")
      return
    }

    if (values.length >= maxTags) {
      setError(`الحد الأقصى ${maxTags} علامة`)
      return
    }

    if (trimmed.length > 30) {
      setError("الحد الأقصى 30 حرفاً للعلامة الواحدة")
      return
    }

    setValues((prev) => [...prev, trimmed])
    setInput("")
    setError(null)
  }

  const removeValue = (val: string) => {
    setValues((prev) => prev.filter((v) => v !== val))
    setError(null)
    inputRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addValue(input)
    }

    if (e.key === "Backspace" && !input && values.length) {
      removeValue(values[values.length - 1])
    }

    if (e.key === "Escape") {
      inputRef.current?.blur()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    const tags = pastedText
      .split(/[,،\n\t]+/)
      .map(t => t.trim())
      .filter(Boolean)

    const remaining = maxTags - values.length
    const tagsToAdd = tags.slice(0, remaining)

    tagsToAdd.forEach(tag => {
      if (!values.includes(tag) && tag.length <= 30) {
        setValues(prev => [...prev, tag])
      }
    })

    setInput("")
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  const availableSlots = maxTags - values.length
  const isMaxReached = availableSlots <= 0

  return (
    <div className={cn("w-full space-y-1.5", className)} dir="rtl">
      <div
        onClick={handleContainerClick}
        className={cn(
          "flex flex-wrap items-center gap-2 p-2.5 min-h-[46px]",
          "border-2 rounded-xl bg-white",
          "transition-all duration-200 ease-in-out",
          "cursor-text",
          isFocused
            ? "border-blue-500 ring-4 ring-blue-500/10 shadow-lg shadow-blue-500/5"
            : "border-gray-200 hover:border-gray-300",
          isMaxReached && "border-amber-400 bg-amber-50/30",
          error && "border-red-400 ring-4 ring-red-500/10"
        )}
      >
        {/* Tags */}
        {values.map((val, index) => (
          <span
            key={val}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5",
              "bg-gradient-to-br from-blue-50 to-blue-100",
              "border border-blue-200 rounded-lg",
              "text-sm font-medium text-blue-700",
              "animate-in fade-in zoom-in-95 duration-200",
              "shadow-sm",
              "group"
            )}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <span className="max-w-[120px] truncate">{val}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeValue(val)
              }}
              className={cn(
                "flex-shrink-0 p-0.5 rounded-full",
                "text-blue-400 hover:text-red-500",
                "hover:bg-red-50 active:bg-red-100",
                "transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-red-400"
              )}
              aria-label={`إزالة ${val}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          className={cn(
            "flex-1 min-w-[100px] bg-transparent",
            "text-sm py-1",
            "outline-none border-none",
            "placeholder:text-gray-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "text-red-600 placeholder:text-red-300"
          )}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError(null)
          }}
          onKeyDown={onKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            if (input.trim()) {
              addValue(input)
            }
          }}
          placeholder={
            isMaxReached
              ? `الحد الأقصى ${maxTags} علامة`
              : `أضف علامة... (${availableSlots} متبقي)`
          }
          disabled={isMaxReached}
          dir="rtl"
        />
      </div>

      {/* Counter & Error */}
      <div className="flex items-center justify-between px-1">
        {error ? (
          <p className="text-xs text-red-500 animate-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        ) : (
          <p className="text-xs text-gray-400">
            {values.length === 0
              ? "اكتب واضغط Enter للإضافة"
              : `${values.length} / ${maxTags} علامة`}
          </p>
        )}
      </div>
    </div>
  )
}

// Usage example:
export function TagsInputDemo() {
  const [tags, setTags] = React.useState<string[]>([])

  return (
    <div className="p-8 max-w-md mx-auto space-y-6">
      <div className="text-right">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          العلامات
        </h2>
        <p className="text-sm text-gray-500">
          أضف علامات لتصنيف المحتوى
        </p>
      </div>

      <TagsInput
        maxTags={10}
        initialValues={[]}
        onChange={setTags}
        placeholder="أضف علامة واضغط Enter..."
      />

      {/* Preview */}
      {tags.length > 0 && (
        <div className="text-right">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            العلامات المضافة:
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
