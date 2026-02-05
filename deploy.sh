#!/bin/bash
set -e

echo "Loading images..."
docker load -i meteo-images.tar

echo "Starting services..."
docker-compose up -d

echo "Waiting..."
sleep 10

docker-compose ps
echo "Deployment complete!"