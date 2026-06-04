'use client';

import dynamic from 'next/dynamic';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';
import { Loader2, X } from 'lucide-react';
import { Dialog, DialogPortal } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { AddressFormValues } from '@/lib/address/types';

const AddressMapPicker = dynamic(() => import('./AddressMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  ),
});

type AddressMapModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: Pick<
    AddressFormValues,
    'latitude' | 'longitude' | 'formattedMapAddress'
  >;
  onConfirm: (patch: Partial<AddressFormValues>) => void;
};

export default function AddressMapModal({
  open,
  onOpenChange,
  initialValues,
  onConfirm,
}: AddressMapModalProps) {
  const t = useTranslations('Address.map');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-[300] bg-black/75 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[301] flex w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden',
            'rounded-xl border border-border bg-card shadow-2xl outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'max-h-[min(88vh,640px)]'
          )}
          style={{ height: 'auto' }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
            <div className="min-w-0 space-y-0.5">
              <DialogPrimitive.Title className="text-base font-semibold leading-tight">
                {t('title')}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-xs text-muted-foreground">
                {t('description')}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t('cancel')}
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          {open && (
            <AddressMapPicker
              initialLat={initialValues.latitude}
              initialLon={initialValues.longitude}
              initialLabel={initialValues.formattedMapAddress}
              onCancel={() => onOpenChange(false)}
              onConfirm={(patch) => {
                onConfirm(patch);
                onOpenChange(false);
              }}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
