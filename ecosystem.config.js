/**
 * PM2 Ecosystem Configuration cho Admin Panel
 * 
 * Usage:
 *   pm2 start ecosystem.config.js              # Start app
 *   pm2 restart ecosystem.config.js           # Restart app
 *   pm2 reload ecosystem.config.js            # Reload app (zero downtime)
 */

module.exports = {
  apps: [{
    name: 'visaapp-admin',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/admin-error.log',
    out_file: './logs/admin-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    ignore_watch: ['node_modules', 'logs', '.next'],
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
