# Create ACA with system-assigned identity
az containerapp create \
  --name littleleague \
  --resource-group build2025 \
  --environment lineup-env \
  --image build2025acr.azurecr.io/littleleaguelineupbuildapi:0.2.3 \
  --cpu 0.5 \
  --memory 1.0Gi \
  --ingress external \
  --target-port 80 \
  --enable-managed-identity


# Create Postgres server
az postgres flexible-server create \
  --resource-group build2025 \
  --name littleleaguepgsqldb \
  --auth active-directory \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --location westus3 \
  --storage-size 32 \
  --version 15 