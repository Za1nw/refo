const OKLCH_PATTERN =
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/;

const toSrgb = (value: number) => {
    const clampedValue = Math.max(0, Math.min(1, value));

    return clampedValue <= 0.0031308
        ? 12.92 * clampedValue
        : 1.055 * Math.pow(clampedValue, 1 / 2.4) - 0.055;
};

export function oklchToRgbMath(input: string, alphaFallback = 1) {
    const match = input.match(OKLCH_PATTERN);

    if (!match) {
        return input;
    }

    const lightness = Number.parseFloat(match[1]);
    const chroma = Number.parseFloat(match[2]);
    const hue = Number.parseFloat(match[3]);
    const alpha =
        match[4] !== undefined ? Number.parseFloat(match[4]) : alphaFallback;
    const hueRadians = (hue * Math.PI) / 180;
    const a = chroma * Math.cos(hueRadians);
    const b = chroma * Math.sin(hueRadians);

    const l = Math.pow(lightness + 0.3963377774 * a + 0.2158037573 * b, 3);
    const m = Math.pow(lightness - 0.1055613458 * a - 0.0638541728 * b, 3);
    const s = Math.pow(lightness - 0.0894841775 * a - 1.291485548 * b, 3);

    const red = Math.round(
        toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s) * 255,
    );
    const green = Math.round(
        toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s) * 255,
    );
    const blue = Math.round(
        toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s) * 255,
    );

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
