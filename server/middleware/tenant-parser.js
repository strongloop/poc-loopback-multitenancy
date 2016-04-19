module.exports = function() {
  return function tenantParser(req, res, next) {
    req.tenantId = req.query.tenant || ((Date.now() % 2) + 1);

    console.log('TR tenant id:', req.tenantId);

    next();
  }
};
