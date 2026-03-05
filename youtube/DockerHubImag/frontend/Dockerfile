# frontend/Dockerfile
FROM nginx:1.26-alpine3.20

COPY ./dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]