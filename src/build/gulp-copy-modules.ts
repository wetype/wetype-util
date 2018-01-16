import through = require('through2')
const copyNodeModule = require('copy-node-modules')
const Path = require('path')
const copy = require('copy')
const fs = require('fs')

export function copyModules() {
    return through.obj((file, enc, cb) => {
        let { path, contents } = file
        // package.json
        let pkgJson = String(contents)
        let { main, name } = JSON.parse(pkgJson)
        // 入口文件的绝对路径
        let mainPath = Path.resolve(path, '../' + main)
        if (name === 'wetype-simple') {
            mainPath = Path.resolve(path, '../dist/wetype.js')
        }
        fs.readFile(mainPath, 'utf-8', (err, data) => {
            if (err) {
                return cb(err)
            }
            file.contents = new Buffer(data)
            file.path = Path.resolve(path, '../' + name + '.js')
            cb(null, file)
        })
    })
}
