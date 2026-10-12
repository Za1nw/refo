import Color from "color"
import { PipetteIcon } from "lucide-react"
import { Slider } from "radix-ui"
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface ColorPickerContextValue {
  hue: number
  saturation: number
  lightness: number
  alpha: number
  mode: string
  setHue: (hue: number) => void
  setSaturation: (saturation: number) => void
  setLightness: (lightness: number) => void
  setAlpha: (alpha: number) => void
  setMode: (mode: string) => void
  setColorFromString: (colorString: string) => void
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(undefined)

export const useColorPicker = () => {
  const context = useContext(ColorPickerContext)

  if (!context) {
    throw new Error("useColorPicker must be used within a ColorPickerProvider")
  }

  return context
}

export type ColorPickerProps = HTMLAttributes<HTMLDivElement> & {
  value?: Parameters<typeof Color>[0]
  defaultValue?: Parameters<typeof Color>[0]
  onChange?: (value: Parameters<typeof Color.rgb>[0], hex: string) => void
}

export const ColorPicker = ({
  value,
  defaultValue = "#000000",
  onChange,
  className,
  children,
  ...props
}: ColorPickerProps) => {
  const getInitialColor = () => {
    const color = value ? Color(value) : Color(defaultValue)
    const [h, s, l] = color.hsl().array()
    return {
      hue: h || 0,
      saturation: s || 0,
      lightness: l || 0,
      alpha: (color.alpha() || 1) * 100,
    }
  }

  const initialColor = getInitialColor()

  const [hue, setHue] = useState(initialColor.hue)
  const [saturation, setSaturation] = useState(initialColor.saturation)
  const [lightness, setLightness] = useState(initialColor.lightness)
  const [alpha, setAlpha] = useState(initialColor.alpha)
  const [mode, setMode] = useState("hex")

  const setColorFromString = useCallback((colorString: string) => {
    try {
      const color = Color(colorString)
      const [h, s, l] = color.hsl().array()
      setHue(h || 0)
      setSaturation(s || 0)
      setLightness(l || 0)
      setAlpha((color.alpha() || 1) * 100)
    } catch (error) {
      console.warn("Invalid color string:", colorString)
    }
  }, [])

  useEffect(() => {
    if (value) {
      const color = Color(value)
      const [h, s, l] = color.hsl().array()
      setHue(h || 0)
      setSaturation(s || 0)
      setLightness(l || 0)
      setAlpha((color.alpha() || 1) * 100)
    }
  }, [value])

  useEffect(() => {
    if (onChange) {
      const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100)
      const rgba = color.rgb().array()
      const hex = color.hexa().toString()

      onChange([rgba[0], rgba[1], rgba[2], alpha / 100], hex)
    }
  }, [hue, saturation, lightness, alpha, onChange])

  return (
    <ColorPickerContext.Provider
      value={{
        hue,
        saturation,
        lightness,
        alpha,
        mode,
        setHue,
        setSaturation,
        setLightness,
        setAlpha,
        setMode,
        setColorFromString,
      }}
    >
      <div className={cn("flex size-full flex-col gap-4", className)} {...props}>
        {children}
      </div>
    </ColorPickerContext.Provider>
  )
}

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerSelection = memo(({ className, ...props }: ColorPickerSelectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [positionX, setPositionX] = useState(0)
  const [positionY, setPositionY] = useState(0)
  const { hue, saturation, lightness, setSaturation, setLightness } = useColorPicker()

  useEffect(() => {
    const x = saturation / 100
    const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)
    const y = 1 - lightness / topLightness
    setPositionX(x)
    setPositionY(y)
  }, [saturation, lightness])

  const backgroundGradient = useMemo(() => {
    return `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
            linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
            hsl(${hue}, 100%, 50%)`
  }, [hue])

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!(isDragging && containerRef.current)) {
        return
      }
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
      setPositionX(x)
      setPositionY(y)
      setSaturation(x * 100)
      const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)
      const newLightness = topLightness * (1 - y)

      setLightness(newLightness)
    },
    [isDragging, setSaturation, setLightness],
  )

  useEffect(() => {
    const handlePointerUp = () => setIsDragging(false)

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [isDragging, handlePointerMove])

  return (
    <div
      className={cn("relative size-full cursor-crosshair rounded", className)}
      onPointerDown={e => {
        e.preventDefault()
        setIsDragging(true)
        handlePointerMove(e.nativeEvent)
      }}
      ref={containerRef}
      style={{
        background: backgroundGradient,
      }}
      {...props}
    >
      <div
        className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute h-4 w-4 rounded-full border-2 border-white"
        style={{
          left: `${positionX * 100}%`,
          top: `${positionY * 100}%`,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  )
})

ColorPickerSelection.displayName = "ColorPickerSelection"

export type ColorPickerHueProps = ComponentProps<typeof Slider.Root>

export const ColorPickerHue = ({ className, ...props }: ColorPickerHueProps) => {
  const { hue, setHue } = useColorPicker()

  return (
    <Slider.Root
      className={cn("relative flex h-4 w-full touch-none", className)}
      max={360}
      onValueChange={([hue]) => setHue(hue)}
      step={1}
      value={[hue]}
      {...props}
    >
      <Slider.Track className="relative my-0.5 h-3 w-full grow rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]">
        <Slider.Range className="absolute h-full" />
      </Slider.Track>
      <Slider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </Slider.Root>
  )
}

export type ColorPickerAlphaProps = ComponentProps<typeof Slider.Root>

export const ColorPickerAlpha = ({ className, ...props }: ColorPickerAlphaProps) => {
  const { alpha, setAlpha, hue, saturation, lightness } = useColorPicker()

  const gradientColor = useMemo(() => {
    const color = Color.hsl(hue, saturation, lightness)
    const rgb = color.rgb().array()
    return `linear-gradient(90deg, transparent, rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1))`
  }, [hue, saturation, lightness])

  return (
    <Slider.Root
      className={cn("relative flex h-4 w-full touch-none", className)}
      max={100}
      onValueChange={([alpha]) => setAlpha(alpha)}
      step={1}
      value={[alpha]}
      {...props}
    >
      <Slider.Track
        className="relative my-0.5 h-3 w-full grow rounded-full"
        style={{
          background:
            'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==") left center',
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: gradientColor,
          }}
        />
        <Slider.Range className="absolute h-full rounded-full bg-transparent" />
      </Slider.Track>
      <Slider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </Slider.Root>
  )
}

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>

export const ColorPickerEyeDropper = ({ className, ...props }: ColorPickerEyeDropperProps) => {
  const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker()

  const handleEyeDropper = async () => {
    try {
      // @ts-expect-error - EyeDropper API is experimental
      const eyeDropper = new EyeDropper()
      const result = await eyeDropper.open()
      const color = Color(result.sRGBHex)
      const [h, s, l] = color.hsl().array()

      setHue(h || 0)
      setSaturation(s || 0)
      setLightness(l || 0)
      setAlpha((color.alpha() || 1) * 100)
    } catch (error) {
      console.error("EyeDropper failed:", error)
    }
  }

  return (
    <Button
      className={cn("shrink-0 text-muted-foreground", className)}
      onClick={handleEyeDropper}
      size="icon"
      type="button"
      variant="outline"
      {...props}
    >
      <PipetteIcon size={16} />
    </Button>
  )
}

export type ColorPickerOutputProps = ComponentProps<typeof SelectTrigger>

const formats = ["hex", "rgb", "css", "hsl"]

export const ColorPickerOutput = ({ className, ...props }: ColorPickerOutputProps) => {
  const { mode, setMode } = useColorPicker()

  return (
    <Select onValueChange={setMode} value={mode}>
      <SelectTrigger className="h-8 w-20 shrink-0 text-xs" {...props}>
        <SelectValue placeholder="Mode" />
      </SelectTrigger>
      <SelectContent>
        {formats.map(format => (
          <SelectItem className="text-xs" key={format} value={format}>
            {format.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type PercentageInputProps = ComponentProps<typeof Input> & {
  onValueChange?: (value: number) => void
}

const PercentageInput = ({ className, value, onValueChange, ...props }: PercentageInputProps) => {
  const [localValue, setLocalValue] = useState(value?.toString() || "")

  useEffect(() => {
    setLocalValue(value?.toString() || "")
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // السماح فقط بالأرقام والنقطة العشرية وبحد أقصى 3 أرقام
    if (/^\d{0,3}(\.\d{0,2})?$/.test(newValue) || newValue === "") {
      setLocalValue(newValue)
      const numValue = parseFloat(newValue)
      if (newValue === "") {
        onValueChange?.(0)
      } else if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        onValueChange?.(numValue)
      }
    }
  }

  const handleBlur = () => {
    // تنسيق القيمة عند الخروج من الحقل
    const numValue = parseFloat(localValue)
    if (isNaN(numValue) || numValue < 0) {
      setLocalValue("0")
      onValueChange?.(0)
    } else if (numValue > 100) {
      setLocalValue("100")
      onValueChange?.(100)
    } else {
      setLocalValue(Math.round(numValue).toString())
      onValueChange?.(Math.round(numValue))
    }
  }

  return (
    <div className="relative">
      <Input
        type="text"
        inputMode="decimal"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={6}
        {...props}
        className={cn(
          "h-8 w-[3.25rem] rounded-s-none px-2 text-xs shadow-none",
          className,
        )}
      />
      <span className="-translate-y-1/2 absolute top-1/2 end-2 text-muted-foreground text-xs">
        %
      </span>
    </div>
  )
}

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerFormat = ({ className, ...props }: ColorPickerFormatProps) => {
  const { hue, saturation, lightness, alpha, mode, setColorFromString, setAlpha } = useColorPicker()
  const color = Color.hsl(hue, saturation, lightness, alpha / 100)
  const [localInputs, setLocalInputs] = useState<string[]>([])

  useEffect(() => {
    if (mode === "hex") {
      // عرض hex مع alpha إذا كانت أقل من 100%
      if (alpha < 100) {
        setLocalInputs([color.hexa().toString()])
      } else {
        setLocalInputs([color.hex().toString()])
      }
    } else if (mode === "rgb") {
      setLocalInputs(
        color.rgb().array().map(v => Math.round(v).toString())
      )
    } else if (mode === "hsl") {
      setLocalInputs(
        color.hsl().array().map(v => Math.round(v).toString())
      )
    } else if (mode === "css") {
      const rgb = color.rgb().array().map(v => Math.round(v))
      setLocalInputs([`rgba(${rgb.join(", ")}, ${(alpha / 100).toFixed(2)})`])
    }
  }, [mode, hue, saturation, lightness, alpha])

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // إضافة # تلقائياً إذا لم تكن موجودة
    if (value && !value.startsWith("#")) {
      value = "#" + value
    }

    // السماح فقط بـ # والأحرف السداسية عشرية
    let cleanValue = value.replace(/[^#0-9A-Fa-f]/g, "")

    // التأكد من وجود # واحدة فقط في البداية
    if (cleanValue.startsWith("#")) {
      const withoutHash = cleanValue.substring(1)
      cleanValue = "#" + withoutHash.replace(/#/g, "")
    }

    // تحديد الطول الأقصى: 7 أحرف (# + 6) أو 9 أحرف (# + 8)
    const withoutHash = cleanValue.replace("#", "")
    if (withoutHash.length <= 6) {
      // لون بدون شفافية - تعيين alpha إلى 100%
      if (withoutHash.length === 6) {
        try {
          const fullHex = "#" + withoutHash
          setColorFromString(fullHex)
          // تعيين الشفافية إلى 100% لأن hex لا يحتوي على شفافية
          setAlpha(100)
        } catch (error) {
          // تجاهل
        }
      }
      setLocalInputs([cleanValue])
    } else if (withoutHash.length <= 8) {
      // لون مع شفافية
      if (withoutHash.length === 8) {
        try {
          const fullHex = "#" + withoutHash
          setColorFromString(fullHex)
        } catch (error) {
          // تجاهل
        }
      }
      setLocalInputs([cleanValue])
    }
    // إذا تجاوز 8 أحرف، لا نسمح بالإضافة
  }

  const handleNumericInput = (index: number, value: string, max: number, maxLength: number) => {
    // السماح فقط بالأرقام
    const cleanValue = value.replace(/[^0-9]/g, "")
    // تحديد الطول الأقصى
    const limitedValue = cleanValue.slice(0, maxLength)

    const newInputs = [...localInputs]
    newInputs[index] = limitedValue
    setLocalInputs(newInputs)

    const numValue = parseInt(limitedValue)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= max) {
      return numValue
    }
    return null
  }

  const handleRgbChange = (index: number, value: string) => {
    const numValue = handleNumericInput(index, value, 255, 3)
    if (numValue !== null) {
      const fullRgb = localInputs.map((v, i) => {
        if (i === index) return numValue
        return parseInt(v) || 0
      })
      const colorString = `rgb(${fullRgb.join(",")})`
      setColorFromString(colorString)
    }
  }

  const handleHslChange = (index: number, value: string) => {
    const max = index === 0 ? 360 : 100
    const maxLength = index === 0 ? 3 : 3
    const numValue = handleNumericInput(index, value, max, maxLength)
    if (numValue !== null) {
      const fullHsl = localInputs.map((v, i) => {
        if (i === index) return numValue
        return parseInt(v) || 0
      })
      const colorString = `hsl(${fullHsl[0]}, ${fullHsl[1]}%, ${fullHsl[2]}%)`
      setColorFromString(colorString)
    }
  }

  const handleCssChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalInputs([value])

    try {
      const color = Color(value)
      if (color) {
        setColorFromString(value)
      }
    } catch (error) {
      // تجاهل القيم غير الصالحة
    }
  }

  const handleAlphaChange = (value: number) => {
    setAlpha(value)
  }

  if (mode === "hex") {
    return (
      <div
        className={cn(
          "-space-x-px relative flex w-full items-center rounded-md shadow-sm",
          className,
        )}
        {...props}
      >
        <Input
          className="h-8 rounded-e-none px-2 text-xs shadow-none font-mono"
          type="text"
          value={localInputs[0] || ""}
          onChange={handleHexChange}
          placeholder="#000000"
          maxLength={9}
          spellCheck={false}
        />
        <PercentageInput
          value={Math.round(alpha)}
          onValueChange={handleAlphaChange}
        />
      </div>
    )
  }

  if (mode === "rgb") {
    return (
      <div
        className={cn("-space-x-px flex items-center rounded-md shadow-sm", className)}
        {...props}
      >
        {['R', 'G', 'B'].map((label, index) => (
          <Input
            className={cn(
              "h-8 rounded-e-none px-2 text-xs shadow-none text-center",
              index > 0 && "rounded-s-none",
            )}
            key={label}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={localInputs[index] || ""}
            onChange={(e) => handleRgbChange(index, e.target.value)}
            placeholder={label === 'R' ? "255" : label === 'G' ? "255" : "255"}
            maxLength={3}
          />
        ))}
        <PercentageInput
          value={Math.round(alpha)}
          onValueChange={handleAlphaChange}
        />
      </div>
    )
  }

  if (mode === "css") {
    return (
      <div className={cn("w-full rounded-md shadow-sm", className)} {...props}>
        <Input
          className="h-8 w-full px-2 text-xs shadow-none"
          type="text"
          value={localInputs[0] || ""}
          onChange={handleCssChange}
          placeholder="rgba(255, 255, 255, 1)"
        />
      </div>
    )
  }

  if (mode === "hsl") {
    return (
      <div
        className={cn("-space-x-px flex items-center rounded-md shadow-sm", className)}
        {...props}
      >
        {['H', 'S', 'L'].map((label, index) => (
          <Input
            className={cn(
              "h-8 rounded-e-none px-2 text-xs shadow-none text-center",
              index > 0 && "rounded-s-none",
            )}
            key={label}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={localInputs[index] || ""}
            onChange={(e) => handleHslChange(index, e.target.value)}
            placeholder={label === 'H' ? "360" : "100"}
            maxLength={3}
          />
        ))}
        <PercentageInput
          value={Math.round(alpha)}
          onValueChange={handleAlphaChange}
        />
      </div>
    )
  }

  return null
}
export function Demo() {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-8">
      <ColorPicker defaultValue="#6366f1" className="h-auto w-64">
        <ColorPickerSelection className="h-40 rounded-lg" />
        <ColorPickerHue />
        <ColorPickerAlpha />
        <div className="flex items-center gap-2">
          <ColorPickerEyeDropper />
          <ColorPickerOutput />
          <ColorPickerFormat />
        </div>
      </ColorPicker>
    </div>
  )
}
