#!/bin/sh
set -e

if [ -n "$POSTGRES_PRISMA_URL" ]; then
  yarn prisma db push --skip-generate
fi

exec "$@"
