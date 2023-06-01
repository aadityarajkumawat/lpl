import puppeteer from 'puppeteer'
import { FOX_NEWS } from '../consts'
import { client } from '../db'
import { log } from '../logger'
import { createArticle, removeAds, removeWeeds } from '../utils'

export async function foxNewsScraperV1() {
    try {
        log('Starting Fox News Scraper')

        const news = client.db('news_directory').collection('news_v1')

        const browser = await puppeteer.launch({
            // headless: false,
        })
        const page = await browser.newPage()
        const URL = FOX_NEWS

        log('Loading Page...')

        await removeAds(page)

        await page.goto(URL, {
            waitUntil: 'load',
            timeout: 0,
        })

        log('Page Loaded')

        await page.waitForSelector('.big-top')
        await page.waitForSelector('.article')

        await removeWeeds(page)

        const articles = await page.$$('.article')

        const articleDocs: Array<ReturnType<typeof createArticle>> = []

        log('Articles Found: ', articles.length)

        for (let i = 0; i < articles.length; i++) {
            const article = articles[i]

            const articleDoc = createArticle('fox_news')

            try {
                const h3 = await article.$eval('h3', (el) => el.textContent)
                if (h3) articleDoc.headline = h3.trim()
                log('Headline', i, h3)
            } catch (error) {
                log(`Couldn't find h3 for article ${i}`)
            }

            try {
                const link = await article.$eval('a', (el) => el.href)
                if (link) articleDoc.link = link
                log('Link', i, link)
            } catch (error) {
                log(`Couldn't find link for article ${i}`)
            }

            const exists = await news.findOne({ link: articleDoc.link })

            if (!exists) {
                articleDocs.push(articleDoc)
            }
        }

        await news.insertMany(articleDocs, {})
    } catch (error) {
        log(error)
    }
}
