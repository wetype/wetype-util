import through = require('through2')
import { TplCompiler } from './compile-tpl'

const compiler = new TplCompiler()

export function compileTpl() {
    return through.obj((file, enc, cb) => {
        let { path, contents } = file
        let content = String(contents)
        let res = compiler.render(content)
        file.contents = new Buffer(res)
        cb(null, file)
    })
}
