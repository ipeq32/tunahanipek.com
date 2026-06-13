FROM node:22-alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_* degerleri build aninda client bundle'a gomulur; prod URL'leri buradan verilmeli.
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_ALLOW_PUBLIC_REGISTRATION=true
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ARG NEXT_PUBLIC_GOOGLE_ONE_TAP_ENABLED=false
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_ALLOW_PUBLIC_REGISTRATION=$NEXT_PUBLIC_ALLOW_PUBLIC_REGISTRATION
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_ONE_TAP_ENABLED=$NEXT_PUBLIC_GOOGLE_ONE_TAP_ENABLED
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate && yarn build

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["yarn", "start"]
