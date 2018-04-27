/**
 *
 *
 */
import { alphabet } from './util'
const _ = require('lodash')
const Entities = require('html-entities').XmlEntities
const entities = new Entities()

export class TplCompiler {
    templateUrl = ''
    prefix = ''
    matchTag = /([\w\-]+)\:\s?([\s\w\+\-\*\/\&\|_\.]+)\,?/g

    render(tplStr, prefix = '') {
        let reg = /<([\w\W\S\s]+?)\/?>/g
        // 记得匹配中文和中文标点
        let reg2 = /([\w\d-\:@#]+?)="([\w\s\,\.\(\)-\=\&\|\+\/\*\{\}\[\]\:\!\?'#^\$\u4e00-\u9fa5\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]+)\"/g
        let reg3 = /([\w\d-\:@#]+?)="([\w\s\,\.\(\)-\=\&\|\+\/\*\{\}\[\]\:\!\?'#^\$\u4e00-\u9fa5\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]+)\"/

        return tplStr.replace(reg, (match, $) => {
            let matched = $.match(reg2)
            let tagNameMatched = match.match(/<([\w\-]+)\s/)
            let isSelfCloseTag = /\/>/.test(match)
            if (matched && tagNameMatched) {
                let pairs = {}
                let tagName = tagNameMatched[1]
                for (let p of matched) {
                    let m = p.match(reg3)
                    if (m) {
                        pairs[m[1]] = m[2]
                    }
                }

                let attrs = Object.keys(pairs)
                let _class = pairs[':class']
                let _for = pairs[':for']
                let _if = pairs[':if']
                let _else = pairs[':else']
                let _show = pairs[':show']
                let _hide = pairs[':hide']
                let _style = pairs[':style']
                let _model = pairs[':model']
                let _events = attrs.filter(el => el[0] === '@' || el[0] === '#')
                let _others = attrs.filter(
                    el =>
                        el[0] === ':' &&
                        !/class|for|show|hide|style|if|model|else/.test(el)
                )
                // console.log(attrs)
                if (_class) {
                    let parsedClass = this.handleClass(_class)
                    pairs['class'] = pairs['class'] || ''
                    pairs['class'] += ' ' + parsedClass
                    delete pairs[':class']
                }

                if (_for) {
                    let parsed = this.handleFor(_for)
                    if (parsed) {
                        _.assign(pairs, parsed)
                        delete pairs[':for']
                    }
                }

                if (_if) {
                    pairs['wx:if'] = `{{${_if}}}`
                    delete pairs[':if']
                }

                if (_else) {
                    pairs['wx:else'] = ''
                    delete pairs[':else']
                }

                if (_show && !_hide) {
                    pairs['hidden'] = `{{!(${_show})}}`
                    delete pairs[':show']
                } else if (_show && _hide) {
                    pairs['hidden'] = `{{!${_show} && ${_hide}}}`
                    delete pairs[':show']
                    delete pairs[':hide']
                } else if (!_show && _hide) {
                    pairs['hidden'] = `{{${_hide}}}`
                    delete pairs[':hide']
                } else if (_model) {
                    const bindchange = [
                        'checkbox',
                        'picker',
                        'picker-view',
                        'radio',
                        'switch',
                        'slider'
                    ]
                    const bindinput = ['input', 'textarea']
                    if (bindchange.indexOf(tagName) > -1) {
                        pairs['bindchange'] = `${_model}Input`
                    } else if (bindinput.indexOf(tagName) > -1) {
                        pairs['bindinput'] = `${_model}Input`
                    }
                    pairs['value'] = `{{${_model}}}`
                    delete pairs[':model']
                }

                _events.forEach(key => {
                    let method = key[0] === '@' ? 'bind' : 'catch'
                    let name = key.slice(1)
                    let val = pairs[key]
                    // 若带参数
                    if (/.+\(/.test(val)) {
                        // 匹配参数
                        let argsMatched = val.match(
                            /[\d\w\s]+\(([\d\w\,\s]+)\)/
                        )
                        if (argsMatched) {
                            let args = argsMatched[1]
                                .split(',')
                                .map(el => el.trim())
                            val = val.match(/(.+?)\(/)[1]
                            args.forEach((el, i) => {
                                let ii = alphabet(i)
                                pairs[`data-arg-${ii}`] = `{{${el}}}`
                            })
                        }
                    }
                    pairs[`${method}${name}`] = val
                    delete pairs[key]
                })

                _others.forEach(key => {
                    pairs[key.slice(1)] = `{{${pairs[key]}}}`
                    delete pairs[key]
                })
                // console.log(pairs)
                let res = _.map(
                    pairs,
                    (v, k) => `${k}="${entities.decode(v)}"`
                ).join(' ')
                let selfClose = isSelfCloseTag ? ' /' : ''
                return `<${tagName} ${res}${selfClose}>`
            }
            return match
        })
    }

    replaceComponent(componentName, componentTpl, pageTpl) {
        // let reg = /([\w\-]+)\:\s?([\s\w\+\-\*\/\&\|_\.]+)\,?/g
        let reg = new RegExp(
            `<${componentName}\\s\\.+?>\\.+?\\<\\/${componentName}>`
        )
        let matched = componentTpl.match(reg)
    }

    handleClass(str) {
        // 先去掉左右的大括号
        str = str.replace(/\{|\}/g, '')
        let reg = /([\w\-'"_]+)\:\s?([\s\w\+\-\*\/\&\|_\.\!\=\'\(\)\[\]]+)\,?/g
        return str.replace(
            reg,
            (match, className, expression) =>
                `{{${expression} ? '${className.replace(/'/g, '')}' : ''}} `
        )
    }

    handleFor(str) {
        let resStr = ($1, $2, $3, $4) => {
            return {
                'wx:for': `{{${this.prefix}${$1}}}`,
                'wx:key': $2,
                'wx:for-item': $3,
                'wx:for-index': $4
            }
        }

        let matched = str.match(/([\w\s\,\(\)]+)\sin\s([\w\.]+)/)
        if (matched) {
            if (/\,/.test(matched[1])) {
                let arr = matched[1]
                    .split(',')
                    .map(el => el.trim().replace(/\(|\)/g, ''))
                return resStr(matched[2], arr[1], arr[0], arr[1])
            }
            return resStr(matched[2], 'index', matched[1], 'index')
        }
    }

    handleEvent(key, val, pairs) {}
}
