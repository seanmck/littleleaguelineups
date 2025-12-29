#!/bin/bash

# Variables
RESOURCE_GROUP="build2025"
ENVIRONMENT="lineup-env"
CONTAINER_APP_NAME="lineup-container-app"
IMAGE="build2025acr.azurecr.io/littleleaguelineupbuildapi:0.2.3" # Replace with your container image
CPU="0.5"
MEMORY="1.0Gi"

# Create the container app
az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT \
  --image $IMAGE \
  --cpu $CPU \
  --memory $MEMORY \
  --ingress external \
  --target-port 80