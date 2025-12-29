RESOURCE_GROUP="build2025"
APP_NAME="lineup-web-ui"
GH_REPO="https://github.com/seanmck/littleleaguelineups"

az staticwebapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --source $GH_REPO \
  --location "West US 2" \
  --branch main \
  --app-location "apps/web-ui" \
  --output-location "dist" \
  --login-with-github \

az staticwebapp appsettings set --name lineup-web-ui --setting-names "API_BASE=acaendpoint""