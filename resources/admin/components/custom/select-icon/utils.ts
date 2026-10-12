type AliasMap = Record<string, string>;

const SVG_DATA_PREFIX = "data:image/svg+xml";
const SVG_RAW_PREFIX = "<svg";

function normalizeInputValue(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  return "";
}

export function isSvgValue(value?: unknown): boolean {
  const trimmed = normalizeInputValue(value);

  if (trimmed === "") {
    return false;
  }

  return (
    trimmed.startsWith(SVG_DATA_PREFIX) ||
    trimmed.toLowerCase().startsWith(SVG_RAW_PREFIX)
  );
}

export function svgToDataUrl(svgText: string): string {
  return `${SVG_DATA_PREFIX};utf8,${encodeURIComponent(svgText)}`;
}

export function normalizeIconName(value?: unknown, aliases: AliasMap = {}): string {
  const trimmed = normalizeInputValue(value);

  if (trimmed === "") {
    return "";
  }

  if (isSvgValue(trimmed)) {
    return trimmed;
  }

  const snakeCase = trimmed
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();

  return aliases[trimmed] ?? aliases[snakeCase] ?? snakeCase;
}

export function formatLabel(name: string): string {
  if (isSvgValue(name)) {
    return "svg";
  }

  return name
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
