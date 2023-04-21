import { config } from 'dotenv'
import { foxNewsScraper } from './fox_news'
import { log } from './logger'

config()

// const fileName = `server_${mytime()}.log`

// console.log('writing file', fileName)

// writeFileSync(fileName, '')

async function main() {
    // await initChroma()
    await foxNewsScraper()
}

main().then(() => {
    log('Successfully Completed!')
    process.exit()
})
