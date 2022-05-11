FROM node:16-alpine3.15 as production

# Install necessary packages
RUN apk update \
    && apk add --no-cache yarn curl bash

WORKDIR /app
ARG NODE_ENV=production
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json package-lock.json ./

RUN NODE_ENV=development npm install
COPY . .
RUN npm run build

ENTRYPOINT ["node", "dist/main"]
