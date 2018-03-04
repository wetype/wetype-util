import through from 'through2'
const Path = require('path')

export default function(options) {
    return through.obj((file, enc, cb) => {
        let { path, contents } = file
        let isPage = /\/pages\//.test(path)
        let isComponent = /\/components\//.test(path)
        let base = Path.parse(path).base

        if (isPage) {
            base = base + '.page'
        } else if (isComponent) {
            base = base + '.com'
        }
        console.log('path', path)
        console.log('base', base)
        // file.path =
    })
}
