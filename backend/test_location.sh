#!/bin/bash

echo "🧪 Testing Location Feature"
echo "================================"
echo ""

# Load .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
  echo "✅ Loaded environment variables from .env"
else
  echo "❌ .env file not found"
  exit 1
fi

# Check API key
if [ -z "$GEOAPIFY_API_KEY" ]; then
  echo "❌ GEOAPIFY_API_KEY not set"
  exit 1
fi

echo "✅ API Key: ${GEOAPIFY_API_KEY:0:10}..."
echo ""

# Test 1: Direct API call
echo "📡 Test 1: Testing Geoapify API directly..."
curl -s "https://api.geoapify.com/v1/geocode/autocomplete?text=Cape&limit=2&apiKey=$GEOAPIFY_API_KEY" | python3 -m json.tool 2>/dev/null | head -30 || echo "Failed"
echo ""

# Test 2: Test the endpoint if server is running
echo "🌐 Test 2: Testing backend endpoint..."
if curl -s "http://localhost:4000/api/locations/search?q=Cape" > /tmp/location_test.json 2>&1; then
  cat /tmp/location_test.json | python3 -m json.tool 2>/dev/null || cat /tmp/location_test.json
  echo ""

  # Check if it's an error
  if grep -q '"error"' /tmp/location_test.json; then
    echo "❌ Backend endpoint returned error"
    echo "💡 Server needs to be restarted with API key"
  else
    echo "✅ Backend endpoint working"
  fi
else
  echo "❌ Could not connect to backend (is server running?)"
fi
echo ""

# Test 3: Run Elixir tests
echo "🧪 Test 3: Running Elixir tests..."
export GEOAPIFY_API_KEY=$GEOAPIFY_API_KEY
mix test test/backend/locations/geoapify_test.exs test/backend_web/controllers/api/location_controller_test.exs --trace
