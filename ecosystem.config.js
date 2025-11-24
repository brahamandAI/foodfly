module.exports = {
  apps: [
    {
      name: 'foodfly-nextjs',
      script: 'npm',
      args: 'start',
      cwd: '.',
      env: {
        PORT: 3002
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_restarts: 5,
      restart_delay: 5000,       // 5 seconds delay
      exp_backoff_restart_delay: 200 // exponential backoff
    }
  ]
} 