# poc-loopback-multitenancy

Basic proof of concept for multitenancy in LoopBack.

## Design

- Customer1
 - datasource: `db`
 - instances: `[{name: 'Andy', name: 'Bob', name: 'Carol'}]`
- Customer2
 - datasource: `db2`
 - instances: `[{name: 'Dan', name: 'Eric', name: 'Francis'}]`

```
START                       :
|                           :   +---------------+             +--------------+
+--/api/customers?tenant=1----->|tenant resolver|--tenantId-->|model resolver|
                            :   +---------------+             +--------------+
                            :                                         |
                            :                                         v
+--[{relevant models}]<--------------------------- (Customer + tenantId).find()
|                           :
END                         :
```

## How it works

A request to `/api/customers?tenant=1` comes in.

The tenant-resolver middleware parses the tenant identifier passed in the query
string. The tenant id is then stored in `req.tenantId` and passed down to the
next middleware.

Next, the model-resolver middleware is triggered (and given the request with the
tenant identifier set -- `req.tenantId`). The model resolver uses the tenant
id to determine which model to call.

For example, If tenant id is 1, use the Customer1 model (which is attached to
datasource 1 -- `db`) and fetch it's associated data. If tenant id is 2,
use the Customer2 model (which is attached to datasource 2 -- `db2`) and fetch
it's associated data.

## Concepts

We basically use a combination of middleware to get the tenant id and use it to
determine which physical model to call during runtime. In this case, we've
already preconfigured the physical models (using the logical models defined in
`model.json` files) before the application is started.

## Considerations

- The way LB is coded today do not allow for multiple model definitions (we are
  forced to create two separate models to prevent naming collisions --
  `Customer1` and `Customer2` instead of just one definition `Customer`
- In this POC, we hardcode model resolution to simplify the implemention (ie.
  `Customer + tenantId`, but in the real version, we should probably also
  dynamically determine the model to call (ie. Model.name + tenantId). This can
  easily be done by parsing the endpoint for the model name (ie.
  /api/**customers**]?tenant=1 -- the customers part of the URI for example)
- Datasources cannot be changed dynamically during runtime since they are mapped
  in the configuration file before the app is started. We could probably do this
  with another resolution layer before actually fetching the instances

## Tests

Run `npm test` in the project root.
