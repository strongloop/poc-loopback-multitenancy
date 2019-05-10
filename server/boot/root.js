// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: poc-loopback-multitenancy

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', server.loopback.status());
  server.use(router);
};
