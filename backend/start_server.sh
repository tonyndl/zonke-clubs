#!/bin/bash

echo "🛑 Stopping any running Phoenix servers..."
pkill -f "mix phx.server" 2>/dev/null && sleep 2

echo ""
echo "🔧 Setting up environment..."

# Set the API key directly
export GEOAPIFY_API_KEY=dfc6d77d231945f089757618363498de

# Set LOCAL_IP for S3/LocalStack access from mobile devices
export LOCAL_IP=192.168.1.139

echo "✅ API Key set: ${GEOAPIFY_API_KEY:0:10}..."
echo "✅ Local IP set: ${LOCAL_IP}"

echo ""
echo "🚀 Starting Phoenix server (NOT as root)..."
echo "⚠️  DO NOT use 'sudo' with this script!"
echo ""

# Start the server
mix phx.server
