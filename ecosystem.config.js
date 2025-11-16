module.exports = {
  apps: [
    {
      name: 'royal-chat-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4000',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000',
        NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4002'
      },
      error_file: './logs/app-error.log',
      out_file: './logs/app-out.log',
      log_file: './logs/app-combined.log',
      time: true
    },
    {
      name: 'royal-chat-admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4001',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4001',
        NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4002'
      },
      error_file: './logs/admin-error.log',
      out_file: './logs/admin-out.log',
      log_file: './logs/admin-combined.log',
      time: true
    },
    {
      name: 'royal-chat-server',
      script: 'tsx',
      args: 'server/index.ts',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 4002,
        WS_PORT: 4002
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_file: './logs/server-combined.log',
      time: true
    }
  ]
};

