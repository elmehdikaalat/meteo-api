#!/bin/bash
set -e

echo "Loading Docker images..."
docker load -i ~/meteo-images.tar

cd ~/meteo

if [ ! -f .env ]; then
    cat > .env << EOF
MONGO_USER=admin
MONGO_PASSWORD=ensg2024
EOF
fi

docker-compose up -d

echo "Checking meteoapi service..."
docker-compose ps meteoapi

echo "API: http://localhost:3000/meteo/v1/live?data=temperature"