FROM node:18-alphine AS builder

LABEL maintainer="Tunahan İPEK <tnhnipek@gmail.com>"

WORKDIR /usr/src/app/

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /usr/src/app/build /usr/share/nginx/html

EXPOSE 3000 80

CMD ["nginx", "-g", "daemon off;"]