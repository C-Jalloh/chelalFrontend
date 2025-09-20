#!/bin/bash

# Chelal HMS - Docker Cleanup Script
echo "🧹 Chelal HMS - Cleanup Script"
echo "=============================="

echo "🛑 Stopping all services..."
docker-compose down

echo "🗑️  Removing unused containers, networks, and images..."
docker system prune -f

echo "📦 Removing project-specific volumes (optional)..."
read -p "Do you want to remove database volumes? This will delete all data! (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    echo "💀 Volumes removed - all data deleted!"
else
    echo "💾 Volumes preserved - data is safe"
fi

echo "✅ Cleanup complete!"
