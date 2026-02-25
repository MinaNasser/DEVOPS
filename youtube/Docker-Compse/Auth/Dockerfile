FROM nginx:alpine

# Rename auth.html to index.html داخل container
COPY auth.html /usr/share/nginx/html/index.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]