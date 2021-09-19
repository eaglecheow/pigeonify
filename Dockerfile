FROM node:alpine

RUN apk add --update alpine-sdk

RUN apk add --no-cache ffmpeg

RUN apk add --no-cache python3 

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "run", "devStart"]