import puppeteer from 'puppeteer'
import { FOX_NEWS } from './consts'
import { client } from './db'
import { log } from './logger'
import { ArticleDoc } from './types'
import { createArticle, removeAds, removeWeeds, sleepFor } from './utils'

/**
 * The Hierarchy of fox new is as follows:
 *
 * First at the top of main content is one big post, spanning from left to right.
 * Below that is a list of posts, each post is a card with a title and image.
 *
 * The first post is the big post, and the rest are the small posts.
 * the class name for the big post container is `big-top`
 *
 * each article card if wrapped inside a container with class name `article`
 * irrespective of the size of the card.
 */
const MAX_ARTICLES = 160

export async function foxNewsScraper() {
    try {
        const news = client.db('news_directory').collection('news')

        const browser = await puppeteer.launch({
            headless: false,
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

        log('Articles Found: ', articles.length)

        // opens new tab
        const articlePage = await browser.newPage()

        let tempArticles: Array<ArticleDoc> = []

        for (let i = 0; i < articles.length; i++) {
            const articleDoc = createArticle('fox_news')
            log('Article: ', i + 1)

            const article = articles[i]

            // this is for the news card
            const hasAnchor = await article.$$('a')
            const hasTitle = await article.$$('h3')
            const hasImage = await article.$$('img')

            if (!hasAnchor.length) {
                log('No link found')
            } else {
                // Get Article Link off the news card itself
                const link = await article.$eval('a', (el) => el.href)
                articleDoc.metaData.link = link
                log('Link: ', link)
            }

            if (!hasTitle.length) {
                log('No title found')
            }

            if (!hasImage.length) {
                log('No image found')
            }

            // the news card seems empty
            if (!hasAnchor.length && !hasTitle.length && !hasImage.length) {
                log("Article doesn't have a link, title or image")
                continue
            }

            const link = articleDoc.metaData.link

            if (!link) continue

            log('Going to:', link)
            // Redirect to page with article
            await articlePage.goto(link, { timeout: 0 })

            // Get Article Headline from the article page
            try {
                const headline = await articlePage.$eval(
                    'h1.headline',
                    (el) => el.textContent,
                )
                articleDoc.metaData.headline = headline || ''
                log('Headline: ', headline)

                // Get Article Image from the article page
                const imageSource = await article.$eval('img', (el) => el.src)
                articleDoc.metaData.image = imageSource
                log('Image: ', imageSource)
            } catch (error) {
                log('Error getting headline or image')
            }

            const articleBody = await articlePage.$('.article-body')

            if (!articleBody) {
                log('No article body found')
                continue
            }

            const articleDate = await articlePage.$('.article-date')

            if (!articleDate) {
                log('No article date found')
                continue
            }

            const date = (
                await articleDate.evaluate((el) => el.textContent)
            )?.trim()

            if (!date) {
                log('No date found')
            }

            log('Date: ', date)

            const dateString = date?.trim()
            articleDoc.metaData.date =
                dateString?.replace('Published', '').trim() || ''

            // I want to get all p tags and with either no class name or with class name `speakable`
            const paragraphs = await articleBody.$$(
                'p:not([class]), p[class="speakable"]',
            )

            const articleText = await Promise.all(
                paragraphs.map(async (p) => {
                    const text = await p.evaluate((el) => el.textContent)
                    return text
                }),
            )

            // Get Article Body Content
            const articleBodyContent = articleText.join('\n')
            articleDoc.content = articleBodyContent

            tempArticles.push(articleDoc)

            if (tempArticles.length > 5) {
                await news.insertMany(tempArticles)
                // await addArticles(tempArticles)
                log('Article Saved', tempArticles.length)
                tempArticles = []
            }

            log(JSON.stringify(articleDoc, null, 2))
        }

        await sleepFor(1000, 2000)
    } catch (error) {
        log(error)
    }
}
