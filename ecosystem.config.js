module.exports = {
  apps: [
    {
      name: 'stock_analyze',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
