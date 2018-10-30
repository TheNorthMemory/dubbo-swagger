# DUBBO SWAGGER

Thanks the [OpenAPI-Specification](https://github.com/OAI/OpenAPI-Specification) and [node-dubbo](https://www.npmjs.com/package/dubbo) open source projects, here is a simple and easy way to consume the [DUBBO](https://dubbo.io) services.

## Structure

```
├── api
│   ├── any_validFolder-com.foo.interface
│   │   ├── complex.yaml
│   │   ├── minus.yaml
│   │   ├── plus.yaml
│   │   └── meta.json
├── bin
│   └── flush.js
├── index.js
├── lib
│   ├── consumer.js
│   └── descriptor.js
├── package.json
└── static
    ├── index.html
    ├── swagger.json
    └── swagger.yaml
```

## Environment

- `process.env.ZKADDR`

  > the zookeeper registry, while none setting, this project acts as a HTTP based documentation server, it cannot consume any RPC services.

- `process.env.PORT || 3030`

  > koa http server listening port, default is `3030`

- `process.env.CLUSTERNUM || 1`

  > the nodejs cluster worker processing number, under the windows platform, that's always 1, other *nixs platforms, that is default as the CPU cores.
- `process.env.OAI_EXT_FLAT || 'x-flat'`

  > extended key of the OAS, used to describe the input parameters in the plat array like

- `process.env.OAI_EXT_OBJECT || 'x-object'`

  > extended key of the OAS, used to describe the input parameters is a object properties, the value is the class name

- `process.env.OAI_EXT_MAP_KEY || 'x-key'`

  > extended key of the OAS, used to describe one of the parameters is a Map object, the value is describe of the data type and format etc.

- `process.env.OAI_ARRAY_COLLECTION || ','`

  > the default collection of the array by the OAS

- `process.env.APPHOST || 'dubbo.io'`

  > configure for combine and generate `api/*/*.yaml` `host` property, used by the `bin/flush.js`

- `process.env.NO_WRITE`

  > let the `bin/flush.js` only to verify the yaml schema

## `bin/flush.js`

combine and generate `api/*/*.yaml` to `static/swagger.[json|yaml]`

## `lib/consumer.js`

dubbo consumer wrapper

### `lib/descriptor.js`

thansform the HTTP POST (`ctx.request.fields`) data to the [hessian.js](https://www.npmjs.com/package/hessian.js) INPUT

### `index.js`

koa HTTP entry, the routing is listening on `/providers/:serviceName/:serviceMethod` of the DUBBO service consumer.

### `static/index.html`

the swagger-ui entry

## `api/*/meta.json`
- interface
  > config for the DUBBO service
- timeout
  > config for the DUBBO service
- group
  > config of the DUBBO service
- version
  > config of the DUBBO service
- tags
  > used in the swagger UI, `Array[String]` format

## Mapping of the OAS schema and [js-to-java](https://www.npmjs.com/package/js-to-java) types

```json
    'boolean'                : java.Boolean,
    'string'                 : java.String,
    'string_byte'            : java.Byte,
    'string_date'            : java.Date,
    'string_date-time'       : java.Date,
    'number'                 : java.int,
    'number_float'           : java.Float,
    'number_double'          : java.Double,
    'integer'                : java.Integer,
    'integer_int64'          : java.Long,

    'object_map'             : java.Map,

    'array_boolean'          : java.array.Boolean,
    'array_string'           : java.array.String,
    'array_string_byte'      : java.array.Byte,
    'array_string_date'      : java.array.Date,
    'array_string_date-time' : java.array.Date,
    'array_number'           : java.array.int,
    'array_number_float'     : java.array.Float,
    'array_number_double'    : java.array.Double,
    'array_integer'          : java.array.Integer,
    'array_integer_int64'    : java.array.Long,
```

## Examples

api/any_validFolder-com.foo.interface/meta.json

```json
{
    "interface": "com.foo.interface",
    "timeout": 100,
    "tags": [
        "Math测试"
    ]
}
```

api/any_validFolder-com.foo.interface/plus.yaml

```yaml
summary: 'a+b=?'
x-object: com.foo.rpc.plus
parameters:
  - name: a
    in: formData
    type: integer
    format: int32
  - name: b
    in: formData
    type: integer
    format: int32
responses:
  '200':
    description: ''
```

api/any_validFolder-com.foo.interface/minus.yaml


```yaml
summary: 'a-b=?'
x-flat: true
parameters:
  - name: a
    in: formData
    type: integer
    format: int32
  - name: b
    in: formData
    type: integer
    format: int32
responses:
  '200':
    description: ''
```

api/any_validFolder-com.foo.interface/complex.yaml

```yaml
summary: 'complex request'
x-object: com.foo.rpc.complex
parameters:
  - name: a
    in: formData
    type: integer
    format: int64
    required: true
  - name: b
    in: formData
    type: string
    required: true
  - name: c
    in: formData
    type: array
    items:
      type: string
  - name: d
    in: formData
    type: object
    additionalProperties:
      x-key:
        type: string
      type: string
  - name: e
    in: formData
    type: array
    items:
      type: integer
      format: int64
  - name: f
    type: number
    nullable: true
    format: double
  - name: g
    nullable: true
    type: integer
  - name: h
    nullable: true
    type: number
    format: float
  - name: i
    in: formData
    nullable: true
    type: array
    items:
      type: object
      x-object: io.dubbo.model.one
      properties:
        J:
          type: integer
          format: int64
        K:
          type: string
        L:
          type: array
          items:
            type: string
        M:
          type: object
          x-object: io.dubbo.model.two
          properties:
            N:
              type: string
            O:
              type: integer
              format: int64
  - name: p
    in: formData
    type: integer
    format: int64
    default: '0'
```

## Installation

`npm install`

## Running

`ZKADDR=127.0.0.1:2181 DEBUG=dubbo:* CLUSTERNUM=1 NO_DEPRECATION=koa node index.js`

open a browser and visit the `http://127.0.0.1:3030` URL, then the swagger UI shown. `Try it out` then `Execute` to comsue the DUBBO services.

## Licensing

MIT
