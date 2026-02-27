const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
  ...defaultConfig,
  resolve: {
    ...defaultConfig.resolve,
    alias: {
      ...defaultConfig.resolve.alias,
      '@app': path.resolve(__dirname, 'src/frontend/app'),
      '@api': path.resolve(__dirname, 'src/frontend/api'),
      '@admin': path.resolve(__dirname, 'src/admin'),
    },
  },
};
