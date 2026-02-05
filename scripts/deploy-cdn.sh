#!/bin/bash

set -e

# Drop.js SDK CDN Deployment Script
# Deploys UMD bundle to CDN with versioned and latest paths

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Error: Version argument is required"
  echo "Usage: ./deploy-cdn.sh <version>"
  echo "Example: ./deploy-cdn.sh 0.1.0"
  exit 1
fi

if [ -z "$CDN_UPLOAD_KEY" ]; then
  echo "Error: CDN_UPLOAD_KEY environment variable is required"
  exit 1
fi

echo "Deploying Drop.js SDK v$VERSION to CDN..."

# Verify build exists
if [ ! -f "dist/drop.umd.cjs" ]; then
  echo "Error: dist/drop.umd.cjs not found. Run 'npm run build' first."
  exit 1
fi

# Copy UMD bundle to .js extension for CDN
cp dist/drop.umd.cjs dist/drop.js

# CDN Configuration
# Replace these values with your actual CDN provider settings
CDN_BUCKET="drop-cdn"
CDN_REGION="auto"
CDN_ENDPOINT="https://YOUR_CDN_ENDPOINT"

# Versioned path (immutable, 1-year cache)
VERSIONED_PATH="sdk/$VERSION/drop.js"
echo "Uploading to versioned path: $VERSIONED_PATH"

# Example for AWS S3 / Cloudflare R2 (S3-compatible)
# Uncomment and configure based on your CDN provider:

# aws s3 cp dist/drop.js \
#   s3://$CDN_BUCKET/$VERSIONED_PATH \
#   --endpoint-url $CDN_ENDPOINT \
#   --region $CDN_REGION \
#   --content-type "application/javascript" \
#   --cache-control "public, max-age=31536000, immutable" \
#   --acl public-read

# Latest path (mutable, 5-minute cache)
LATEST_PATH="sdk/drop.js"
echo "Uploading to latest path: $LATEST_PATH"

# aws s3 cp dist/drop.js \
#   s3://$CDN_BUCKET/$LATEST_PATH \
#   --endpoint-url $CDN_ENDPOINT \
#   --region $CDN_REGION \
#   --content-type "application/javascript" \
#   --cache-control "public, max-age=300" \
#   --acl public-read

echo ""
echo "Deployment successful!"
echo ""
echo "Versioned URL: https://cdn.drop.africa/$VERSIONED_PATH"
echo "Latest URL: https://cdn.drop.africa/$LATEST_PATH"
echo ""
echo "Note: The above commands are placeholders. Configure with your actual CDN provider."
echo "Supported providers:"
echo "  - Cloudflare R2 (S3-compatible)"
echo "  - AWS S3 + CloudFront"
echo "  - DigitalOcean Spaces"
echo "  - Any S3-compatible storage"
echo ""
echo "For Cloudflare R2:"
echo "  1. Install wrangler CLI: npm install -g wrangler"
echo "  2. Create R2 bucket: wrangler r2 bucket create drop-cdn"
echo "  3. Set up custom domain: cdn.drop.africa"
echo "  4. Use wrangler r2 object put commands above"
echo ""

# Cleanup
rm -f dist/drop.js

exit 0
