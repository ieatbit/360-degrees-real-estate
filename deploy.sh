#!/bin/bash

# Exit on any error
set -e

# Configuration
VPS_USER=your_username
VPS_HOST=your_hostinger_ip_or_domain
VPS_PATH=/var/www/360degrees
BRANCH=main

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying 360 Degrees Real Estate website to VPS...${NC}"

# 1. Build the project locally
echo -e "${GREEN}Building project...${NC}"
npm run build

# 2. Create a tarball of the build
echo -e "${GREEN}Creating deployment package...${NC}"
tar -czf deploy.tar.gz .next/ node_modules/ package.json next.config.js public/ src/ data/

# 3. Connect to the VPS and prepare the directory
echo -e "${GREEN}Preparing VPS directory...${NC}"
ssh $VPS_USER@$VPS_HOST "mkdir -p $VPS_PATH/backup && mkdir -p $VPS_PATH/new"

# 4. Upload the tarball
echo -e "${GREEN}Uploading files to VPS...${NC}"
scp deploy.tar.gz $VPS_USER@$VPS_HOST:$VPS_PATH/new/

# 5. Deploy on the server
echo -e "${GREEN}Deploying on VPS...${NC}"
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && \
    # Backup current version if it exists
    if [ -d current ]; then \
        tar -czf backup/backup-\$(date +%Y%m%d-%H%M%S).tar.gz current && \
        echo 'Current version backed up'; \
    fi && \
    # Extract new version
    cd new && \
    tar -xzf deploy.tar.gz && \
    rm deploy.tar.gz && \
    # Swap versions
    cd $VPS_PATH && \
    rm -rf current.old && \
    if [ -d current ]; then mv current current.old; fi && \
    mv new current && \
    mkdir -p new && \
    # Install dependencies if needed
    cd current && \
    # Restart the service
    pm2 restart 360degrees || pm2 start npm --name '360degrees' -- start && \
    echo 'Deployment completed successfully'"

# 6. Clean up locally
echo -e "${GREEN}Cleaning up...${NC}"
rm deploy.tar.gz

echo -e "${GREEN}Deployment completed!${NC}"