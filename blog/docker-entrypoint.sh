#!/bin/sh
set -e

if [ -n "$POSTGRES_PRISMA_URL" ]; then
  if [ "$NODE_ENV" = "production" ]; then
    # Uretimde versiyonlanmis migration'lari uygula; schema drift'i onler.
    yarn prisma migrate deploy
  else
    yarn prisma db push --skip-generate
  fi
fi

exec "$@"
