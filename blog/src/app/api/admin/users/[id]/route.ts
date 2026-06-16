import { auth } from '@/auth';
import { AdminUserMutationError } from '@/lib/admin/users/guards';
import { isSuperAdmin } from '@/lib/auth-roles';
import {
  softDeleteAdminUser,
  updateAdminUserRole,
} from '@/lib/data/users';
import { logger } from '@/lib/logger';
import { updateAdminUserRoleSchema } from '@/lib/validations/admin-user';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function mutationErrorResponse(error: AdminUserMutationError) {
  return NextResponse.json({ error: error.code }, { status: 409 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateAdminUserRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const data = await updateAdminUserRole(
      session.user.id,
      id,
      parsed.data.role
    );

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof AdminUserMutationError) {
      return mutationErrorResponse(error);
    }

    logger.error('Failed to update admin user role', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    await softDeleteAdminUser(session.user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminUserMutationError) {
      return mutationErrorResponse(error);
    }

    logger.error('Failed to delete admin user', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
