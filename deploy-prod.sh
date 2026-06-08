#!/bin/bash

# ======================================================
# Production Deployment Script
# Usage: ./deploy-prod.sh <repo-name> [port]
# Example: ./deploy-prod.sh mkstationary 5000
# ======================================================

APP_NAME=$1
PORT=${2:-5000}  # Default port 5000, override with 2nd arg
BASE_DOMAIN="bluetelecast.4usoftwaresolutions.com"

BASE_DIR="/var/www/production"
APP_DIR="$BASE_DIR/$APP_NAME"

DOMAIN="prod-$APP_NAME.$BASE_DOMAIN"

if [ -z "$APP_NAME" ]; then
    echo "Usage: ./deploy-prod.sh <repo-name> [port]"
    echo "Example: ./deploy-prod.sh mkstationary 5000"
    exit 1
fi

echo "======================================"
echo "Production Deployment: $APP_NAME"
echo "Domain:  https://$DOMAIN"
echo "Port:    $PORT"
echo "Dir:     $APP_DIR"
echo "======================================"

# ── 1. Ensure base directory ──────────────────────────
mkdir -p $BASE_DIR

# ── 2. Clone or pull latest code ─────────────────────
cd $BASE_DIR || exit

if [ ! -d "$APP_DIR" ]; then
    echo ">>> Cloning repository..."
    git clone git@github.com:defigosolutions/$APP_NAME.git
else
    echo ">>> Repository exists. Pulling latest code..."
    cd $APP_DIR || exit
    git pull
fi

cd $APP_DIR || exit

# ── 3. Set up .env file if not present ───────────────
if [ ! -f "$APP_DIR/.env" ]; then
    echo ">>> Creating default .env file..."
    cat > $APP_DIR/.env <<ENVEOF
PORT=$PORT
NODE_ENV=production

# ── MySQL (update these values) ──
DB_HOST=localhost
DB_PORT=3306
DB_USER=app_$APP_NAME
DB_PASSWORD=CHANGE_THIS_PASSWORD
DB_NAME=$APP_NAME

# ── Secrets (auto-generated, keep private) ──
JWT_SECRET=$(openssl rand -hex 32)
CAPTCHA_SECRET=$(openssl rand -hex 32)

# ── SMTP (optional, fill in if email is needed) ──
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your@email.com
# SMTP_PASS=your_app_password
ENVEOF
    echo ""
    echo "  ⚠️  .env created at $APP_DIR/.env"
    echo "  ⚠️  Please edit it with correct DB credentials before continuing."
    echo "  Run: nano $APP_DIR/.env"
    echo ""
    read -p "Press ENTER after editing .env to continue deployment..."
else
    echo ">>> .env file already exists. Skipping creation."
fi

# ── 4. Clean and reinstall dependencies ──────────────
echo ">>> Cleaning old build..."
rm -rf dist node_modules package-lock.json

echo ">>> Installing dependencies..."
npm install --unsafe-perm=true

# ── 5. Create Vite config for production ─────────────
echo ">>> Creating Vite config..."
cat > vite.config.js <<EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
EOF

# ── 6. Build React frontend ───────────────────────────
echo ">>> Building React frontend..."
chmod +x node_modules/.bin/vite
npm run build

if [ ! -d "dist" ]; then
    echo "Build failed! Check the errors above."
    exit 1
fi

echo ">>> Build successful."

# ── 7. Set up data directory ──────────────────────────
mkdir -p $APP_DIR/data
chown -R www-data:www-data $APP_DIR/data 2>/dev/null || true

# ── 8. PM2 Process Management ────────────────────────
echo ">>> Checking PM2..."
if ! command -v pm2 &> /dev/null; then
    echo ">>> PM2 not found. Installing globally..."
    npm install -g pm2
fi

# Create PM2 ecosystem config
cat > $APP_DIR/ecosystem.config.cjs <<EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'server.js',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    error_file: '/var/log/pm2/$APP_NAME-error.log',
    out_file:   '/var/log/pm2/$APP_NAME-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
}
EOF

mkdir -p /var/log/pm2

# Stop old instance if running, then start fresh
pm2 describe $APP_NAME &>/dev/null && pm2 delete $APP_NAME
pm2 start $APP_DIR/ecosystem.config.cjs
pm2 save

# Ensure PM2 restarts on server reboot (run once per server)
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

echo ">>> PM2 started: $APP_NAME on port $PORT"

# ── 9. Nginx reverse proxy config ─────────────────────
echo ">>> Creating Nginx config..."

sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null <<EOF
# HTTP → redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

# HTTPS reverse proxy to Node.js
server {
    listen 443 ssl;
    server_name $DOMAIN;

    # --- SSL (certbot fills these in) ---
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy all requests to Node.js backend
    location / {
        proxy_pass         http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           \$http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Serve uploaded/static files directly via Nginx (faster)
    location /uploads {
        alias $APP_DIR/uploads;
        expires 30d;
        access_log off;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 6;
}
EOF

# ── 10. Enable site and test Nginx ────────────────────
echo ">>> Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME

echo ">>> Testing Nginx config..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "Nginx configuration test FAILED. Please fix errors above."
    exit 1
fi

sudo systemctl reload nginx

# ── 11. Install SSL certificate ───────────────────────
echo ">>> Installing SSL certificate..."
sudo certbot --nginx -d $DOMAIN \
    --non-interactive \
    --agree-tos \
    -m hr@4usoftwaresolutions.com \
    --redirect

echo ""
echo "======================================"
echo " Production Deployment Complete!"
echo "======================================"
echo " App:      $APP_NAME"
echo " Live URL:  https://$DOMAIN"
echo " Port:      $PORT"
echo " PM2 name:  $APP_NAME"
echo " App dir:   $APP_DIR"
echo " Logs:      /var/log/pm2/$APP_NAME-*.log"
echo "======================================"
echo ""
echo " Useful commands:"
echo "   pm2 status              → check all apps"
echo "   pm2 logs $APP_NAME      → live logs"
echo "   pm2 restart $APP_NAME   → restart app"
echo "   pm2 stop $APP_NAME      → stop app"
echo "======================================"
