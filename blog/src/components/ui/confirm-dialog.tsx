'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  destructive?: boolean;
  confirmVariant?: 'accent' | 'destructive' | 'default';
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading = false,
  destructive = true,
  confirmVariant,
}: ConfirmDialogProps) {
  const resolvedConfirmVariant =
    confirmVariant ?? (destructive ? 'destructive' : 'accent');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-none h-auto max-w-md gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-2 px-6 pb-2 pt-6 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter
          className={cn(
            'mt-4 flex flex-col-reverse gap-2 border-t border-border/50',
            'bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end sm:space-x-0'
          )}
        >
          <Button
            type="button"
            variant="outline"
            className="bg-background/80"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={resolvedConfirmVariant}
            onClick={() => void onConfirm()}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
