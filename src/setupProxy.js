const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/query',  // This matches your local path
    createProxyMiddleware({
      target: 'https://214vhbjfck.execute-api.us-east-1.amazonaws.com/prod',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove /api from the path
      },
    })
  );
};
