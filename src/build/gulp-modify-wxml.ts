import through = require('through2')

export function modifyWxml() {
    return through.obj((file, enc, cb) => {
        let { path, contents } = file
        let content = String(contents)
        let res = div2View(content)
        file.contents = new Buffer(res)
        cb(null, file)
    })
}

function div2View(str) {
    return str.replace(/<(\/?)div/g, (match, $) => `<${$}view`)
}
