# frontend/Dockerfile
FROM nginx:1.26-alpine3.20

# تثبيت bash وتحديث النظام
RUN apk update && apk upgrade && apk add --no-cache bash && rm -rf /var/cache/apk/*

# إنشاء المجلدات المطلوبة
RUN mkdir -p /tmp/nginx /var/cache/nginx /var/run/nginx && \
    chown -R nginx:nginx /tmp/nginx /var/cache/nginx /var/run/nginx && \
    chmod -R 755 /tmp/nginx /var/cache/nginx /var/run/nginx

# نسخ ملفات الموقع
COPY dist /usr/share/nginx/html

# نسخ ملفات nginx conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# تعديل الصلاحيات
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx && \
    chmod -R 644 /etc/nginx/conf.d/*.conf && \
    chmod 644 /etc/nginx/nginx.conf

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]