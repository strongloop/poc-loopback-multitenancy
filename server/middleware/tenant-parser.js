// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: poc-loopback-multitenancy

module.exports = function() {
  return function tenantParser(req, res, next) {
    req.tenantId = req.query.tenant || 1;

    console.log('TR middleware triggered', req.tenantId);

    next();
  }
};
