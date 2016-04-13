# poc-loopback-multitenancy

Advanced proof of concept for multitenancy in LoopBack.

## Design

- Customer
 - datasource: `mysql`
   - type: `memory`
   - instances: `[{name: 'Andy', name: 'Bob', name: 'Carol'}]`
 - datasource: `mongodb`
   - type: `memory`
   - instances: `[{name: 'Dan', name: 'Eric', name: 'Francis'}]`

```
START                       :
|                           :   +---------------+             +--------------+
+--/api/customers?tenant=1----->|tenant resolver|--tenantId-->|model resolver|
                            :   +---------------+             +--------------+
                            :                                         |
                            :                                         v
                            :                      generate physical model using
+--[{relevant models}]<----------Customer.find()---logical model and attach it
|                           :                      to corresponding datasource
v                           :                      dynamically
END                         :
```

## How it works

A request to `/api/customers?tenant=1` comes in.

The tenant-resolver middleware parses the tenant identifier passed in the query
string. The tenant id is then stored in `req.tenantId` and passed down to the
next middleware.

Next, the model-resolver middleware is triggered (and given the request with the
tenant identifier set -- `req.tenantId`).

The request endpoint is then parsed to determine the model to generate (in this
case `/api/customers`, which is massaged into `Customer` -- the logical model
name).

After, the tenant configuration (model mapping) is used to dynamically generate
the model based on the logical model name. The combination of the logical model
name and tenant configuration is used to determine the correct model definition
to use. This "shared" definition is then used to generate the physical model.

The physical model is then dynamically attached to datasource defined in
the tenant configuration. The dynamically generated datasource is then added
to the runtime datasource registry (ie. app.datasources).

Finally, the data is fetched and returned to the caller using the dynamically
generated physical model.

## Concepts

We basically use a combination of middleware to get the tenant id and use it to
determine which logical model and datasource to use. The logical model is used
to generate a physical model at runtime using the provided tenant id. In this
case, we've preconfigured the logical model (in `model.json` files) before the
application is started, but the physical models (and their attached
datasources) are determined dynamically (using the preconfigured information
from `tenant-config.json`) when the requests are received.

## Considerations

- The tenant configuration is read from a file in this POC, we should probably
  allow for runtime config injection (config level, model level, request level,
  etc)
- Model and datasources mappings should be configurable during runtime at
  various levels (in this POC, the datasources are hardcoded in
  `tenant-config.json`)
- Shared definitions in this POC are simple, but real world scenarios may
  require multiple `Customer` models, each being slightly different depending on
  which datasource is used (ie. `elasticsearch` vs `oracle, etc). A more
  flexibile model should be considered (Loopback does not allow for duplicate
  model names ATM)
- Maybe all apps should be multitenant capable out of box (ie. default id to
  tenant 1) to simply internal architecture. Simply turning off a config should
  allow us to reuse the same codebase
- Interestingly, when creating sample data, not hardcoding datasource
  configuration during app boot made it more difficult to insert data into
  datasources that do not exist during app boot up (but are needed during app
  runtime -- [see sample-data.js](server/boot/sample-data.js#L8-L11))

## Tests

Run `npm test` in the project root.
