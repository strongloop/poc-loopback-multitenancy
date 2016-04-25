module.exports = function() {
  return function tenantParser(req, res, next) {
    req.tenantId = req.query.tenant || 1;

    console.log('TR middleware triggered', req.tenantId);

    next();
  }
};
