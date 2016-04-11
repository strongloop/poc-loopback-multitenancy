module.exports = function() {
  return function modelResolver(req, res, next) {
    var app = req.app;
    var tenantId = req.tenantId;

    var ds = (tenantId == 1) ?
      app.datasources.db :
      app.datasources['db' + tenantId];

    // "Customer" is hardcoded here, but the real impl should resolve models
    // dynamically
    var model = ds.models['Customer' + tenantId];
    model.find(function(err, customers) {
      if (err) return cb(err);

      res.send(customers);
    });
  };
};
