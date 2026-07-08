'use client';

import * as React from 'react';
import type * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  ControllerFieldState,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    isSubmitted: formState.isSubmitted,
    ...fieldState,
  };
};

export function shouldShowFieldError(
  fieldState: Pick<ControllerFieldState, 'error' | 'isDirty' | 'isTouched'>,
  isSubmitted = false,
): boolean {
  return Boolean(
    fieldState.error &&
      (fieldState.isDirty || fieldState.isTouched || isSubmitted),
  );
}

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, isDirty, isTouched, isSubmitted, formItemId } = useFormField();
  const showError = shouldShowFieldError({ error, isDirty, isTouched }, isSubmitted);

  return (
    <Label
      ref={ref}
      className={cn(showError && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const {
    error,
    isDirty,
    isTouched,
    isSubmitted,
    formItemId,
    formDescriptionId,
    formMessageId,
  } = useFormField();
  const showError = shouldShowFieldError({ error, isDirty, isTouched }, isSubmitted);

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !showError
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={showError}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, isDirty, isTouched, isSubmitted, formMessageId } = useFormField();
  const showError = shouldShowFieldError({ error, isDirty, isTouched }, isSubmitted);
  const body = showError ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

type DeferredFieldErrorProps = {
  fieldState: ControllerFieldState;
  className?: string;
};

function DeferredFieldError({ fieldState, className }: DeferredFieldErrorProps) {
  const { isSubmitted } = useFormState();
  const showError = shouldShowFieldError(fieldState, isSubmitted);

  if (!showError || !fieldState.error?.message) {
    return null;
  }

  return (
    <p className={cn('text-sm font-medium text-destructive', className)}>
      {fieldState.error.message}
    </p>
  );
}

function FormRequiredIndicator({ className }: { className?: string }) {
  return (
    <span className={cn('text-destructive', className)} aria-hidden="true">
      {' '}
      *
    </span>
  );
}

const FormFieldFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-start justify-between gap-3', className)}
    {...props}
  />
));
FormFieldFooter.displayName = 'FormFieldFooter';

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  DeferredFieldError,
  FormField,
  FormRequiredIndicator,
  FormFieldFooter,
};
