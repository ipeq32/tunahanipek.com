import { AccessRoleMutationError } from '@/lib/admin/roles/guards';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import {
  deleteAccessRole,
  getAccessRoleById,
  updateAccessRole,
} from '@/lib/data/access-roles';
import { logger } from '@/lib/logger';
import { updateAccessRoleSchema } from '@/lib/validations/access-role';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function mutationErrorResponse(error: AccessRoleMutationError) {
  const status =
    error.code === 'ROLE_NOT_FOUND'
      ? 404
      : error.code === 'ROLE_IN_USE'
        ? 409
        : 400;

  return NextResponse.json({ error: error.code }, { status });
}

export async function GET(_request: Request, context: RouteContext) {
  const authContext = await requirePermission(PERMISSIONS['role:read']);
  if (!authContext) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const data = await getAccessRoleById(id);

    if (!data) {
      return NextResponse.json({ error: 'ROLE_NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Failed to fetch access role', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const authContext = await requirePermission(PERMISSIONS['role:update']);
  if (!authContext) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateAccessRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const data = await updateAccessRole(id, parsed.data);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof AccessRoleMutationError) {
      return mutationErrorResponse(error);
    }

    logger.error('Failed to update access role', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authContext = await requirePermission(PERMISSIONS['role:delete']);
  if (!authContext) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    await deleteAccessRole(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AccessRoleMutationError) {
      return mutationErrorResponse(error);
    }

    logger.error('Failed to delete access role', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
