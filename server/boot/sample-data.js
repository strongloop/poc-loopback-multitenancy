module.exports = function(app, cb) {
  var db1 = app.datasources.db;
  var Customer = db1.models.Customer;
  Customer.create([
    {name: 'Andy'},
    {name: 'Bob'},
    {name: 'Carol'},
  ], function(err, customers) {
    if (err) throw err;
    console.log('db1.created.%j', customers);
    cb();
  });
};
