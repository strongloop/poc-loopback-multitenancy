// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: poc-loopback-multitenancy

var async = require('async');

module.exports = function(app, cb) {
  var customer1s = [
    {name: 'Andy'},
    {name: 'Bob'},
    {name: 'Carol'},
  ];
  var customer2s = [
    {name: 'Dan'},
    {name: 'Eric'},
    {name: 'Francis'},
  ];

  var Customer1 = app.datasources.db.models.Customer1;
  var Customer2 = app.datasources.db2.models.Customer2;

  async.parallel([
    Customer1.create.bind(Customer1, customer1s),
    Customer2.create.bind(Customer2, customer2s),
  ], function(err, customers) {
    if (err) throw err;

    console.log('CREATED %j', customers);

    cb();
  });
};
