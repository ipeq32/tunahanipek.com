"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { MenuItem, PopoverMenu } from "./PopoverMenu";

type ThemeValue = "light" | "dark" | "system";

export function ToggleTheme() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("ThemeSwitcher");

  const options: Array<{
    value: ThemeValue;
    label: string;
    icon: typeof Sun;
  }> = [
    { value: "light", label: t("light"), icon: Sun },
    { value: "dark", label: t("dark"), icon: Moon },
    { value: "system", label: t("system"), icon: Monitor },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <PopoverMenu
      label={t("toggleAria")}
      trigger={
        <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground">
          <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </span>
      }
    >
      <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
        {t("label")}
      </p>
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = mounted && theme === value;
        return (
          <MenuItem
            key={value}
            active={isActive}
            onSelect={() => setTheme(value)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {isActive ? <Check className="h-4 w-4 text-accent" /> : null}
          </MenuItem>
        );
      })}
    </PopoverMenu>
  );
}
