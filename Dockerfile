FROM node:16-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install -g sequelize-cli sqlite3

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

VOLUME /usr/src/app/.data
EXPOSE 3000
CMD [ "node", "server.js" ]
