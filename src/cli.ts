import commander = require('commander')
import child_precess = require('child_process')
import { exec } from './util'
import { TEMPLATE_GIT_REPO } from './constants'

export const cli = () => {
    commander
        .version('0.0.1')
        .command('init <projectnaName>')
        .action(projectnaName => {
            console.log('开始下载WeType开发脚手架，请稍等')
            exec(
                `git clone ${TEMPLATE_GIT_REPO} -o origin -b template ${projectnaName}`
            )
                .then(() => {
                    console.log(
                        '------------\n恭喜您！克隆成功\n------------\n 请进入项目安装npm包！'
                    )
                })
                .catch(err => {
                    console.log('下载错误')
                })
        })

    commander.command('update').action(() => {
        console.log('good')
    })

    commander.parse(process.argv)
}
