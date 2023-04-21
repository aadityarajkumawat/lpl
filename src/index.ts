import { config } from 'dotenv'
import { foxNewsScraper } from './fox_news'
import { log } from './logger'

config()

async function main() {
    // await initChroma()
    await foxNewsScraper()
}

main()
    .then(() => log('Successfully Completed!'))
    .catch((e) => {
        log(e.message)
    })
