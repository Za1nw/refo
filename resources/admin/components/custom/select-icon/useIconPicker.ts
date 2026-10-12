import * as React from "react";

import { formatLabel, normalizeIconName } from "./utils";

type UseIconPickerParams = {
  value?: string | null;
  onChange: (value: string | null) => void;
  icons: readonly string[];
  aliases?: Record<string, string>;
  maxResults?: number;
};

export type IconOption = {
  name: string;
  label: string;
};

export function useIconPicker({
  value,
  onChange,
  icons,
  aliases = {},
  maxResults = 120,
}: UseIconPickerParams) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const normalizedValue = normalizeIconName(value, aliases);
  const [selectedName, setSelectedName] = React.useState(normalizedValue);

  React.useEffect(() => {
    setSelectedName(normalizedValue);
  }, [normalizedValue]);

  const options = React.useMemo(() => {
    const unique = Array.from(new Set(icons));

    return unique.map((name) => ({
      name,
      label: formatLabel(name),
    }));
  }, [icons]);

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return options.slice(0, maxResults);
    }

    const ranked = options
      .filter((item) => {
        return (
          item.name.toLowerCase().includes(query) ||
          item.label.toLowerCase().includes(query)
        );
      })
      .sort((left, right) => {
        const leftStarts = left.name.toLowerCase().startsWith(query);
        const rightStarts = right.name.toLowerCase().startsWith(query);

        if (leftStarts !== rightStarts) {
          return leftStarts ? -1 : 1;
        }

        return left.label.localeCompare(right.label);
      });

    return ranked.slice(0, maxResults);
  }, [maxResults, options, search]);

  const selected = options.find((item) => item.name === selectedName) ?? null;

  const typedName = normalizeIconName(search, aliases);
  const customOption =
    typedName && !options.some((item) => item.name === typedName)
      ? { name: typedName, label: formatLabel(typedName) }
      : null;

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSearch("");
    }
  };

  const selectIcon = (name: string) => {
    setSelectedName(name);
    onChange(name);
    onOpenChange(false);
  };

  const clearIcon = () => {
    setSelectedName("");
    onChange(null);
    onOpenChange(false);
  };

  const setCustomValue = (nextValue: string) => {
    setSelectedName(nextValue);
    onChange(nextValue);
    onOpenChange(false);
  };

  return {
    open,
    search,
    setSearch,
    onOpenChange,
    selected,
    selectedName,
    filtered,
    customOption,
    hasQuery: search.trim().length > 0,
    selectIcon,
    clearIcon,
    setCustomValue,
  };
}
