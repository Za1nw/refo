import { cn } from "@/lib/utils";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useReducer,
  type ImgHTMLAttributes,
  memo,
} from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { LoaderPinwheelIcon } from "lucide-react";

type OptimizedImageProps = {
  src?: string;
  alt?: string;
  ratio?: number;
  width?: number | string;
  height?: number | string;

  // Backward-compatible simple fallback src
  fallbackSrc?: string;

  className?: string;
  imageClassName?: string;

  // Loading hints
  priority?: boolean;

  // Loader control
  loadingIndicator?: boolean;
  loaderSize?: number | "auto";
  loader?: React.ReactNode; // new: custom loader node

  // Object-fit and transition
  objectFit?: string; // new: accept any CSS string
  transitionDuration?: number | string; // new: "300ms" | "0.3s" | 300

  // New rounded utility: true -> rounded-lg, string -> custom class
  rounded?: boolean | string;

  // New: custom fallback node (shown on error or empty src)
  fallback?: React.ReactNode;

  // New: optional skeleton text while loading
  skeletonText?: React.ReactNode;

  // New: control load timeout (ms). Set 0/undefined to disable
  loadTimeoutMs?: number;

  // New: IntersectionObserver lazy boundary
  lazyRootMargin?: string;
  observeLazy?: boolean;
} & Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  | "src"
  | "alt"
  | "width"
  | "height"
  | "loading"
  | "ref"
> & {
  // Kept for API compatibility (no-op for <img>)
  quality?: number;
  unoptimized?: boolean;
  blurDataURL?: string;
};

type ImgState = {
  isLoading: boolean;
  hasError: boolean;
  isInView: boolean;
};

type ImgAction =
  | { type: "RESET" }
  | { type: "START" }
  | { type: "LOADED" }
  | { type: "ERROR" }
  | { type: "INVIEW" }
  | { type: "TIMEOUT" };

function stateReducer(state: ImgState, action: ImgAction): ImgState {
  switch (action.type) {
    case "RESET":
      return { isLoading: false, hasError: false, isInView: state.isInView };
    case "START":
      return { ...state, isLoading: true, hasError: false };
    case "LOADED":
      return { ...state, isLoading: false, hasError: false };
    case "ERROR":
    case "TIMEOUT":
      return { ...state, isLoading: false, hasError: true };
    case "INVIEW":
      return { ...state, isInView: true };
    default:
      return state;
  }
}

