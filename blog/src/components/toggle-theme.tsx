'use client';

import { useEffect, useState } from 'react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type ThemeOption = {
  value: 'light' | 'dark' | 'system';
  label: string;
  icon: typeof Sun;
};

const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ToggleTheme() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Toggle theme"
        className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground shadow-sm backdrop-blur transition-all hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-44 rounded-xl border-border/60 bg-popover/95 p-1.5 shadow-lg backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
          Tema
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/60" />
        {themeOptions.map(({ value, label, icon: Icon }) => {
          const isActive = mounted && theme === value;

          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-teal-500/10 font-medium text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  isActive && 'text-teal-600 dark:text-teal-400',
                )}
              />
              <span className="flex-1">{label}</span>
              {isActive && <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
