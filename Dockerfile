FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY robots.txt /usr/share/nginx/html/robots.txt
COPY sitemap.xml /usr/share/nginx/html/sitemap.xml
# Use the environment variable PORT provided by Railway
CMD sed -i "s/listen       80;/listen $PORT;/" /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"