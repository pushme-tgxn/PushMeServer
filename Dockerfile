FROM node:16-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk update && apk upgrade
RUN apk add --no-cache sqlite

RUN npm install pm2 -g

COPY package*.json ./

RUN npm ci
## --omit=dev

COPY . .

EXPOSE 3000
CMD [ "sh", "./scripts/server-wrapper.sh" ]
