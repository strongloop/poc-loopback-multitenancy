var async = require('async');
var jdb = require('loopback-datasource-juggler');
var DataSource = jdb.DataSource;
var ModelBuilder = jdb.ModelBuilder;

module.exports = function(app, cb) {
  function createCustomers(tenantId, dsName, data, cb) {
    var ds = new DataSource({
      connector: 'memory'
    });
    app.datasources[dsName] = ds;

    var builder = new ModelBuilder();
    var Customer = builder.define('Customer', {
      name: String
    });
    ds.attach(Customer);

    Customer.create(data, function(err, customers) {
      if (err) throw err;
      console.log('Tenant %d: %j', tenantId, customers);
      cb();
    });
  }

  async.parallel([
    createCustomers.bind(null, 1, 'mysql', [
      {name: 'Andy'},
      {name: 'Bob'},
      {name: 'Carol'},
    ]),
    createCustomers.bind(null, 2, 'mongodb', [
      {name: 'Dan'},
      {name: 'Eric'},
      {name: 'Francis'},
    ]),
  ], cb);
};

