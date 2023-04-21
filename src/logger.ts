import { appendFileSync, readdirSync, writeFileSync } from 'fs'

function logger() {
    const items = readdirSync('..')

    if (!items.includes('server.log')) {
        // create file
        writeFileSync('server.log', '')
    }

    return function log(...message: any[]) {
        const date = new Date()
        const time = `${date.toLocaleString()}`
        const log = `[${time}] ${message.join(' ')}\n`

        appendFileSync('server.log', log)
    }
}

export const log = logger()
