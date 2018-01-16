import through = require('through2')
import * as util from './util'
const fs = require('fs-extra')
const Path = require('path')
const _ = require('lodash')
const getPages = require('./getPages')

declare var json: any

export function writeJson() {
    return through.obj((file, enc, cb) => {
        let { path, contents } = file
        let content = String(contents)
        let matched = content.match(
            /[App|Page|Component]\.decor\(\{([\s\S\w\W]+?)\}\)/i
        )
        let isComponent = /Component\.decor/.test(content)
        let isPage = /Page\.decor/.test(content)
        let isApp = /App\.decor/.test(content)
        let hasConfig = isApp || isComponent || isPage
        if (hasConfig && matched) {
            // 去掉behaviors
            let m = rmBehaviorArr(matched[1])
            let json: any = new Function(`return { ${m} } `)()
            let config = json.config || {}
            // 若是组件，则自动添加组件配置
            if (isComponent) {
                config = {
                    component: true
                }
            } else if (isApp) {
                config.pages = getPages(config.mainPage, config.excludePages)
                delete config.mainPage
                delete config.excludePages
            } else if (isPage) {
                Object.keys(config.usingComponents || {}).forEach(name => {
                    let v = config.usingComponents[name]
                    config.usingComponents[name] = `./${v}.com`
                })
            }
            let relativePath = Path.relative(process.cwd(), path) + 'on'
            let dir = Path.dirname(relativePath)
            return fs.ensureDir(dir, err => {
                fs.writeJson(relativePath, config, err => cb(err, file))
            })
        }
        cb(null, file)
    })
}

function rmBehaviorArr(str) {
    return str
        .replace(/behaviors:\s?\[.+?\]/, '')
        .replace(/mixins:\s?\[.+?\]/, '')
}

function getConfig(str) {
    str.match(/config:\s?\{\}/)
}
