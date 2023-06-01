import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema'
import { Page } from 'puppeteer'
import { log } from './logger'

export function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
}

export async function sleepFor(min: number, max: number) {
    let sleepDuration = randomIntFromInterval(min, max)
    log('waiting for ', sleepDuration / 1000, 'seconds')
    await new Promise((r) => setTimeout(r, sleepDuration))
}

export function createArticle(source: 'fox_news' | 'cnn' | 'tech_crunch') {
    const articleDoc = {
        headline: '',
        date: '',
        link: '',
        image: '',
        source,
        content: '',
        digested: false,
        digestedAt: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
    }

    return articleDoc
}

export async function removeAds(page: Page) {
    await page.setRequestInterception(true)

    const rejectRequestPattern = [
        'googlesyndication.com',
        '/*.doubleclick.net',
        '/*.amazon-adsystem.com',
        '/*.adnxs.com',
    ]
    const blockList = []

    page.on('request', (request) => {
        if (
            rejectRequestPattern.find((pattern) => request.url().match(pattern))
        ) {
            blockList.push(request.url())
            request.abort()
        } else request.continue()
    })
}

export async function removeWeeds(page: Page) {
    await page.evaluate(() => {
        const elm = document.querySelector('.snack-bar')
        const asides = document.querySelectorAll('aside')

        const videoCards = document.querySelectorAll('.has-video-overlay')

        const spotlightCards = document.querySelectorAll(
            '.collection-spotlight.has-hero.large-shelf',
        )

        const featureFaces = document.querySelectorAll(
            '.collection-features-faces',
        )

        const featured = document.querySelectorAll('.featured')

        if (elm) {
            elm.remove()
        }

        asides.forEach((aside) => {
            aside.remove()
        })

        videoCards.forEach((card) => {
            card.remove()
        })

        spotlightCards.forEach((card) => {
            card.remove()
        })

        featureFaces.forEach((card) => {
            card.remove()
        })

        featured.forEach((card) => {
            card.remove()
        })
    })
}

export async function sanitizeArticleContent(content: string) {
    const prompt = `
    Take the following content and write it in a way that is more readable and easier to understand, remove any unnecessary information, keep it around 100 words, also remove any mentions of news sources, like Fox News, CNN, etc.:

    == CONTENT ==
    ${content}

    == RESULT ==
    `.trim()

    const chat = new ChatOpenAI({ temperature: 0 })
    const response = await chat.call([
        new HumanChatMessage('Can you help me with rewriting an article?'),
        new SystemChatMessage('Sure, what do you need help with?'),
        new HumanChatMessage(prompt),
    ])

    return response.text
}
