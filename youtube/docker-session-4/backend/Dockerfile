FROM node:20-alpine 

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production \ 
    PORT=3001
# Create a non-root user and group to run the application

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
# Copy package.json and package-lock.json to the working directoryds
COPY ./package*.json  ./

RUN npm install --production 

COPY --chown=nodejs:nodejs ./server.js  ./

EXPOSE  3001

USER nodejs

CMD [ "npm" , "start" ]