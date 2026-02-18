#!/bin/bash

echo "🔍 Checking if API key is loaded..."
echo ""

# Test the endpoint
RESPONSE=$(curl -s "http://localhost:4000/api/locations/search?q=Cape")

if echo "$RESPONSE" | grep -q '"error"'; then
  echo "❌ API key NOT loaded - still getting error:"
  echo "$RESPONSE"
  echo ""
  echo "💡 Make sure you restarted WITHOUT sudo!"
else
  echo "✅ API key is loaded! Location search working:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -30
fi
