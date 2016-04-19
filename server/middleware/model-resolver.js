var ModelBuilder = require('loopback-datasource-juggler').ModelBuilder;
var tconf = require('../tenant-config.json');
var f = require('util').format;

module.exports = function() {
  return function modelResolver(req, res, next) {
    // get tenant id
    var tenantId = req.tenantId;
    console.log('MR tenant id:', tenantId);

    // get tenant config based on tenant id
    var tenant;
    for (var i = 0; i < tconf.length; i++) {
      if (tconf[i].id == tenantId) {
        tenant = tconf[i];
        break;
      }
    }
    console.log('MR tenant config: %j', tenant);

    // get model name from url
    var urlModelName = req.originalUrl.split('/').pop();
    console.log('MR url model name:', urlModelName);

    // get logical model name based on the url model name
    var modelName = urlModelName.charAt(0).toUpperCase() +
      urlModelName.slice(1, -1);
    console.log('MR logical model name:', modelName);


    // get data source name from tenant config
    var dsName = tenant.modelMap[modelName].dataSource;
    console.log('MR data source name:', dsName);

    // get data source using data source name from tenant config
    var ds = req.app.dataSources[dsName];

    // get physical model name from tenant config
    var physicalModelName = tenant.modelMap[modelName].model ||
      modelName;
    console.log('MR physical model name:', physicalModelName);

    // use the subclass factory pattern
    // var subclass = class extends physicalModel{}:
    // the concept is to make a copy so you don't modify the original
    var Class = req.app.models[physicalModelName];

    // classical inheritance with static method
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      } subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass, enumerable: false, writable: true, configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var subModel = function() {};
    _inherits(subModel, Class);
    subModel.modelName = physicalModelName + 'Copy';
    ds.attach(subModel);

    console.log('MR request method:', req.method);

    // we need to implement a way for strong remoting to resolve the request
    // based on the HTTP method used
  };
};

//2 parts moving forward
// some piece of logic to figure out tenant id and set that info into
// req/context object
//
// once you have tenantId, leverage info of tenant id with http request to do
// the remoting resolution
//
//
// req
//   access to req context
//     ability to supply the req scope metadata
//      access to app scope metadata
//        app.boot
//
//stories
//1 create the tenant resolver
//2 create the model/method resolver -- tell strong remoting what to use
//3 strategies for resource mapping
//4 strategies for models/methods mapping from rest
