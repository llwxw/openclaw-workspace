#!/bin/bash
# Vercel 环境变量管理脚本

PROJECT=""
ACTION="list"
KEY=""
VALUE=""
ENV="production"

while [[ $# -gt 0 ]]; do
  case $1 in
    --project) PROJECT="$2"; shift 2 ;;
    --list) ACTION="list"; shift ;;
    --set) ACTION="set"; shift ;;
    --delete) ACTION="delete"; shift ;;
    --key) KEY="$2"; shift 2 ;;
    --value) VALUE="$2"; shift 2 ;;
    --env) ENV="$2"; shift 2 ;;
    *) shift ;;
  esac
done

TOKEN=${VERCEL_TOKEN:-""}
if [ -z "$TOKEN" ]; then
  echo "Error: VERCEL_TOKEN not set"
  exit 1
fi

case $ACTION in
  list)
    curl -s "https://api.vercel.com/v6/projects/$PROJECT/env" \
      -H "Authorization: Bearer $TOKEN" | jq '.env[] | "\(.key)=\(.value)"'
    ;;
  set)
    curl -s -X POST "https://api.vercel.com/v6/projects/$PROJECT/env" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"key\":\"$KEY\",\"value\":\"$VALUE\",\"target\":[\"$ENV\"]}"
    ;;
  delete)
    curl -s -X DELETE "https://api.vercel.com/v6/projects/$PROJECT/env/$KEY" \
      -H "Authorization: Bearer $TOKEN"
    ;;
esac
