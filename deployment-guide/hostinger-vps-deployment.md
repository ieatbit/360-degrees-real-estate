# Deploying 360 Degrees Real Estate to Hostinger VPS

This guide will walk you through deploying your Next.js application to a Hostinger VPS.

## Prerequisites

- A Hostinger VPS subscription
- SSH access to your server
- A domain name (optional but recommended)
- Git installed on your server

## Step 1: Build Your Project Locally

Before deploying, create a production build and test it locally:

```bash
# Install dependencies if you haven't already
npm install

# Build the production version
npm run build

# Test the production build locally
npm start
```

Make sure everything works correctly, including image uploads and API routes.

## Step 2: Prepare Your Server

SSH into your Hostinger VPS:

```bash
ssh user@your-server-ip
```

Install Node.js, npm, and other necessary packages:

```bash
# Update package lists
sudo apt update

# Install Node.js and npm (use Node.js 18 or later)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v

# Install PM2 globally to manage your Node.js process
sudo npm install -y pm2 -g

# Install Nginx as a reverse proxy
sudo apt install -y nginx
```

## Step 3: Set Up Your Project Directory

Create a directory for your application:

```bash
mkdir -p /var/www/360degreesrealestate
cd /var/www/360degreesrealestate
```

## Step 4: Transfer Your Code

Option 1: Clone from Git repository (recommended):

```bash
git clone https://your-repository-url.git .
```

Option 2: Use SCP to transfer files from your local machine:

```bash
# Run this on your local machine, not on the server
scp -r ./your-project-folder/* user@your-server-ip:/var/www/360degreesrealestate/
```

## Step 5: Install Dependencies and Build

On your server:

```bash
cd /var/www/360degreesrealestate
npm install

# Create the uploads directory with proper permissions
mkdir -p public/uploads
chmod 777 public/uploads

# Build the project
npm run build
```

## Step 6: Set Up Environment Variables

Create a .env file:

```bash
nano .env
```

Add necessary environment variables:

```
NODE_ENV=production
```

## Step 7: Configure PM2

Create a PM2 ecosystem config file:

```bash
nano ecosystem.config.js
```

Add the following content:

```javascript
module.exports = {
  apps: [
    {
      name: '360degreesrealestate',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',
      exec_mode: 'cluster'
    }
  ]
};
```

Start your application with PM2:

```bash
pm2 start ecosystem.config.js
```

Make PM2 start the application on system boot:

```bash
pm2 startup
pm2 save
```

## Step 8: Configure Nginx

Create a new Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/360degreesrealestate
```

Add the following configuration:

```nginx
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

    # Increase max file upload size
    client_max_body_size 25M;
    
    # Ensure file uploads work properly
    location /uploads/ {
        alias /var/www/360degreesrealestate/public/uploads/;
    }
}
```

Enable the configuration and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/360degreesrealestate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 9: Set Up SSL with Let's Encrypt

Install Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Obtain and install SSL certificate:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts to complete the setup.

## Step 10: Monitoring and Maintenance

Monitor your application:

```bash
pm2 status
pm2 logs
```

Update your application when you have new changes:

```bash
cd /var/www/360degreesrealestate
git pull
npm install
npm run build
pm2 restart 360degreesrealestate
```

## Troubleshooting

### File Upload Issues

Check directory permissions:

```bash
sudo chmod -R 777 /var/www/360degreesrealestate/public/uploads
```

### Nginx Configuration Issues

Check Nginx error logs:

```bash
sudo cat /var/log/nginx/error.log
```

### Application Issues

Check PM2 logs:

```bash
pm2 logs 360degreesrealestate
```

## Resources

- [Hostinger VPS Documentation](https://support.hostinger.com/en/articles/3370703-how-to-set-up-and-use-a-vps)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/) 