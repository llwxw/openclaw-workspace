#!/bin/bash
# Vercel 日志脚本

DEPLOYMENT=""
PROJECT=""
FUNCTION=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --deployment) DEPLOYMENT="$2"; shift 2 ;;
    --project) PROJECT="$2"; shift 2 ;;
    --function) FUNCTION="$2"; shift 2 ;;
    *) shift ;;
  esac
done

TOKEN=${VERCEL_TOKEN:-""}

if [ -n "$DEPLOYMENT" ]; then
  curl -s "https://api.vercel.com/v6/deployments/$DEPLOYMENT/events" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.[] | .text'
elif [ -n "$PROJECT" ]; then
  curl -s "https://api.vercel.com/v6/deployments?project=$PROJECT&limit=1" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.deployments[0].uid' | \
    xargs -I {} curl -s "https://api.vercel.com/v6/deployments/{}/events" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.[] | .text'
fi
