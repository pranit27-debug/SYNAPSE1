#!/bin/bash

# Synapse Production Deployment Script
# This script handles production deployment of the Synapse backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="synapse-backend"
NODE_ENV="production"
PORT=${PORT:-5000}
PM2_APP_NAME="synapse-api"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
   exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    warn "PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
fi

log "Starting deployment of $APP_NAME..."

# Create necessary directories
log "Creating necessary directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p backups

# Backup current deployment if exists
if [ -d "backups/current" ]; then
    log "Creating backup of current deployment..."
    cp -r backups/current backups/backup-$(date +%Y%m%d-%H%M%S)
fi

# Install dependencies
log "Installing production dependencies..."
npm ci --only=production

# Build the application if needed
if [ -f "package.json" ] && grep -q "\"build\"" package.json; then
    log "Building application..."
    npm run build
fi

# Set environment variables
export NODE_ENV=$NODE_ENV
export PORT=$PORT

# Check if .env file exists
if [ ! -f ".env" ]; then
    error ".env file not found. Please create one with proper configuration."
    exit 1
fi

# Validate environment configuration
log "Validating environment configuration..."
if [ -z "$MONGODB_URI" ] && [ -z "$(grep 'MONGODB_URI' .env)" ]; then
    error "MONGODB_URI not configured in .env file"
    exit 1
fi

if [ -z "$JWT_SECRET" ] && [ -z "$(grep 'JWT_SECRET' .env)" ]; then
    error "JWT_SECRET not configured in .env file"
    exit 1
fi

# Stop existing PM2 process if running
if pm2 list | grep -q "$PM2_APP_NAME"; then
    log "Stopping existing PM2 process..."
    pm2 stop $PM2_APP_NAME
    pm2 delete $PM2_APP_NAME
fi

# Start application with PM2
log "Starting application with PM2..."
pm2 start server.js --name $PM2_APP_NAME --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
log "Setting up PM2 startup script..."
pm2 startup

# Wait for application to start
log "Waiting for application to start..."
sleep 5

# Check if application is running
if curl -f http://localhost:$PORT/ > /dev/null 2>&1; then
    log "Application is running successfully on port $PORT"
else
    error "Application failed to start. Check logs with: pm2 logs $PM2_APP_NAME"
    exit 1
fi

# Create backup of current deployment
log "Creating backup of current deployment..."
cp -r . backups/current

# Display deployment information
log "Deployment completed successfully!"
echo ""
echo -e "${BLUE}Deployment Summary:${NC}"
echo -e "  App Name: $APP_NAME"
echo -e "  Environment: $NODE_ENV"
echo -e "  Port: $PORT"
echo -e "  PM2 Process: $PM2_APP_NAME"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  View logs: pm2 logs $PM2_APP_NAME"
echo -e "  Restart app: pm2 restart $PM2_APP_NAME"
echo -e "  Stop app: pm2 stop $PM2_APP_NAME"
echo -e "  Monitor: pm2 monit"
echo ""
echo -e "${BLUE}Application URL:${NC}"
echo -e "  http://localhost:$PORT"
echo ""

# Optional: Run health check
log "Running health check..."
if curl -f http://localhost:$PORT/ > /dev/null 2>&1; then
    log "Health check passed!"
else
    warn "Health check failed. Application may not be fully ready."
fi

log "Deployment script completed!"
