FROM node:18-bullseye AS build

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ unixodbc-dev libssl-dev
COPY package*.json ./
RUN npm install

COPY . .

FROM node:18-slim

WORKDIR /app

COPY --from=build /app /app

EXPOSE 3000
CMD ["node", "server.js"]
