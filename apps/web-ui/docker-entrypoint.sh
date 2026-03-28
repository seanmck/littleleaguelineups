#!/bin/sh
if [ -z "$API_URL" ]; then
  echo "ERROR: API_URL environment variable is not set" >&2
  exit 1
fi
export PORT="${PORT:-80}"
echo "Starting nginx on port $PORT with API_URL=$API_URL"
envsubst '${API_URL} ${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
cat /etc/nginx/nginx.conf
exec nginx -g 'daemon off;'
