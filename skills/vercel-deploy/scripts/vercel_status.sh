#!/bin/bash
# Vercel 部署状态脚本

PROJECT=""
DEPLOYMENT=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --project) PROJECT="$2"; shift 2 ;;
    --deployment) DEPLOYMENT="$2"; shift 2 ;;
    *) shift ;;
  esac
done

TOKEN=${VERCEL_TOKEN:-""}

if [ -n "$DEPLOYMENT" ]; then
  curl -s "https://api.vercel.com/v6/deployments/$DEPLOYMENT" \
    -H "Authorization: Bearer $TOKEN" | jq '{state, url, created}'
elif [ -n "$PROJECT" ]; then
  curl -s "https://api.vercel.com/v6/deployments?project=$PROJECT&limit=1" \
    -H "Authorization: Bearer $TOKEN" | jq '.deployments[0] | {state, url, created}'
fi
