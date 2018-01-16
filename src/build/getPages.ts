import _ = require('lodash')
const dirTree = require('directory-tree')
const filteredTree = dirTree('src/pages', { extensions: /\.ts/ })
const Path = require('path')
const { correctSep } = require('./util')

module.exports = function getPages(mainPage, excludePages) {
    let result: string[] = []
    function recursive(tree) {
        tree.children.forEach((el, i) => {
            if (el.children[0].type === 'directory') {
                recursive(el)
            } else {
                let name = Path.parse(el.path).name
                let distPath = el.path.replace(`src${Path.sep}`, '')
                let path = correctSep(Path.join(distPath, name))
                result.push(path)
            }
        })
    }
    recursive(filteredTree)
    mainPage = mainPage || 'pages/index/index'
    result = result.sort(el => (el === mainPage ? -1 : 1))
    return _.difference(result, excludePages)
}
