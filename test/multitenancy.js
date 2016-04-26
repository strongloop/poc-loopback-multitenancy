var api = require('../server/server');
var assert = require('assert');
var req = require('supertest');

describe('multitenancy', function() {
  before('start api server', function(done) {
    api.start();
    api.once('started', done);
  });

  it('should retrieve the correct data when tenant id is 1', function(done) {
    req(api)
      .get('/api/customers?tenant=1')
      .expect(200)
      .end(function(err, res) {
        assert.deepEqual(res.body, [
          {id: 1, name: 'Andy'},
          {id: 2, name: 'Bob'},
          {id: 3, name: 'Carol'},
        ]);
        done();
      });
  });

  it('should retrieve the correct data when tenant id is 2', function(done) {
    req(api)
      .get('/api/customers?tenant=2')
      .expect(200)
      .end(function(err, res) {
        assert.deepEqual(res.body, [
          {id: 1, name: 'Dan'},
          {id: 2, name: 'Eric'},
          {id: 3, name: 'Francis'},
        ]);
        done();
      });
  });
});
