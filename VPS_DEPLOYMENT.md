# VPS Deployment Guide for 360 Degrees Real Estate Website

This guide will walk you through the process of deploying the 360 Degrees Real Estate website on a Hostinger VPS.

## Prerequisites

1. A Hostinger VPS with:
   - Ubuntu 20.04 or newer
   - Node.js 18+ installed
   - PM2 installed globally (`npm install -g pm2`)
   - Nginx installed

2. SSH access to your VPS

## Initial Server Setup

1. **Connect to your VPS via SSH:**
   ```
   ssh username@your_server_ip
   ```

2. **Update the system:**
   ```
   sudo apt update && sudo apt upgrade -y
   ```

3. **Install required software (if not already installed):**
   ```
   sudo apt install -y curl git
   
   # Install Node.js 18.x
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2 globally
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install -y nginx
   ```

4. **Create the application directory:**
   ```
   sudo mkdir -p /var/www/360degrees
   sudo chown -R $USER:$USER /var/www/360degrees
   ```

## Automatic Deployment Using the Script

1. **Edit the deploy.sh script** to update:
   - `VPS_USER` - Your VPS username
   - `VPS_HOST` - Your VPS IP address or domain
   - `VPS_PATH` - The path where the application will be deployed (default: /var/www/360degrees)

2. **Run the deployment script:**
   ```
   ./deploy.sh
   ```

The script will:
- Build the application locally
- Create a deployment package
- Upload it to your VPS
- Back up any existing version
- Deploy the new version
- Restart the service using PM2

## Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

1. **Build the application locally:**
   ```
   npm run build
   ```

2. **Create a deployment package:**
   ```
   tar -czf deploy.tar.gz .next/ node_modules/ package.json next.config.js public/ src/ data/
   ```

3. **Transfer the package to your VPS:**
   ```
   scp deploy.tar.gz username@your_server_ip:/var/www/360degrees/
   ```

4. **SSH into your VPS and extract the files:**
   ```
   ssh username@your_server_ip
   cd /var/www/360degrees
   tar -xzf deploy.tar.gz
   rm deploy.tar.gz
   ```

5. **Start or restart the application with PM2:**
   ```
   pm2 start npm --name "360degrees" -- start
   # or if already running
   pm2 restart 360degrees
   ```

## Nginx Configuration

Create an Nginx configuration file for your site:

```
sudo nano /etc/nginx/sites-available/360degrees
```

Add the following configuration (replace your-domain.com with your actual domain):

```
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Better handling for static assets
    location /_next/static/ {
        alias /var/www/360degrees/current/.next/static/;
        expires 365d;
        access_log off;
    }
    
    location /uploads/ {
        alias /var/www/360degrees/current/public/uploads/;
        expires 30d;
        access_log off;
    }
    
    location /images/ {
        alias /var/www/360degrees/current/public/images/;
        expires 30d;
        access_log off;
    }
    
    client_max_body_size 50M; # Allow larger file uploads
}
```

Enable the site and restart Nginx:

```
sudo ln -s /etc/nginx/sites-available/360degrees /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Setting Up SSL with Let's Encrypt

1. **Install Certbot:**
   ```
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain an SSL certificate:**
   ```
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. **Follow the prompts** to complete the SSL setup.

## Maintaining the Application

- **View logs:**
  ```
  pm2 logs 360degrees
  ```

- **Monitor the application:**
  ```
  pm2 monit
  ```

- **Set up PM2 to start on system boot:**
  ```
  pm2 startup
  pm2 save
  ```

## Troubleshooting

- **Check Nginx error logs:**
  ```
  sudo tail -f /var/log/nginx/error.log
  ```

- **Check access logs:**
  ```
  sudo tail -f /var/log/nginx/access.log
  ```

- **Check PM2 logs:**
  ```
  pm2 logs 360degrees
  ```

## Backup Strategy

The deployment script automatically creates backups before each deployment in `/var/www/360degrees/backup/`. For additional backup:

1. **Back up the data directory:**
   ```
   sudo tar -czf /var/backups/360degrees-data-$(date +%Y%m%d).tar.gz /var/www/360degrees/current/data
   ```

2. **Back up uploaded files:**
   ```
   sudo tar -czf /var/backups/360degrees-uploads-$(date +%Y%m%d).tar.gz /var/www/360degrees/current/public/uploads
   ```

3. **Set up a cron job for regular backups:**
   ```
   sudo crontab -e
   ```
   
   Add a line like:
   ```
   0 2 * * * tar -czf /var/backups/360degrees-data-$(date +\%Y\%m\%d).tar.gz /var/www/360degrees/current/data > /dev/null 2>&1
   ``` 