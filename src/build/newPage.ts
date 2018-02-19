// import fs = require('fs')
import fs = require('fs-extra')
import Path = require('path')

export function newPage(name: string, path: string, type: string) {
    let nameCamel = name.replace(/(\w)/, (m, $) => $.toUpperCase())
    let pugTpl = ``
    let scssTpl = ``
    let pageTsTpl = `
import { Page, wx, wt, types } from 'wetype'

@Page.decor({
    config: {}
})
class ${nameCamel} extends Page {

    onLoad(options: types.OnloadOptions) {

    }

}
    `
    let componentTsTpl = `
    import { Component, wx, wt, types } from 'wetype'
    
    @Component.decor({
        config: {}
    })
    class ${nameCamel} extends Component {
    
    
    
    }
    
    `

    let tsTpl = type === 'pages' ? pageTsTpl : componentTsTpl

    let fileName = type === 'pages' ? name : name + '.com'

    let write = (path: string, fileName: string, ext: string, tpl) => {
        let realPath = Path.join(path, fileName, fileName + ext)
        fs.writeFileSync(realPath, tpl, 'utf-8')
    }

    let realPath = Path.join(path, fileName)

    fs.ensureDir(realPath, err => {
        write(path, fileName, '.ts', tsTpl)
        write(path, fileName, '.pug', pugTpl)
        write(path, fileName, '.scss', scssTpl)
        console.log('已创建', Path.join(realPath))
    })
}
