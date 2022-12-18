FROM node:16-alpine

## for tests
RUN mkdir -p /data

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install --global --unsafe-perm sequelize-cli sqlite3

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000
CMD [ "node", "server.js" ]
