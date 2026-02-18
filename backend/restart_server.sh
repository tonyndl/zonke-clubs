#!/bin/bash

echo "🛑 Stopping any running Phoenix servers..."
pkill -f "beam.smp.*phx.server" 2>/dev/null || echo "No running server found"

echo ""
echo "🔧 Loading environment variables..."
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
  echo "✅ Loaded .env file"
  echo "✅ API Key: ${GEOAPIFY_API_KEY:0:10}..."
else
  echo "❌ .env file not found!"
  exit 1
fi

echo ""
echo "🚀 Starting Phoenix server..."
mix phx.server
