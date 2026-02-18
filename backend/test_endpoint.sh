#!/bin/bash

echo "🌐 Testing Location Endpoint..."
echo ""

curl -s "http://localhost:4000/api/locations/search?q=Cape" | python3 -m json.tool 2>/dev/null

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Location endpoint is working!"
else
  echo "❌ Endpoint test failed"
fi
