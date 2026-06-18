#!/bin/bash
# Fix dependency permissions and recompile

echo "Fixing dependency permissions..."
sudo chown -R $USER:$USER _build deps 2>/dev/null || true
sudo rm -rf _build deps

echo "Fetching dependencies..."
mix deps.get

echo "Compiling project..."
mix compile

echo "Done! You can now start the server with: mix phx.server"
