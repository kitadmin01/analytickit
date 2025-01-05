#!/bin/bash

#Following script removes all the docker images, containers, volumes and networks. Use it if you need to
#install Analytickit docker services again using docker compose -f docker-compose.dev.yml up

# Stop all running containers
echo "Stopping all running Docker containers..."
docker stop $(docker ps -aq)

# Remove all containers
echo "Removing all Docker containers..."
docker rm $(docker ps -aq)

# Remove all Docker images
echo "Removing all Docker images..."
docker rmi $(docker images -q) -f

# Remove all Docker volumes
echo "Removing all Docker volumes..."
docker volume rm $(docker volume ls -q)

# Remove all Docker networks (excluding default ones)
echo "Removing all Docker networks..."
docker network rm $(docker network ls | grep "bridge" | awk '/ / { print $1 }')

# Prune the system
echo "Pruning Docker system..."
docker system prune -a -f --volumes

echo "Docker cleanup complete."
