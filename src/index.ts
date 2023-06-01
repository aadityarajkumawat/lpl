import { config } from 'dotenv'
import { digestFoxNews } from './content-digester/fox_feed_digester'
import { foxNewsScrapeContent } from './content-loader/fox_news'
import { foxFeedBuilder } from './feed-builder/fox_feed_builder'
import { foxNewsScraperV1 } from './link-scrapers/fox_news_v1'
import { techCrunchLinkScraper } from './link-scrapers/tech_crunch'
import { log } from './logger'

config()

async function main() {
    const cmdArgs = process.argv.slice(2)
    console.log('cmdArgs', cmdArgs, cmdArgs.length)

    if (cmdArgs.length !== 2) {
        log('No arguments provided. Exiting.')
        process.exit()
    }

    const [firstArg, secondArg] = cmdArgs

    if (firstArg === 'scrape') {
        if (secondArg === 'fox_news') {
            await foxNewsScraperV1()
        }
        if (secondArg === 'tech_crunch') {
            await techCrunchLinkScraper()
        }
    }

    if (firstArg === 'scrape_content') {
        if (secondArg === 'fox_news') {
            await foxNewsScrapeContent()
        }
    }

    if (firstArg === 'digest') {
        if (secondArg === 'fox_news') {
            await digestFoxNews()
        }
    }

    if (firstArg === 'build_feed') {
        if (secondArg === 'fox_news') {
            await foxFeedBuilder()
        }
    }
}

main().then(() => {
    log('Successfully Completed!')
    process.exit()
})
