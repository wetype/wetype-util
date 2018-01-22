import commander = require('commander')
import child_precess = require('child_process')
import { exec, log } from './util'
import { TEMPLATE_GIT_REPO } from './constants'
import { newPage } from './build/newPage'
import Path = require('path')

const CWD = process.cwd()
const wetypeConfig = require(Path.join(CWD, 'package.json')).wetype

commander
    .version('0.0.1')
    .command('init <projectnaName>')
    .action(projectnaName => {
        log('开始下载WeType开发脚手架，请稍等')
        exec(
            `git clone ${TEMPLATE_GIT_REPO} -o origin -b template ${projectnaName}`
        )
            .then(() => {
                log(
                    '------------\n恭喜您！克隆成功\n------------\n 请进入项目安装npm包！'
                )
            })
            .catch(err => {
                log('下载错误')
            })
    })

commander.command('update').action(() => {
    log(wetypeConfig)
})

commander
    .command('new <pageName>')
    .option('-t, --type <type>', 'page 页面，com 组件')
    .option('-p, --path <path>', '子路径')
    .action((pageName: string, options) => {
        let { path, type } = options
        if (wetypeConfig) {
            type = type === 'com' ? 'components' : 'pages'
            let srcPath = Path.join(CWD, wetypeConfig.srcDir || 'src')
            let absPath = Path.join(srcPath, type, path || '')
            newPage(pageName, absPath, type)
        }
    })

commander.command('build').action(() => {
    if (wetypeConfig) {
        exec('npm start')
    }
})

commander.parse(process.argv)
