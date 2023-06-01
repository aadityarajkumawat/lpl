import { WithId } from 'mongodb'
import puppeteer from 'puppeteer'
import { client } from '../db'
import { log } from '../logger'
import {
    createArticle,
    removeAds,
    removeWeeds,
    sanitizeArticleContent,
} from '../utils'

export async function foxNewsScrapeContent() {
    try {
        log('Starting Fox News Scraper')

        const news = client.db('news_directory').collection('news_v1')

        const browser = await puppeteer.launch({
            // headless: false,
        })

        const articleDocs = await news
            .find({
                source: 'fox_news',
                content: '',
                createdAt: {
                    $gt: new Date(new Date().getTime() - 1000 * 60 * 60 * 36),
                },
            })
            .toArray()

        for (let i = 0; i < articleDocs.length; i++) {
            const current = articleDocs[i] as WithId<
                ReturnType<typeof createArticle>
            >
            const page = await browser.newPage()
            const URL = current.link

            log('Loading Page...')

            await removeAds(page)

            await page.goto(URL, {
                waitUntil: 'load',
                timeout: 0,
            })

            log('Page Loaded')

            await removeWeeds(page)

            // GET TIME/DATE
            try {
                const timeElement = await page.$eval(
                    'time',
                    (el) => el.textContent,
                )
                if (timeElement) current.date = timeElement.trim()
            } catch (error) {
                log("Couldn't find time element")
            }

            // GET HEADLINE
            try {
                const headlineElement = await page.$eval(
                    'h1.headline',
                    (el) => el.textContent,
                )
                if (headlineElement) current.headline = headlineElement.trim()
            } catch (error) {
                log("Couldn't find h1.headline element")
            }

            // GET CONTENT
            try {
                const contentElms = await page.$$eval(
                    'p:not([class]), p.speakable',
                    (ptags) => ptags.map((ptag) => ptag.textContent || ''),
                )
                const content = contentElms.join('\n\n')
                current.content = content.trim()
            } catch (error) {
                log("Couldn't find 'p:not([class]), p.speakable' element")
            }

            const sanitizedContent = await sanitizeArticleContent(
                current.content,
            )

            await news.updateOne(
                { _id: current._id },
                {
                    $set: {
                        ...current,
                        content: sanitizedContent,
                    },
                },
            )

            await page.close()
        }
    } catch (error) {
        log(error)
    }
}
