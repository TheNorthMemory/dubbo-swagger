const java = require('js-to-java')
const {isArray, isPlainObject, isUndefined, noop} = require('lodash')

java.Date = value => java('java.util.Date', new Date(/^\d{13}$/.test(value) ? Number(value) : value))
java.array.Date = values => java('[java.util.Date', values.map(value => java.Date(value)))

const OAI_DEFAULT = 'default'
const OAI_EXT_FLAT = process.env.OAI_EXT_FLAT || 'x-flat'
const OAI_EXT_OBJECT = process.env.OAI_EXT_OBJECT || 'x-object'
const OAI_EXT_MAP_KEY = process.env.OAI_EXT_MAP_KEY || 'x-key'
const OAI_ARRAY_COLLECTION = process.env.OAI_ARRAY_COLLECTION || ','

const toTarget = {
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
}

const toJava = (value, spec) => {
    let {type, format} = spec,
        target = toTarget[`${type}_${format}`] || toTarget[type] || noop
    return target(isUndefined(value) ? spec[OAI_DEFAULT] : value)
}

const cast = {
    array       : value => isUndefined(value) ? [] : isArray(value) ? value : value.split(OAI_ARRAY_COLLECTION),
    arrayobject : value => isUndefined(value) ? [] : isArray(value) ? value : JSON.parse(`[${value}]`),
    object      : value => isUndefined(value) ? {} : isPlainObject(value) ? value : JSON.parse(value),
    schema      : source => Object.keys(source).reduce((spec, name) => {
        spec.push({name, ...source[name]})
        return spec
    }, []),
}

const transform = (inputs, schema) => (schema || []).reduce((result, spec) => {
    if (spec.nullable && isUndefined(inputs[spec.name])) {
        return result
    }
    if (spec.type === 'array') {
        let {type, format, properties} = spec.items || {}
        inputs[spec.name] = (cast[`${spec.type}${type}`] || cast[spec.type])(inputs[spec.name])
        if (!!~['boolean', 'string', 'integer', 'number'].indexOf(type)) {
            spec.format = spec.format || isUndefined(format) ? type : `${type}_${format}`
            result[spec.name] = toJava(inputs[spec.name], spec)
        } else
        if (type === 'object' && isPlainObject(properties)) {
            let stub = cast.schema(properties)
            result[spec.name] = java(`[${spec.items[OAI_EXT_OBJECT]}`, inputs[spec.name].reduce((target, pipe) => {
                target.push(transform(pipe, stub))
                return target
            }, []))
        }
    } else
    if (spec.type === 'object') {
        inputs[spec.name] = cast.object(inputs[spec.name])
        if (isPlainObject(spec.properties)) {
            result[spec.name] = java(`${spec[OAI_EXT_OBJECT]}`, transform(inputs[spec.name], cast.schema(spec.properties)))
        } else
        // FIXME: only transform the normal(b/s/i/n) Map/Dictionary, thus the JSON hasn't this kind structure
        if (isPlainObject(spec.additionalProperties)) {
            let _map = new Map
            for (let [key, value] of Object.entries(inputs[spec.name])) {
                _map.set(toJava(key, spec.additionalProperties[OAI_EXT_MAP_KEY]), toJava(value, spec.additionalProperties))
            }
            spec.format = spec.format || 'map'
            result[spec.name] = toJava(_map, spec)
        }
    } else {
        result[spec.name] = toJava(inputs[spec.name], spec)
    }
    return result
}, {})

const descriptor = (inputs = {}, schema = {}) => {
    let spec = schema.get || schema.post || schema.put || schema.patch || schema.delete || schema || {},
        values = transform(inputs, spec.parameters)
    return spec[OAI_EXT_FLAT] ? Object.values(values) : java(spec[OAI_EXT_OBJECT], values)
}

module.exports = descriptor
