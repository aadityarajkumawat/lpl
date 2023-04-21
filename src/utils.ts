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
        metaData: {
            headline: '',
            date: '',
            link: '',
            image: '',
            source,
        },
        content: '',
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
    })
}
