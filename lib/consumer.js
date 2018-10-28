const dubbo = require('dubbo')
const debug = require('debug')('dubbo:consumer')
const consumer = (zkAddr, service, method, options, params) => {

    debug('===> %j', params)

    const inspire = new dubbo({
        application: 'dubbo-swagger',
        pool: false,
        zookeeper: {
            host: zkAddr
        },
    })

    const rpc = inspire
        .register(service, options)
        .service(service)
    return rpc.invoke.apply(rpc, Array.isArray(params) ? [method, ...params] : [method, params])
        .then(data => {
            debug('<=== %j', data)
            inspire._zookeeper.close()
            return data
        }).catch(err => {
            debug('<x== %j', err)
            inspire._zookeeper.close()
            return {
                code: 500,
                message: err.code,
                fullMessage: `no providers available for the ${service}(${options.interface})/${method}`
            }
        })
}

module.exports = consumer
