#!/bin/bash

# クイックデプロイ（確認なし）
echo "🚀 クイックデプロイ開始..."

# 必要なファイルのみS3にアップロード
aws s3 sync . s3://shima-game-1/delivery_game \
    --region ap-northeast-1 \
    --delete \
    --exclude "convert/*" \
    --exclude "*.md" \
    --exclude ".git*" \
    --exclude "*.sh" \
    --exclude ".DS_Store" \
    --cache-control "public, max-age=3600"

# HTMLファイルのキャッシュを短く設定
aws s3 cp index.html s3://shima-game-1/delivery_game/index.html \
    --region ap-northeast-1 \
    --cache-control "public, max-age=300" \
    --content-type "text/html; charset=utf-8"

# CloudFrontキャッシュ削除
aws cloudfront create-invalidation \
    --distribution-id E26QFH1RMES7YV \
    --paths "/delivery_game/*" \
    --no-cli-pager

echo "✅ デプロイ完了！"