function OptimizedImageComponent({
  src,
  alt = "",
  ratio = 16 / 9,
  width,
  height,
  fallbackSrc = "/placeholder.svg",
  className = "",
  imageClassName = "",
  priority = false,

  // loader
  loadingIndicator = true,
  loaderSize = "auto",
  loader,

  // visuals
  objectFit = "cover",
  transitionDuration = 300,
  rounded,

  // UX extras
  fallback,
  skeletonText,

  // timing / lazy
  loadTimeoutMs = 10000,
  lazyRootMargin = "200px",
  observeLazy = true,

  // API-compat no-ops for <img>
  quality,
  unoptimized,
  blurDataURL,

  ...props
}: OptimizedImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const { displaySrc, isEmptySrc } = useMemo(() => {
    const isEmpty = !src || src === "";
    return {
      displaySrc: isEmpty ? fallbackSrc : (src as string),
      isEmptySrc: isEmpty,
    };
  }, [src, fallbackSrc]);

  const sanitizedSrc = useMemo(() => {
    if (isEmptySrc) return fallbackSrc;
    return displaySrc?.startsWith("//") ? `https:${displaySrc}` : displaySrc;
  }, [displaySrc, isEmptySrc, fallbackSrc]);

  // Consolidated state
  const [state, dispatch] = useReducer(stateReducer, {
    isLoading: priority && !isEmptySrc,
    hasError: false,
    isInView: !!priority,
  });

  const shouldLoad = priority || state.isInView;

  // Reset state when src changes
  useEffect(() => {
    dispatch({ type: "RESET" });
  }, [src]);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (priority || !observeLazy) return;
    const node = containerRef.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          dispatch({ type: "INVIEW" });
          io.disconnect();
        }
      },
      { root: null, rootMargin: lazyRootMargin, threshold: 0.01 }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [priority, lazyRootMargin, observeLazy]);

  // Start loading when it becomes eligible
  useEffect(() => {
    if (shouldLoad && !isEmptySrc) {
      dispatch({ type: "START" });
    }
  }, [shouldLoad, isEmptySrc]);

  // Timeout for loading
  useEffect(() => {
    if (!loadTimeoutMs || loadTimeoutMs <= 0) return;
    if (!state.isLoading || isEmptySrc) return;
    const t = setTimeout(() => dispatch({ type: "TIMEOUT" }), loadTimeoutMs);
    return () => clearTimeout(t);
  }, [state.isLoading, isEmptySrc, loadTimeoutMs]);

  // Measure container for loader sizing
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateSize = () => {
      setContainerSize({ width: node.offsetWidth, height: node.offsetHeight });
    };
    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const loaderSizeValue = useMemo(() => {
    if (typeof loaderSize === "number") return loaderSize;
    if (isEmptySrc) return 0;
    const minDim = Math.min(containerSize.width, containerSize.height);
    return Math.min(Math.max(minDim * 0.3, 16), 64);
  }, [loaderSize, containerSize, isEmptySrc]);

  const onLoadCb = useCallback<NonNullable<ImgHTMLAttributes<HTMLImageElement>["onLoad"]>>(
    (e) => {
      dispatch({ type: "LOADED" });
      props.onLoad?.(e);
    },
    [props.onLoad]
  );

  const onErrorCb = useCallback<NonNullable<ImgHTMLAttributes<HTMLImageElement>["onError"]>>(
    (e) => {
      dispatch({ type: "ERROR" });
      props.onError?.(e);
    },
    [props.onError]
  );

  const roundedClass = useMemo(() => {
    if (typeof rounded === "string") return rounded;
    if (rounded) return "rounded-lg";
    return undefined;
  }, [rounded]);

  const transitionDurationValue = useMemo(() => {
    return typeof transitionDuration === "number"
      ? `${transitionDuration}ms`
      : transitionDuration;
  }, [transitionDuration]);

  const showLoader = loadingIndicator && shouldLoad && state.isLoading && containerSize.width > 0 && !isEmptySrc;

  return (
    <AspectRatio
      ratio={ratio}
      className={cn(
        "relative overflow-hidden",
        roundedClass,
        className,
        state.isLoading && !isEmptySrc && "bg-muted"
      )}
      style={{ width: width ?? "100%", height: height ?? "auto" }}
      ref={containerRef}
      aria-label={alt ? undefined : "Image"}
    >
      {showLoader && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          {loader ? (
            <div style={{ width: loaderSizeValue, height: loaderSizeValue }}>{loader}</div>
          ) : (
            <LoaderPinwheelIcon
              className="animate-spin text-primary"
              style={{ width: loaderSizeValue, height: loaderSizeValue }}
            />
          )}
          {skeletonText ? (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-muted-foreground text-xs px-2 py-1 bg-background/70 rounded">
              {skeletonText}
            </div>
          ) : null}
        </div>
      )}

      {/* Custom fallback node when error/empty */}
      {(state.hasError || isEmptySrc) && fallback ? (
        <div className="absolute inset-0 flex items-center justify-center">{fallback}</div>
      ) : (
        <img
          src={
            state.hasError || isEmptySrc ? fallbackSrc : shouldLoad ? sanitizedSrc : undefined
          }
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={onLoadCb}
          onError={onErrorCb}
          className={cn(
            "w-full h-full block transition-opacity",
            state.isLoading && shouldLoad && !isEmptySrc ? "opacity-0" : "opacity-100",
            imageClassName
          )}
          style={{
            objectFit: objectFit as any,
            transitionDuration: transitionDurationValue,
          }}
          decoding="async"
          {...props}
        />
      )}
    </AspectRatio>
  );
}

export default memo(OptimizedImageComponent);
