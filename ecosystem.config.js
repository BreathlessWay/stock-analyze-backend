module.exports = {
  apps: [
    {
      name: 'stock_analyze',
      script: 'dist/main.js',
      node_args: ['--max_old_space_size=4096'],
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
