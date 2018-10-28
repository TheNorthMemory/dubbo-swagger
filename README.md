# DUBBO SWAGGER

得益于开源项目 [OpenAPI-Specification](https://github.com/OAI/OpenAPI-Specification) 及 [node-dubbo](https://www.npmjs.com/package/dubbo)，使用纯JavaScript远程消费 [DUBBO](https://dubbo.io) 服务。

## 项目结构

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

## 环境变量

- `process.env.ZKADDR`

  > zookeeper 注册中心地址，如未设置，http服务仅能当作接口文档，无法发起有效RPC调用

- `process.env.PORT || 3030`

  > koa http server 监听端口

- `process.env.CLUSTERNUM || 1`

  > nodejs cluster worker进程数目，windows 平台默认为1，*nix 平台默认为

- `process.env.OAI_EXT_FLAT || 'x-flat'`

  > OAS 扩展key，声明入参是扁平入参

- `process.env.OAI_EXT_OBJECT || 'x-object'`

  > OAS 扩展key，声明入参(有且只有1个入参)是对象入参

- `process.env.OAI_EXT_MAP_KEY || 'x-key'`

  > OAS 扩展key，声明入参如果是Map对象，map-key的数据类型描述

- `process.env.OAI_ARRAY_COLLECTION || ','`

  > OAS 默认array类型分隔符

- `process.env.APPHOST || 'dubbo.io'`

  > `bin/flush.js` 生成文档时的默认主机地址

- `process.env.NO_WRITE`

  > 如设置此变量，用途仅校验yaml语法是否正确，不写入最终 `static/swagger.*`

## `bin/flush.js`

是把 api 目录下的 `*/yaml` 组合生成为 `static/swagger.*` 文件

## `api/*/meta.json`
- interface
- timeout
- group
- version
- tags
  > 扩展的 swagger UI 标签，Array[String] 结构

## 基础OAS数据结构与 [js-to-java](https://www.npmjs.com/package/js-to-java) 类型映射

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

## 示例

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

## 运行

`ZKADDR=127.0.0.1:2181 DEBUG=dubbo:* CLUSTERNUM=1 NO_DEPRECATION=koa node index.js`

打开浏览器访问 `http://127.0.0.1:3030` 即可看到 swagger ui 提供的基础参数界面；使用 `Try it out` 可以发起正常的表单输入；使用 `Execute` 即可发起dubbo RPC调用。

## Licensing

MIT
