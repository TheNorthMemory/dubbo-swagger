const fs     = require('fs')
const path   = require('path')
const Koa    = require('koa')
const route  = require('koa-path-match')({})
const parser = require('koa-better-body')
const serve  = require('koa-static')
const debug  = require('debug')('dubbo:swagger')
const jsyaml = require('js-yaml')

const zkAddr   = process.env.ZKADDR
const httpPort = process.env.PORT || 3030

const numCPUs = 'win32' === process.platform ? 1 : (process.env.CLUSTERNUM || require('os').cpus().length)
const cluster = require('cluster')
if (!module.parent && cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
        debug(`Worker ${worker.process.pid} died`)
        cluster.fork()
    })
    return debug(`Master ${process.pid} is running`)
}
module.parent || debug(`Worker ${process.pid} started`)

const app = new Koa()

const descriptor = require('./lib/descriptor')
const consumer = require('./lib/consumer')

app.on('error', err => debug('%o', err))

app.use(parser())
app.use(serve(path.join(__dirname, 'static')))

app.use(route('/providers/:serviceName/:serviceMethod').post(async ctx => {
    const service = ctx.params.serviceName
    const method = ctx.params.serviceMethod

    const spec = jsyaml.safeLoad(fs.readFileSync(`./api/${service}/${method}.yaml`))
    const meta = require(`./api/${service}/meta.json`)
    const params = descriptor(Object.assign({}, ctx.request.fields), spec)

    ctx.body = await consumer(zkAddr, service, method, meta, params)
}))

module.exports.app = app
module.exports.consumer = consumer
module.exports.descriptor = descriptor

module.parent || app.listen(httpPort, () => debug(`listen on ${httpPort}`))
