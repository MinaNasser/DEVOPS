# frontend/Dockerfile
FROM nginx:1.26-alpine3.20

# نسخ ملفات الـ frontend
COPY ./dist /usr/share/nginx/html

# نسخ config
COPY nginx.conf /etc/nginx/nginx.conf

COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]