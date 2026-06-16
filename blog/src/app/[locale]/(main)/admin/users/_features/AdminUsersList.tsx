'use client';

import { useCallback, useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AdminEmptyState,
  AdminListSkeleton,
  AdminRoleBadge,
} from '@/components/admin/admin-ui';
import type { AdminUserDto } from '@/lib/admin/users/types';
import type { AdminUserMutationErrorCode } from '@/lib/admin/users/types';
import { cn } from '@/lib/utils';
import { useFormatter, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  BookOpen,
  KeyRound,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Eye,
} from 'lucide-react';

const FALLBACK_AVATAR =
  'https://img.icons8.com/?size=100&id=21441&format=png&color=000000';

type RoleFilter = 'all' | 'USER' | 'ADMIN' | 'SUPER_ADMIN';

type AdminUsersListProps = {
  initialUsers: AdminUserDto[];
  currentUserId: string;
  canManage: boolean;
};

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-2xl font-bold tabular-nums',
          accent && 'text-teal-600 dark:text-teal-400'
        )}
      >
        {value}
      </p>
    </div>
  );
}

function OAuthProviderBadge({ provider }: { provider: string }) {
  const label = provider.charAt(0).toUpperCase() + provider.slice(1);
  return (
    <Badge variant="outline" className="text-[10px] capitalize">
      {label}
    </Badge>
  );
}

export default function AdminUsersList({
  initialUsers,
  currentUserId,
  canManage,
}: AdminUsersListProps) {
  const t = useTranslations('Admin.Users');
  const format = useFormatter();
  const [users, setUsers] = useState<AdminUserDto[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<AdminUserDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  const resolveMutationError = useCallback(
    (code: string) => {
      const knownCodes: AdminUserMutationErrorCode[] = [
        'SELF_ROLE_CHANGE_FORBIDDEN',
        'LAST_SUPER_ADMIN_FORBIDDEN',
        'SELF_DELETE_FORBIDDEN',
        'USER_NOT_FOUND',
        'USER_MANAGEMENT_FORBIDDEN',
      ];

      if (knownCodes.includes(code as AdminUserMutationErrorCode)) {
        return t(`errors.${code as AdminUserMutationErrorCode}`);
      }

      return t('actionError');
    },
    [t]
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed');
      const { data } = await res.json();
      setUsers(data);
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const updateRole = async (user: AdminUserDto, role: AdminUserDto['role']) => {
    if (user.role === role) return;

    setUpdatingRoleId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed');
      }

      const { data } = await res.json();
      setUsers((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      toast.success(t('roleUpdated'));
    } catch (error) {
      const message =
        error instanceof Error
          ? resolveMutationError(error.message)
          : t('actionError');
      toast.error(message);
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed');
      }

      setUsers((prev) => prev.filter((user) => user.id !== deleteTarget.id));
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

  const stats = useMemo(() => {
    const admins = users.filter(
      (user) => user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    ).length;
    return {
      total: users.length,
      admins,
      members: users.length - admins,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesQuery =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      return matchesRole && matchesQuery;
    });
  }, [users, search, roleFilter]);

  const roleFilters: { value: RoleFilter; label: string }[] = [
    { value: 'all', label: t('filterAll') },
    { value: 'USER', label: t('roles.USER') },
    { value: 'ADMIN', label: t('roles.ADMIN') },
    { value: 'SUPER_ADMIN', label: t('roles.SUPER_ADMIN') },
  ];

  const roleOptions: AdminUserDto['role'][] = ['USER', 'ADMIN', 'SUPER_ADMIN'];

  return (
    <div className="mt-6 space-y-5">
      {!canManage && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          <Eye className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t('viewOnlyNotice')}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <StatCard label={t('statTotal')} value={stats.total} />
        <StatCard label={t('statAdmins')} value={stats.admins} accent />
        <StatCard label={t('statMembers')} value={stats.members} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border/60 bg-card/60 p-0.5">
            {roleFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setRoleFilter(filter.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  roleFilter === filter.value
                    ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={fetchUsers}
            aria-label={t('refresh')}
            title={t('refresh')}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <AdminListSkeleton rows={4} />
      ) : !users.length ? (
        <AdminEmptyState message={t('empty')} />
      ) : !filteredUsers.length ? (
        <AdminEmptyState message={t('noResults')} />
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const isSelf = user.id === currentUserId;
            const initials = user.name.charAt(0).toUpperCase();

            return (
              <div
                key={user.id}
                className="group flex flex-col gap-4 rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm transition hover:border-teal-500/30 lg:flex-row lg:items-center"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                  <Avatar className="h-12 w-12 shrink-0 ring-2 ring-border/60">
                    <AvatarImage
                      src={user.image || FALLBACK_AVATAR}
                      alt={user.name}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold leading-tight">{user.name}</p>
                      <AdminRoleBadge
                        role={user.role}
                        label={t(`roles.${user.role}`)}
                      />
                      {isSelf && (
                        <Badge variant="accent" className="text-[10px]">
                          {t('you')}
                        </Badge>
                      )}
                      {user.emailVerified && (
                        <Badge variant="outline" className="gap-1 text-[10px]">
                          <ShieldCheck className="h-3 w-3" />
                          {t('verified')}
                        </Badge>
                      )}
                    </div>

                    <p className="truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <UserRound className="h-3.5 w-3.5" />
                        <time dateTime={user.createdAt}>
                          {format.dateTime(new Date(user.createdAt), {
                            dateStyle: 'medium',
                          })}
                        </time>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {t('blogCount', { count: user.blogCount })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {t('commentCount', { count: user.commentCount })}
                      </span>
                      {user.hasPassword && (
                        <span className="inline-flex items-center gap-1">
                          <KeyRound className="h-3.5 w-3.5" />
                          {t('hasPassword')}
                        </span>
                      )}
                    </div>

                    {user.oauthProviders.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {user.oauthProviders.map((provider) => (
                          <OAuthProviderBadge key={provider} provider={provider} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                    <Select
                      value={user.role}
                      disabled={updatingRoleId === user.id}
                      onValueChange={(value) =>
                        updateRole(user, value as AdminUserDto['role'])
                      }
                    >
                      <SelectTrigger className="h-9 w-[160px] border-border/60 bg-background/80 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {t(`roles.${role}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-9 w-9"
                      disabled={isSelf}
                      onClick={() => setDeleteTarget(user)}
                      aria-label={t('delete')}
                      title={isSelf ? t('cannotDeleteSelf') : t('delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
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
