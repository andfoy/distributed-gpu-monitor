const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/graphs', { target: 'http://10.241.254.54:8001/' }));
};
