'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataPagination } from '@/components/ui/data-pagination';
import {
  Form,
  FormControl,
  FormField,
  FormFieldFooter,
  FormItem,
  FormLabel,
  FormMessage,
  FormRequiredIndicator,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import {
  AdminEmptyState,
  AdminListSkeleton,
} from '@/components/admin/admin-ui';
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
  isDefaultRolePermission,
  isValidPermission,
  withDefaultRolePermissions,
  type Permission,
} from '@/lib/auth/permissions';
import type { AccessRoleDto } from '@/lib/admin/roles/types';
import type { AccessRoleMutationErrorCode } from '@/lib/admin/roles/types';
import { type PageSize, type PaginationMeta } from '@/lib/pagination';
import {
  createRoleFormSchema,
  updateRoleFormSchema,
  type CreateRoleFormValues,
  type UpdateRoleFormValues,
} from '@/lib/validations/access-role';
import { cn } from '@/lib/utils';
import { CharacterCount } from '@/components/ui/character-count';
import { FIELD_LIMITS, LIVE_FORM_OPTIONS } from '@/lib/form/field-limits';
import { useFormSubmitDisabled } from '@/lib/form/submit-state';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';

type AdminRolesEditorProps = {
  initialRoles: AccessRoleDto[];
  initialPagination: PaginationMeta;
};

type EditorMode = 'create' | 'edit' | null;

const EMPTY_CREATE_FORM: CreateRoleFormValues = {
  name: '',
  slug: '',
  description: '',
  permissions: [...DEFAULT_ROLE_PERMISSIONS],
};

