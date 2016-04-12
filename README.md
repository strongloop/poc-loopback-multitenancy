# poc-loopback-multitenancy

Basic proof of concept for multitenancy in LoopBack.

## Design

- Customer
 - datasource: `db`
   - instances: `[{name: 'Andy', name: 'Bob', name: 'Carol'}]`
 - datasource: `db2`
   - instances: `[{name: 'Dan', name: 'Eric', name: 'Francis'}]`

```
START                       :
|                           :   +---------------+             +--------------+
+--/api/customers?tenant=1----->|tenant resolver|--tenantId-->|model resolver|
                            :   +---------------+             +--------------+
                            :                                         |
                            :                                         v
                            :                      generate physical model using
+---[{relevant models}]<--------Customer.find()----logical model and attach it
|                           :                      to corresponding datasource
END                         :
```

## How it works

A request to `/api/customers?tenant=1` comes in.

The tenant-resolver middleware parses the tenant identifier passed in the query
string. The tenant id is then stored in `req.tenantId` and passed down to the
next middleware.

Next, the model-resolver middleware is triggered (and given the request with the
tenant identifier set -- `req.tenantId`). The model resolver then retrieves the
corresponding logical model (model class based on tenant id) and uses it to
generate a physical model during runtime. This model is then dynamically
attached to it's corresponding datasource (also determined by the tenant id).

Finally, the data is fetched and returned to the caller using the dynamically
generated physical model.

For example, given a tenant id of 1, the relevant datasources for this tenant is
retrieved (can be multiple -- ie. mongo + mysql). Then the logical model is
retrieved (shared schemas in this case -- every tenant uses the same `Customer`
model class) and used to generate the physical model. We then attach the
physical model to the relevant datasource, fetch the data and return it to the
claler accordingly.

## Concepts

We basically use a combination of middleware to get the tenant id and use it to
determine which logical model and datasource to use. The logical
model is used to generate a physical model at runtime using the provided tenant
id. In this case, we've preconfigured the logical model (in model.json files)
before the application is started, but the physical models (and their attached
datasources) are determined dynamically when the requests are received.

## Considerations

