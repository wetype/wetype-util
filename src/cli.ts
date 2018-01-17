import commander = require('commander')
import child_precess = require('child_process')
import { TEMPLATE_GIT_REPO } from './constants'

export const cli = () => {
    commander
        .version('0.0.1')
        .command('init <projectnaName>')
        .action(projectnaName => {
            console.log('开始下载WeType开发脚手架，请稍等')
            child_precess.exec(
                `git clone ${TEMPLATE_GIT_REPO} -o origin -b dev ${projectnaName}`,
                err => {
                    if (err) {
                        console.log('下载错误')
                    } else {
                        console.log(
                            '------------\n恭喜您！克隆成功\n------------\n 请进入项目安装npm包！'
                        )
                    }
                }
            )
        })

    commander.command('')

    commander.parse(process.argv)
}
