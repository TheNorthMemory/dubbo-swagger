const fs = require('fs')
const path = require('path')
const jsyaml = require('js-yaml')
const debug = require('debug')('dubbo:yaml')

let base = path.join(__dirname, '..', 'api')
let target = require(path.join(base, 'meta.json'))
target = Object.assign(target, {host: process.env.APPHOST ? process.env.APPHOST : 'dubbo.io'})

debug(`scan the yaml files in the folder: ${base}`)

const wont = process.env.NO_WRITE ? [] : require(path.join(base, 'excludes.json'))
fs.readdirSync(base).filter(name => !wont.includes(name)).map(name => {
    let which = path.join(base, name)
    if (fs.statSync(which).isDirectory()) {
        debug(`process the service folder: ${which}`)
        let meta = require(path.join(which, 'meta.json'))
        fs.readdirSync(which).filter(file => file !== 'meta.json').map(file => {
            let yaml = path.join(which, file)
            debug(`process the method yaml: ${yaml}`)

            let uri = `/${name}/${file}`.replace(/\.\w+$/, '')
            let def = jsyaml.safeLoad(fs.readFileSync(yaml))
            let post = { ...def, tags: Array.from(new Set( [...meta.tags, ...(def.tags ? def.tags : [])] )) }
            target.paths[uri] = {post}
        })
    }
})

if (process.env.NO_WRITE) {
    return debug(`verified the folder: ${base}`)
}

target = JSON.stringify(target, null, '    ')

fs.writeFileSync(path.join(base, '..', 'static', 'swagger.json'), target)

fs.writeFileSync(path.join(base, '..', 'static', 'swagger.yaml'), jsyaml.safeDump(jsyaml.safeLoad(target), {lineWidth: 10000}))
