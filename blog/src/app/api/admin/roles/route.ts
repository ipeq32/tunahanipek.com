import { AccessRoleMutationError } from '@/lib/admin/roles/guards';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { requirePermission } from '@/lib/auth/guards';
import {
  createAccessRole,
  getAccessRolesPaginated,
} from '@/lib/data/access-roles';
import { logger } from '@/lib/logger';
import { parsePaginationFromRequest } from '@/lib/pagination';
import { createAccessRoleSchema } from '@/lib/validations/access-role';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function mutationErrorResponse(error: AccessRoleMutationError) {
  const status = error.code === 'ROLE_SLUG_EXISTS' ? 409 : 400;
  return NextResponse.json({ error: error.code }, { status });
}

export async function GET(request: Request) {
  const context = await requirePermission(PERMISSIONS['role:read']);
  if (!context) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { page, limit } = parsePaginationFromRequest(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? undefined;
    const result = await getAccessRolesPaginated(page, limit, search);

    return NextResponse.json({
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Failed to fetch access roles', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const context = await requirePermission(PERMISSIONS['role:create']);
  if (!context) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createAccessRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const data = await createAccessRole(parsed.data);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof AccessRoleMutationError) {
      return mutationErrorResponse(error);
    }

    logger.error('Failed to create access role', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
