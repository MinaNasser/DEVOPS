# frontend/Dockerfile
FROM nginx:alpine

# نسخ ملفات الموقع
COPY dist/ /usr/share/nginx/html/

# نسخ ملف تكوين Nginx المخصص
COPY nginx.conf /etc/nginx/nginx.conf

# تأكد من صلاحيات الملفات
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]