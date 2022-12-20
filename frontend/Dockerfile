FROM node:alpine
ENV NODE_OPTIONS=--openssl-legacy-provider
ENV CI=true
ENV WDS_SOCKET_PORT=0
WORKDIR /app

COPY ./package.json ./

RUN npm install

COPY ./ ./

CMD ["npm", "start"]