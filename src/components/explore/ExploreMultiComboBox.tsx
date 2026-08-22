"use client";

import { useMemo, useState } from "react";
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { Button, Checkbox, Input, Label, Popover } from "@heroui/react";
import { cn } from "../../lib/cn";

export type ExploreComboBoxOption = {
  id: string;
  label: string;
};

type ExploreMultiComboBoxProps = {
  label: string;
  placeholder: string;
  items: ExploreComboBoxOption[];
  selectedKeys: string[];
  onSelectedKeysChange: (keys: string[]) => void;
};

function triggerLabel(
  selectedKeys: string[],
  items: ExploreComboBoxOption[],
  emptyLabel: string,
): string {
  if (selectedKeys.length === 0) return emptyLabel;
  if (selectedKeys.length === 1) {
    return items.find((item) => item.id === selectedKeys[0])?.label ?? "1 selected";
  }
  return `${selectedKeys.length} selected`;
}

export default function ExploreMultiComboBox({
  label,
  placeholder,
  items,
  selectedKeys,
  onSelectedKeysChange,
}: ExploreMultiComboBoxProps) {
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => item.label.toLowerCase().includes(normalized));
  }, [items, query]);

  const toggleItem = (id: string, checked: boolean) => {
    if (checked) {
      onSelectedKeysChange([...new Set([...selectedKeys, id])]);
      return;
    }
    onSelectedKeysChange(selectedKeys.filter((key) => key !== id));
  };

  const emptyLabel = placeholder.replace(/^Search /i, "Select ");

  return (
    <div className="min-w-0">
      <Label className="mb-1.5 block text-sm font-medium text-ink">{label}</Label>
      <Popover>
        <Popover.Trigger className="w-full">
          <Button
            variant="ghost"
            className={cn(
              "h-9 w-full min-w-[12rem] justify-between rounded-lg border border-border bg-paper px-3 text-sm font-normal",
              selectedKeys.length === 0 && "text-muted",
            )}
          >
            <span className="truncate">
              {triggerLabel(selectedKeys, items, emptyLabel)}
            </span>
            <CaretDown className="size-4 shrink-0 opacity-70" aria-hidden />
          </Button>
        </Popover.Trigger>
        <Popover.Content
          placement="bottom start"
          className="w-72 max-w-[calc(100vw-2rem)] p-0"
        >
          <Popover.Dialog className="p-0">
            <div className="border-b border-border p-2">
              <div className="relative">
                <MagnifyingGlass
                  className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-8"
                  aria-label={`Search ${label.toLowerCase()}`}
                />
              </div>
            </div>
            <ul
              className="max-h-52 overflow-y-auto py-1"
              role="listbox"
              aria-label={label}
              aria-multiselectable="true"
            >
              {filteredItems.length ? (
                filteredItems.map((item) => {
                  const checked = selectedKeys.includes(item.id);
                  return (
                    <li key={item.id} role="option" aria-selected={checked}>
                      <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <Checkbox
                          isSelected={checked}
                          onChange={(selected) => toggleItem(item.id, selected)}
                          aria-label={item.label}
                        />
                        <span className="truncate">{item.label}</span>
                      </label>
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-3 text-sm text-muted">No matches found</li>
              )}
            </ul>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </div>
  );
}
