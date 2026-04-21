#!/bin/bash
# Vercel 部署脚本

PROJECT=""
ENV="preview"

while [[ $# -gt 0 ]]; do
  case $1 in
    --project) PROJECT="$2"; shift 2 ;;
    --preview) ENV="preview"; shift ;;
    --production) ENV="production"; shift ;;
    *) shift ;;
  esac
done

if [ -z "$PROJECT" ]; then
  echo "Error: --project required"
  exit 1
fi

TOKEN=${VERCEL_TOKEN:-""}
if [ -z "$TOKEN" ]; then
  echo "Error: VERCEL_TOKEN not set"
  exit 1
fi

echo "Deploying $PROJECT to $ENV..."

if [ "$ENV" = "production" ]; then
  RESPONSE=$(curl -s -X deploy "https://api.vercel.com/v6/deployments" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$PROJECT\",\"production\":true}")
else
  RESPONSE=$(curl -s -X deploy "https://api.vercel.com/v6/deployments" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$PROJECT\"}")
fi

echo "$RESPONSE" | jq -r '.uid // .error.message'
