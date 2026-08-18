"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { Button } from "@heroui/react";
import { useThemeMode } from "./ThemeProvider";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useThemeMode();

  return (
    <Button
      isIconOnly
      variant="ghost"
      size="sm"
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      onPress={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-4" weight="bold" />
      ) : (
        <Moon className="size-4" weight="bold" />
      )}
    </Button>
  );
}
