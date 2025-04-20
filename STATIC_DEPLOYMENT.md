# Static Deployment Guide for 360° Real Estate Website

This guide will help you deploy the static export of your website to your Hostinger VPS.

## Prerequisites

1. Hostinger VPS with Ubuntu Linux
2. SSH access to your VPS
3. Domain name pointing to your VPS IP address

## Deployment Steps

### 1. Local Preparation

1. Build and export the application:
   ```bash
   npm run build
   ```

   This will create a static export in the `out` directory.

2. Use the deployment script to package and deploy the application:
   ```bash
   ./deploy-static.sh username@your-vps-ip
   ```

   Replace `username@your-vps-ip` with your VPS SSH connection details.

### 2. Server Setup (First-time only)

1. Connect to your VPS via SSH:
   ```bash
   ssh username@your-vps-ip
   ```

2. Follow the instructions in the SETUP.md file that was transferred to your server:
   ```bash
   cd /var/www/html/360degreesrealestate
   cat SETUP.md
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

1. Check Nginx status:
   ```bash
   sudo systemctl status nginx
   ```

2. Test your website by visiting your domain in a browser.

## Important Differences Between Static and Dynamic Deployment

### Static Deployment (Current Option)

1. **Pros**:
   - Faster loading
   - Better security
   - Cheaper hosting (no need for Node.js)
   - Better caching

2. **Cons**:
   - No server-side dynamic content (all API routes will not work)
   - All data must be pre-rendered at build time
   - Forms and dynamic features need to be handled differently

3. **What won't work**:
   - API routes for property listings (you'll need to use static data)
   - Dynamic filtering (will need to be client-side only)
   - Property uploads (will need a separate solution)

### Adapted Approach

For a static site, you should consider:

1. **Pre-rendering all data**:
   - Generate all property pages at build time
   - Include all necessary data in the static files

2. **Client-side filtering**:
   - Load all properties data in the browser
   - Implement filtering using JavaScript

3. **Contact forms**:
   - Use a service like Formspree for contact forms
   - Or set up a separate API service

### Updating Content

Since the site is static, you'll need to rebuild and redeploy whenever content changes:

1. Update your data sources
2. Rebuild the site: `npm run build`
3. Redeploy: `./deploy-static.sh username@your-vps-ip`

## Alternative: Dynamic Deployment

If you need the dynamic features, use the `deploy.sh` script instead, which sets up your site as a Node.js application.

```bash
./deploy.sh username@your-vps-ip
```

This will deploy your application as a server-rendered Next.js site, which supports all API routes and dynamic features.

## Troubleshooting

### Common Issues

1. **Website not accessible**:
   - Check if Nginx is running: `sudo systemctl status nginx`
   - Verify that your domain is pointing to the correct IP address

2. **SSL certificate issues**:
   - Renew certificates: `sudo certbot renew`
   - Check certificate status: `sudo certbot certificates`

3. **404 errors on pages**:
   - Check Nginx configuration for proper routing
   - Make sure the `try_files` directive is correctly set

## Support

For additional help, contact your developer or refer to the following resources:

- Next.js Static Exports: https://nextjs.org/docs/pages/building-your-application/deploying/static-exports
- Nginx Documentation: https://nginx.org/en/docs/
- Certbot Documentation: https://certbot.eff.org/docs 