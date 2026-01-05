module.exports = {
  apps: [
    {
      name: 'foodfly-nextjs',
      
      // ---- WORKING DIRECTORY ----
      // Update this path to your actual deployment directory
      cwd: process.env.PM2_CWD || '/home/ubuntu/htdocs/foodfly',
      
      // ---- START USING PNPM (IMPORTANT) ----
      script: '/usr/local/bin/pnpm',
      args: 'start',
      interpreter: 'node',
      
      // ---- ABSOLUTE SAFETY ----
      instances: 1,          // NEVER > 1
      exec_mode: 'fork',     // NEVER cluster
      
      // ---- RESTART CONTROL ----
      autorestart: true,
      max_restarts: 5,
      restart_delay: 5000,       // 5 seconds delay
      exp_backoff_restart_delay: 200, // exponential backoff
      
      // ---- HARD MEMORY LIMIT ----
      max_memory_restart: '1G',
      
      // ---- ENV ----
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      
      // ---- LOGGING (LOCAL, ROTATABLE) ----
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      
      // ---- SHUTDOWN SAFETY ----
      kill_timeout: 5000,
      listen_timeout: 30000,
      wait_ready: false,
      watch: false
    }
  ]
}; 