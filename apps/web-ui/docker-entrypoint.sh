#!/bin/sh
if [ -z "$API_URL" ]; then
  echo "ERROR: API_URL environment variable is not set" >&2
  exit 1
fi
export PORT="${PORT:-80}"

# Extract nameserver from resolv.conf for nginx resolver directive
# Wrap IPv6 addresses in brackets as nginx requires
RESOLVER=$(awk '/^nameserver/{
  if ($2 ~ /:/) print "[" $2 "]"
  else print $2
  exit
}' /etc/resolv.conf)
export RESOLVER="${RESOLVER:-8.8.8.8}"

echo "Starting nginx on port $PORT with API_URL=$API_URL resolver=$RESOLVER"
envsubst '${API_URL} ${PORT} ${RESOLVER}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
cat /etc/nginx/nginx.conf
exec nginx -g 'daemon off;'
