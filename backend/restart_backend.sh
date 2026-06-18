#!/bin/bash
echo "Stopping backend (you may need to enter your password)..."
sudo pkill -9 -f "mix phx.server"
sleep 2
echo "Starting backend as current user..."
mix phx.server
