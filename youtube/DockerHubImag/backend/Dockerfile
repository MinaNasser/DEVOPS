FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001

COPY package*.json ./

RUN npm install --production


EXPOSE 3001

CMD ["npm", "start"]