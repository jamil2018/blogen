"use client";

import { useMemo, useState } from "react";
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { Button, Input, Label, Popover } from "@heroui/react";
import { cn } from "../../lib/cn";
import type { ExploreComboBoxOption } from "./ExploreMultiComboBox";

type ExploreSingleComboBoxProps = {
  label: string;
  placeholder: string;
  emptyLabel: string;
  items: ExploreComboBoxOption[];
  selectedKey?: string;
  onSelectedKeyChange: (key: string | undefined) => void;
};

export default function ExploreSingleComboBox({
  label,
  placeholder,
  emptyLabel,
  items,
  selectedKey,
  onSelectedKeyChange,
}: ExploreSingleComboBoxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => item.label.toLowerCase().includes(normalized));
  }, [items, query]);

  const selectedLabel =
    items.find((item) => item.id === selectedKey)?.label ?? emptyLabel;

  const selectItem = (key: string | undefined) => {
    onSelectedKeyChange(key);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="min-w-0">
      <Label className="mb-1.5 block text-sm font-medium text-ink">{label}</Label>
      <Popover isOpen={open} onOpenChange={setOpen}>
        <Popover.Trigger className="w-full">
          <Button
            variant="ghost"
            className={cn(
              "h-9 w-full min-w-[12rem] justify-between rounded-lg border border-border bg-paper px-3 text-sm font-normal",
              !selectedKey && "text-muted",
            )}
          >
            <span className="truncate">{selectedLabel}</span>
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
            <ul className="max-h-52 overflow-y-auto py-1" role="listbox" aria-label={label}>
              <li role="option" aria-selected={!selectedKey}>
                <button
                  type="button"
                  onClick={() => selectItem(undefined)}
                  className={cn(
                    "block w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    !selectedKey && "bg-zinc-100 font-medium dark:bg-zinc-800",
                  )}
                >
                  {emptyLabel}
                </button>
              </li>
              {filteredItems.length ? (
                filteredItems.map((item) => (
                  <li key={item.id} role="option" aria-selected={selectedKey === item.id}>
                    <button
                      type="button"
                      onClick={() => selectItem(item.id)}
                      className={cn(
                        "block w-full truncate px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800",
                        selectedKey === item.id && "bg-zinc-100 font-medium dark:bg-zinc-800",
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                ))
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
