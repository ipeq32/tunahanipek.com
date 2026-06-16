import { AdminUserMutationError } from '@/lib/admin/users/guards';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { requireAnyPermission } from '@/lib/auth/guards';
import {
  softDeleteAdminUser,
  updateAdminUserAccessRole,
} from '@/lib/data/users';
import { logger } from '@/lib/logger';
import { updateAdminUserAccessRoleSchema } from '@/lib/validations/admin-user';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function mutationErrorResponse(error: AdminUserMutationError) {
  return NextResponse.json({ error: error.code }, { status: 409 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await requireAnyPermission([
    PERMISSIONS['user:update-role'],
  ]);
  if (!authContext) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateAdminUserAccessRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const data = await updateAdminUserAccessRole(
      authContext.userId,
      id,
      parsed.data.accessRoleId
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
  const authContext = await requireAnyPermission([PERMISSIONS['user:delete']]);
  if (!authContext) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    await softDeleteAdminUser(authContext.userId, id);
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
