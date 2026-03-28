#!/bin/sh
if [ -z "$API_URL" ]; then
  echo "ERROR: API_URL environment variable is not set" >&2
  exit 1
fi
envsubst '${API_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
exec nginx -g 'daemon off;'
