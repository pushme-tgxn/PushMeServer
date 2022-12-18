FROM node:16-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk update && apk upgrade
RUN apk add --no-cache sqlite

RUN npm install 
RUN npm uninstall --save sqlite3 
RUN npm install --save sqlite3
RUN npm run build
RUN npm install --global --unsafe-perm sequelize-cli

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000
CMD [ "node", "server.js" ]
