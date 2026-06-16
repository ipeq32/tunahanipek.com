'use client';

import { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { cn } from '@/lib/utils';
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
};

type EditorMode = 'create' | 'edit' | null;

type RoleFormState = {
  name: string;
  slug: string;
  description: string;
  permissions: Permission[];
};

const EMPTY_FORM: RoleFormState = {
  name: '',
  slug: '',
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
}: AdminRolesEditorProps) {
  const t = useTranslations('Admin.Roles');
  const tPermissions = useTranslations('Admin.Roles.permissions');
  const [roles, setRoles] = useState<AccessRoleDto[]>(initialRoles);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<EditorMode>(null);
  const [editingRole, setEditingRole] = useState<AccessRoleDto | null>(null);
  const [form, setForm] = useState<RoleFormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AccessRoleDto | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      const res = await fetch('/api/admin/roles');
      if (!res.ok) throw new Error('Failed');
      const { data } = await res.json();
      setRoles(data);
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const openCreate = () => {
    setMode('create');
    setEditingRole(null);
    setForm(EMPTY_FORM);
  };

  const openEdit = (role: AccessRoleDto) => {
    if (role.isSystem) return;
    setMode('edit');
    setEditingRole(role);
    setForm({
      name: role.name,
      slug: role.slug,
      description: role.description ?? '',
      permissions: withDefaultRolePermissions(
        role.permissions.filter((item): item is Permission =>
          isValidPermission(item)
        )
      ),
    });
  };

  const closeEditor = () => {
    setMode(null);
    setEditingRole(null);
    setForm(EMPTY_FORM);
  };

  const togglePermission = (permission: Permission, checked: boolean) => {
    if (isDefaultRolePermission(permission)) return;

    setForm((prev) => ({
      ...prev,
      permissions: withDefaultRolePermissions(
        checked
          ? [...prev.permissions, permission]
          : prev.permissions.filter((item) => item !== permission)
      ),
    }));
  };

  const toggleGroup = (permissions: Permission[], checked: boolean) => {
    const optionalPermissions: Permission[] = permissions.filter(
      (permission) => !isDefaultRolePermission(permission)
    );

    if (!optionalPermissions.length) return;

    setForm((prev) => {
      if (checked) {
        return {
          ...prev,
          permissions: withDefaultRolePermissions([
            ...prev.permissions,
            ...optionalPermissions,
          ]),
        };
      }

      return {
        ...prev,
        permissions: withDefaultRolePermissions(
          prev.permissions.filter(
            (item) => !optionalPermissions.includes(item)
          )
        ),
      };
    });
  };

  const saveRole = async () => {
    const permissions = withDefaultRolePermissions(form.permissions);

    if (!form.name.trim()) {
      toast.error(t('validationError'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: mode === 'create' ? slugify(form.slug || form.name) : undefined,
        description: form.description.trim() || undefined,
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

      const { data } = await res.json();
      setRoles((prev) =>
        mode === 'create'
          ? [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
          : prev.map((item) => (item.id === data.id ? data : item))
      );
      toast.success(mode === 'create' ? t('created') : t('updated'));
      closeEditor();
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

      setRoles((prev) => prev.filter((role) => role.id !== deleteTarget.id));
      toast.success(t('deleted'));
      setDeleteTarget(null);
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role-name">{t('name')}</Label>
                <Input
                  id="role-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                      slug:
                        mode === 'create' && !prev.slug
                          ? slugify(event.target.value)
                          : prev.slug,
                    }))
                  }
                />
              </div>

              {mode === 'create' && (
                <div className="space-y-2">
                  <Label htmlFor="role-slug">{t('slug')}</Label>
                  <Input
                    id="role-slug"
                    value={form.slug}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, slug: event.target.value }))
                    }
                  />
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="role-description">{t('descriptionLabel')}</Label>
                <Textarea
                  id="role-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>
            </div>

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
                  form.permissions.includes(permission)
                );
                const someChecked = optionalPermissions.some((permission) =>
                  form.permissions.includes(permission)
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
                            checked={form.permissions.includes(permission)}
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
            <Button onClick={saveRole} disabled={saving}>
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