const EMPTY_UPDATE_FORM: UpdateRoleFormValues = {
  name: '',
  description: '',
  permissions: [...DEFAULT_ROLE_PERMISSIONS],
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function PermissionCheckbox({
  checked,
  indeterminate,
  disabled,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      ref={(element) => {
        if (element) {
          element.indeterminate = Boolean(indeterminate);
        }
      }}
      onChange={(event) => onChange(event.target.checked)}
      className={cn(
        'mt-0.5 h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500/30',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    />
  );
}

export default function AdminRolesEditor({
  initialRoles,
  initialPagination,
}: AdminRolesEditorProps) {
  const t = useTranslations('Admin.Roles');
  const tPermissions = useTranslations('Admin.Roles.permissions');
  const [roles, setRoles] = useState<AccessRoleDto[]>(initialRoles);
  const [pagination, setPagination] = useState(initialPagination);
  const [page, setPage] = useState(initialPagination.page);
  const [limit, setLimit] = useState<PageSize>(initialPagination.limit);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<EditorMode>(null);
  const [editingRole, setEditingRole] = useState<AccessRoleDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AccessRoleDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fieldErrorMessages = useMemo(
    () => ({
      nameMin: t('fieldErrors.nameMin'),
      nameMax: t('fieldErrors.nameMax'),
      slugMin: t('fieldErrors.slugMin'),
      slugMax: t('fieldErrors.slugMax'),
      slugInvalid: t('fieldErrors.slugInvalid'),
      descriptionMax: t('fieldErrors.descriptionMax'),
    }),
    [t]
  );

  const createSchema = useMemo(
    () => createRoleFormSchema(fieldErrorMessages),
    [fieldErrorMessages]
  );
  const updateSchema = useMemo(
    () => updateRoleFormSchema(fieldErrorMessages),
    [fieldErrorMessages]
  );

  const createForm = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: EMPTY_CREATE_FORM,
    ...LIVE_FORM_OPTIONS,
  });

  const editForm = useForm<UpdateRoleFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: EMPTY_UPDATE_FORM,
    ...LIVE_FORM_OPTIONS,
  });

  const submitDisabled = useFormSubmitDisabled(
    mode === 'edit' ? editForm.control : createForm.control,
    saving || !mode,
  );

  const resolveMutationError = useCallback(
    (code: string) => {
      const knownCodes: AccessRoleMutationErrorCode[] = [
        'ROLE_NOT_FOUND',
        'ROLE_SLUG_EXISTS',
        'ROLE_SYSTEM_IMMUTABLE',
        'ROLE_IN_USE',
        'ROLE_PERMISSION_FORBIDDEN',
        'INVALID_PERMISSIONS',
      ];

      if (knownCodes.includes(code as AccessRoleMutationErrorCode)) {
        return t(`errors.${code as AccessRoleMutationErrorCode}`);
      }

      return t('actionError');
    },
    [t]
  );

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`/api/admin/roles?${params.toString()}`);
      if (!res.ok) throw new Error('Failed');
      const body = await res.json();
      setRoles(body.data);
      setPagination(body.pagination);
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [limit, page, t]);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  const openCreate = () => {
    setMode('create');
    setEditingRole(null);
    createForm.reset(EMPTY_CREATE_FORM);
    void createForm.trigger();
  };

  const openEdit = (role: AccessRoleDto) => {
    if (role.isSystem) return;
    setMode('edit');
    setEditingRole(role);
    editForm.reset({
      name: role.name,
      description: role.description ?? '',
      permissions: withDefaultRolePermissions(
        role.permissions.filter((item): item is Permission =>
          isValidPermission(item)
        )
      ),
    });
    void editForm.trigger();
  };

  const closeEditor = () => {
    setMode(null);
    setEditingRole(null);
    createForm.reset(EMPTY_CREATE_FORM);
    editForm.reset(EMPTY_UPDATE_FORM);
  };

  const formPermissions =
    mode === 'create'
      ? createForm.watch('permissions')
      : editForm.watch('permissions');

  const setFormPermissions = (permissions: Permission[]) => {
    const next = withDefaultRolePermissions(permissions);
    if (mode === 'create') {
      createForm.setValue('permissions', next, { shouldValidate: true });
      return;
    }
    editForm.setValue('permissions', next, { shouldValidate: true });
  };

  const togglePermission = (permission: Permission, checked: boolean) => {
    if (isDefaultRolePermission(permission)) return;

    setFormPermissions(
      checked
        ? [...formPermissions, permission]
        : formPermissions.filter((item) => item !== permission)
    );
  };

  const toggleGroup = (permissions: Permission[], checked: boolean) => {
    const optionalPermissions: Permission[] = permissions.filter(
      (permission) => !isDefaultRolePermission(permission)
    );

    if (!optionalPermissions.length) return;

    if (checked) {
      setFormPermissions([...formPermissions, ...optionalPermissions]);
      return;
    }

    setFormPermissions(
      formPermissions.filter((item) => !optionalPermissions.includes(item))
    );
  };

  const saveRole = async (
    values: CreateRoleFormValues | UpdateRoleFormValues
  ) => {
    const permissions = withDefaultRolePermissions(values.permissions);

    setSaving(true);
    try {
      const payload =
        mode === 'create'
          ? {
              name: values.name.trim(),
              slug: slugify(
                (values as CreateRoleFormValues).slug || values.name
              ),
              description: values.description?.trim() || undefined,
              permissions,
            }
          : {
              name: values.name.trim(),
              description: values.description?.trim() || undefined,
              permissions,
            };

      const res = await fetch(
        mode === 'create'
          ? '/api/admin/roles'
          : `/api/admin/roles/${editingRole?.id}`,
        {
          method: mode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            mode === 'create'
              ? payload
              : {
                  name: payload.name,
                  description: payload.description ?? null,
                  permissions: payload.permissions,
                }
          ),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed');
      }

      await res.json();
      toast.success(mode === 'create' ? t('created') : t('updated'));
      closeEditor();
      void fetchRoles();
    } catch (error) {
      const message =
        error instanceof Error
          ? resolveMutationError(error.message)
          : t('actionError');
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/roles/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed');
      }

      toast.success(t('deleted'));
      setDeleteTarget(null);
      void fetchRoles();
    } catch (error) {
      const message =
        error instanceof Error
          ? resolveMutationError(error.message)
          : t('actionError');
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: roles.length,
      custom: roles.filter((role) => !role.isSystem).length,
      assigned: roles.reduce((sum, role) => sum + role.userCount, 0),
    }),
    [roles]
  );

  return (
    <div className="mt-6 space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t('statTotal')}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t('statCustom')}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-teal-600 dark:text-teal-400">
            {stats.custom}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t('statAssigned')}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{stats.assigned}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t('helperText')}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={fetchRoles}
            aria-label={t('refresh')}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('createRole')}
          </Button>
        </div>
      </div>

      <Sheet
        open={Boolean(mode)}
        onOpenChange={(open) => {
          if (!open) closeEditor();
        }}
      >
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 overflow-hidden border-border/60 bg-background p-0 sm:max-w-2xl"
        >
          <SheetHeader className="space-y-1 border-b border-border/60 px-6 py-5 text-left">
            <SheetTitle>
              {mode === 'create' ? t('createTitle') : t('editTitle')}
            </SheetTitle>
            <SheetDescription>{t('sheetDescription')}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {mode === 'create' ? (
              <Form {...createForm}>
                <form
                  id="role-editor-form"
                  className="space-y-5"
                  onSubmit={createForm.handleSubmit((values) =>
                    void saveRole(values)
                  )}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="role-name">
                            {t('name')}
                            <FormRequiredIndicator />
                          </FormLabel>
                          <FormControl>
                            <Input
                              id="role-name"
                              {...field}
                              onChange={(event) => {
                                const value = event.target.value;
                                field.onChange(value);
                                const currentSlug = createForm.getValues('slug');
                                if (!currentSlug) {
                                  createForm.setValue('slug', slugify(value), {
                                    shouldValidate: true,
                                  });
                                }
                              }}
                            />
                          </FormControl>
                          <FormFieldFooter>
                            <FormMessage />
                            <CharacterCount
                              value={field.value}
                              min={FIELD_LIMITS.role.name.min}
                              max={FIELD_LIMITS.role.name.max}
                            />
                          </FormFieldFooter>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="role-slug">
                            {t('slug')}
                            <FormRequiredIndicator />
                          </FormLabel>
                          <FormControl>
                            <Input id="role-slug" {...field} />
                          </FormControl>
                          <FormFieldFooter>
                            <FormMessage />
                            <CharacterCount
                              value={field.value}
                              min={FIELD_LIMITS.role.slug.min}
                              max={FIELD_LIMITS.role.slug.max}
                            />
                          </FormFieldFooter>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel htmlFor="role-description">
                            {t('descriptionLabel')}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              id="role-description"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormFieldFooter>
                            <FormMessage />
                            <CharacterCount
                              value={field.value ?? ''}
                              max={FIELD_LIMITS.role.description.max}
                            />
                          </FormFieldFooter>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            ) : mode === 'edit' ? (
              <Form {...editForm}>
                <form
                  id="role-editor-form"
                  className="space-y-5"
                  onSubmit={editForm.handleSubmit((values) =>
                    void saveRole(values)
                  )}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="role-name">
                            {t('name')}
                            <FormRequiredIndicator />
                          </FormLabel>
                          <FormControl>
                            <Input id="role-name" {...field} />
                          </FormControl>
                          <FormFieldFooter>
                            <FormMessage />
                            <CharacterCount
                              value={field.value}
                              min={FIELD_LIMITS.role.name.min}
                              max={FIELD_LIMITS.role.name.max}
                            />
                          </FormFieldFooter>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel htmlFor="role-description">
                            {t('descriptionLabel')}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              id="role-description"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormFieldFooter>
                            <FormMessage />
                            <CharacterCount
                              value={field.value ?? ''}
                              max={FIELD_LIMITS.role.description.max}
                            />
                          </FormFieldFooter>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            ) : null}

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{t('permissionsTitle')}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('defaultPermissionsHint')}
                </p>
              </div>

              <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm font-semibold">
                    {t('defaultPermissionsTitle')}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DEFAULT_ROLE_PERMISSIONS.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm opacity-90"
                    >
                      <PermissionCheckbox
                        checked
                        disabled
                        onChange={() => undefined}
                      />
                      <span>
                        <span className="font-medium">
                          {tPermissions(`items.${permission}.title`)}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {tPermissions(`items.${permission}.description`)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm font-medium text-muted-foreground">
                {t('optionalPermissionsTitle')}
              </p>

              {PERMISSION_GROUPS.map((group) => {
                const optionalPermissions: Permission[] = group.permissions.filter(
                  (permission) => !isDefaultRolePermission(permission)
                );

                if (!optionalPermissions.length) return null;

                const allChecked = optionalPermissions.every((permission) =>
                  formPermissions.includes(permission)
                );
                const someChecked = optionalPermissions.some((permission) =>
                  formPermissions.includes(permission)
                );

                return (
                  <div
                    key={group.key}
                    className="rounded-lg border border-border/60 bg-card/60 p-4"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <PermissionCheckbox
                        checked={allChecked}
                        indeterminate={someChecked && !allChecked}
                        onChange={(checked) =>
                          toggleGroup(group.permissions, checked)
                        }
                      />
                      <span className="text-sm font-semibold">
                        {tPermissions(group.labelKey)}
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {optionalPermissions.map((permission) => (
                        <label
                          key={permission}
                          className="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40"
                        >
                          <PermissionCheckbox
                            checked={formPermissions.includes(permission)}
                            onChange={(checked) =>
                              togglePermission(permission, checked)
                            }
                          />
                          <span>
                            <span className="font-medium">
                              {tPermissions(`items.${permission}.title`)}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {tPermissions(`items.${permission}.description`)}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <SheetFooter className="border-t border-border/60 px-6 py-4 sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="outline" onClick={closeEditor}>
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              form="role-editor-form"
              disabled={submitDisabled}
            >
              {saving ? t('saving') : t('save')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {loading ? (
        <AdminListSkeleton rows={4} />
      ) : !roles.length ? (
        <AdminEmptyState message={t('empty')} />
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm lg:flex-row lg:items-center"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <p className="font-semibold">{role.name}</p>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {role.slug}
                  </Badge>
                  {role.isSystem && (
                    <Badge variant="accent" className="gap-1 text-[10px]">
                      <Lock className="h-3 w-3" />
                      {t('systemRole')}
                    </Badge>
                  )}
                </div>

                {role.description && (
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {t('userCount', { count: role.userCount })}
                  </span>
                  <span>
                    {t('permissionCount', {
                      count: role.permissions.length,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:shrink-0">
                {!role.isSystem && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => openEdit(role)}
                      aria-label={t('edit')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-9 w-9"
                      disabled={role.userCount > 0}
                      onClick={() => setDeleteTarget(role)}
                      aria-label={t('delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DataPagination
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('deleteTitle')}
        description={t('deleteConfirm', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
