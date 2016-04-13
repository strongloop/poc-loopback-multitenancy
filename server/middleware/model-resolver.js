var ModelBuilder = require('loopback-datasource-juggler').ModelBuilder;
var tconf = require('../tenant-config.json');
var f = require('util').format;

module.exports = function() {
  return function modelResolver(req, res, next) {
    var app = req.app;
    var tenantId = req.tenantId;

    // get model name to lookup
    var restModelName = req.baseUrl.split('/').pop();
    var modelName = restModelName.charAt(0).toUpperCase() +
      restModelName.slice(1, -1); // real impl will need to figure out suffix

    // get tenant config based on tenant id
    var conf = tconf.find(function(conf) {
      return conf.id == tenantId;
    });
    // get datasource based on dynamic model name (from preconfigured mapping)
    // -- maybe allow dynamic maps so datasources can be chosen on the fly
    var dsName = conf.modelMap[modelName];
    var ds = app.datasources[dsName];

    // lookup the shared model definition -- production impl should really check
    // all model dirs (common/models, server/models, etc)
    var modelDefPath = f('../../common/models/%s.json', modelName);
    var modelDef = require(modelDefPath);

    // generate the relevant model dynamically
    var builder = new ModelBuilder();
    var Model = builder.define(modelName, modelDef);
    ds.attach(Model);

    // fetch data using dynamically generated model
    var model = ds.models[modelName];
    model.find(function(err, customers) {
      if (err) return cb(err);

      res.send(customers);
    });
  };
};
