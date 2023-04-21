import { appendFileSync, writeFileSync } from 'fs'

export const mytime = () => {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }

    // @ts-ignore
    const formatter = new Intl.DateTimeFormat('en-IN', options)
    const currentTime = formatter.format(now)
    return currentTime
        .replace(', ', '_')
        .replace(' ', '_')
        .replace('/', '_')
        .replace('/', '_')
}

export function logger() {
    // create file
    const fileName = `server_${mytime()}.log`

    writeFileSync(fileName, '', { encoding: 'utf-8' })

    return function log(...message: any[]) {
        const time = mytime() //`${date.toLocaleString()}`
        const log = `[${time}] ${message.join(' ')}\n`

        appendFileSync(fileName, log)
    }
}

export const log = logger()
