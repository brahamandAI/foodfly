module.exports = {
  apps: [
    {
      name: 'foodfly.co',
      script: 'npm',
      args: 'start',
      cwd: '.',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,

      // default env (used if you just do pm2 start)
      env: {
        NODE_ENV: 'development',
        PORT: 3003,
      },

      // will be applied if you run with --env production
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
    },
  ],
};
