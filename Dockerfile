FROM node:16-alpine

RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY . .

RUN npm install

RUN adduser -S app
RUN chown -R app /opt/app
USER app

EXPOSE 3000
CMD [ "npm", "run", "debug" ]
