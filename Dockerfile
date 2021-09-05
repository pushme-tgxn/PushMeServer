FROM node:14-alpine

RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY . .

RUN npm install --production

EXPOSE 3000
CMD [ "npm", "run", "debug" ]
