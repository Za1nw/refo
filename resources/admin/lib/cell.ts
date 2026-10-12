// import { useTranslation } from "react-i18next";

import { i18n } from "@/i18n";

export function formatterNumber(value: number | string, currency = "YER") {
    const num = typeof value === "string" ? Number(value) : value;
    if (!Number.isFinite(num)) return String(value);
    const formatter = new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: currency,
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    const parts = formatter.format(Number(num));
    // const valueOnly = parts.filter(p => p.type !== "currency").map(p => p.value).join("").trim();
    return parts;
}

