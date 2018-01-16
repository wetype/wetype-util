import through from 'through2'
import _ = require('lodash')

function rewrite(options) {
    return through.obj((file, enc, cb) => {
        let { path, contents } = file
        let content = String(contents)
        let reg = /exports\.([\w_]+?)\s=/g
        let reg2 = /exports\.([\w_]+?)\s=/
        let matched = content.match(reg)
        if (matched) {
            let vars = matched.slice(1).map(el => {
                return el.match(reg2)![1]
            })
            let a = _.uniq(vars)
            let duplicates = _.uniq(_.difference(vars, a))
            if (duplicates.length) {
                return cb(
                    new Error(
                        `variables ${duplicates.join(' ,')} are duplicated`
                    ),
                    undefined
                )
            }
        }
        cb(null, file)
    })
}

module.exports = rewrite
