# Deployment Guide for 360° Real Estate Website

This guide will help you deploy the website to your Hostinger VPS.

## Prerequisites

1. Hostinger VPS with Ubuntu Linux
2. SSH access to your VPS
3. Domain name pointing to your VPS IP address

## Deployment Steps

### 1. Local Preparation

1. Build the application for production:
   ```bash
   npm run build
   ```

2. Use the deployment script to package and deploy the application:
   ```bash
   ./deploy.sh username@your-vps-ip
   ```

   Replace `username@your-vps-ip` with your VPS SSH connection details.

### 2. Server Setup (First-time only)

1. Connect to your VPS via SSH:
   ```bash
   ssh username@your-vps-ip
   ```

2. Follow the instructions in the SETUP.md file that was transferred to your server:
   ```bash
   cat /var/www/html/360degreesrealestate/SETUP.md
   ```

3. Update your Nginx configuration with your actual domain name:
   ```bash
   sudo nano /etc/nginx/sites-available/360degreesrealestate
   ```

   Replace `example.com` and `www.example.com` with your actual domain name.

### 3. SSL Configuration

1. Install Certbot for SSL certificates:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. Configure SSL for your domain:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

   Replace `yourdomain.com` with your actual domain name.

### 4. Post-Deployment Verification

1. Check if the site is running correctly:
   ```bash
   pm2 status
   ```

2. Check Nginx status:
   ```bash
   sudo systemctl status nginx
   ```

3. Test your website by visiting your domain in a browser.

## Managing Your Application

### Starting/Stopping the Application

```bash
# Start the application
pm2 start 360degreesrealestate

# Stop the application
pm2 stop 360degreesrealestate

# Restart the application
pm2 restart 360degreesrealestate

# Check application logs
pm2 logs 360degreesrealestate
```

### Updating the Application

1. Deploy the updated version using the deployment script:
   ```bash
   ./deploy.sh username@your-vps-ip
   ```

2. Connect to your VPS and restart the application:
   ```bash
   ssh username@your-vps-ip
   cd /var/www/html/360degreesrealestate
   pm2 restart 360degreesrealestate
   ```

## Backup and Restore

### Data Backup

Regularly backup your data directory:

```bash
# On the VPS
sudo tar -czf /backup/data-backup-$(date +%Y%m%d).tar.gz /var/www/html/360degreesrealestate/data
```

### Database Backup (if using external database)

If you've configured an external database, set up regular backups for that as well.

## Troubleshooting

### Common Issues

1. **Website not accessible**:
   - Check if Nginx is running: `sudo systemctl status nginx`
   - Check if your application is running: `pm2 status`
   - Verify that your domain is pointing to the correct IP address

2. **SSL certificate issues**:
   - Renew certificates: `sudo certbot renew`
   - Check certificate status: `sudo certbot certificates`

3. **Application crashes or doesn't start**:
   - Check application logs: `pm2 logs 360degreesrealestate`
   - Check for any error messages and resolve them accordingly

## Support

For additional help, contact your developer or refer to the following resources:

- Next.js Documentation: https://nextjs.org/docs
- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/
- Nginx Documentation: https://nginx.org/en/docs/
- Certbot Documentation: https://certbot.eff.org/docs 