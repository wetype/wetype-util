import child_process = require('child_process')

export const exec = comm => {
    return new Promise((resolve, reject) => {
        child_process.exec(comm, (err, stdout, stderr) => {
            if (err) return reject(err)
            resolve(stdout)
        })
    })
}

export const log = console.log
