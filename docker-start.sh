#!/bin/bash

# Pickleball Platform Docker Startup Script
# This script provides a convenient way to start the dockerized application

set -e

echo "🏓 Starting Pickleball Platform with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Function to use docker compose (newer) or docker-compose (legacy)
docker_compose() {
    if docker compose version > /dev/null 2>&1; then
        docker compose "$@"
    else
        docker-compose "$@"
    fi
}

# Clean up any existing containers (optional)
echo "🧹 Cleaning up existing containers..."
docker_compose down --remove-orphans

# Build and start the services
echo "🏗️  Building and starting services..."
docker_compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker_compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "🌐 Application is available at: http://localhost:3000"
    echo "🗄️  Database is available at: localhost:5432"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs:           docker-compose logs -f"
    echo "   Stop services:       docker-compose down"
    echo "   Restart services:    docker-compose restart"
    echo "   Access database:     docker-compose exec db psql -U postgres -d pickleball"
    echo "   Access app shell:    docker-compose exec app sh"
    echo ""
    echo "🏓 Happy pickleballing!"
else
    echo "❌ Services failed to start. Check logs with: docker-compose logs"
    exit 1
fi