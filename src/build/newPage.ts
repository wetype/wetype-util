import fs = require('fs')

let [type, name] = process.argv.slice(-2)

let nameCamel = name.replace(/(\w)/, (m, $) => $.toUpperCase())
let pugTpl = `
include ../../pug/weui-mixins
    
`
let lessTpl = ``
let pageTsTpl = `
import { Page, wx, wt, types } from 'wetype-simple'

@Page.decor({
    config: {
        navigationBarTitleText: ''
    }
})
class ${nameCamel} extends Page {

    onLoad(options: types.OnloadOptions) {

    }

}
`
let componentTsTpl = `
import { Component, wx, wt, types } from 'wetype-simple'

@Component.decor({
    config: {}
})
class ${nameCamel} extends Component {



}

`

let tsTpl = type === 'page' ? pageTsTpl : componentTsTpl

let fileName = type === 'page' ? name : name + '.com'

fs.mkdirSync(`src/${type}s/${name}`)
fs.writeFileSync(`src/${type}s/${name}/${fileName}.ts`, tsTpl, `utf-8`)
fs.writeFileSync(`src/${type}s/${name}/${fileName}.pug`, pugTpl, `utf-8`)
fs.writeFileSync(`src/${type}s/${name}/${fileName}.less`, lessTpl, `utf-8`)
