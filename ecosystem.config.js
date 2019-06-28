module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'back',
      script: 'index.js',
      ignoreWatch: ['logs/*', '*.swp'],
      env: {
        NODE_PATH: '.',
        NODE_ENV: 'dev',
        PRETTY_ERROR: true,
        DEBUG_COLORS: true,
        watch: true,
        ignore_watch: ['.git/*', 'logs/*']
      }
    }
  ]
}
