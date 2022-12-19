FROM node:16-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk update && apk upgrade
RUN apk add --no-cache sqlite

COPY package*.json ./

RUN npm ci
## --omit=dev

COPY . .

EXPOSE 3000
CMD [ "node", "server.js" ]
