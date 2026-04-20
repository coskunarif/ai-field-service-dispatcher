FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
# Use the environment variable PORT provided by Railway
CMD sed -i "s/listen       80;/listen $PORT;/" /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"
