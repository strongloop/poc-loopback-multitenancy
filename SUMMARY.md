# Summary

The following is a summary of the high level design points. The intent is
to identify the building blocks and design choices.

## Components (building blocks)

- Tenant ID resolver
  - Figure out the tenant ID from the data provided by the caller
  - The data could come in a variety of forms (query string, headers, etc)
  - Should be attached to `req.tenantId` for other middleware down the chain to
    use
- Config file
  - Defines mapping from tenant to model to datasource
  - Mappings may or may not share the same model definitions
  - LB doesn't allow different model defs with the same name ATM, workaround for
    now is to namespace accordingly (ie. Customer1, Customer2, etc)
- Model resolver
  - Uses `req.tenantId` from tenant id resolver
  - Parse API endpoint to figure out which model to loop up in the config file
    (ie. `/api/customers` -> find `Customer` in config file with mapping)
  - Uses tenant id to figure out which model def (logical model) to use based on
    mappings in config file
  - Dynamically generate data source using model def and data source settings in
    config file
  - Generate physical model from aforementioned
- HTTP method parser
  - HTTP method to strong-remoting mapping

## Decision points and design considerations

- Tenant ID resolver
  - Input format
    - Query string
    - Headers
- Mapping def
  - Config file
    - Tenant ID to which logical model and which DS?
    - How should we allow duplicate models?
      - Namespacing good enough?
    - Data source to model mapping
      - 1-1 mapping btwn model and DS good enough?
    - May not scale depending on how many apps are hardcoded in the registry
- Model resolver
  - Dynamic model generation and registration
  - Dynamic data source generation and registration
- HTTP method resolver
  - Will need to map with strong-remoting
  - We do not support this OOB ATM
- Subapps
  - Do we want to go with the subapps approach?
  - Since each subapp has it own registries, lower odds of collision
  - More complicated