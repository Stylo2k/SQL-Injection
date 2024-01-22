FROM node:20.10

WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . .
RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD npm start
