FROM node:16.15.1-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

#RUN echo "{}" > ./stats.json

CMD [ "node", "index.js" ]
