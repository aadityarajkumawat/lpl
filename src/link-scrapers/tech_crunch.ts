import puppeteer from 'puppeteer'
import { TECH_CRUNCH } from '../consts'
import { client } from '../db'
import { log } from '../logger'
import { removeAds } from '../utils'

export async function techCrunchLinkScraper() {
    log('Starting Tech Crunch Link Scraper')

    const techCrunchNews = client
        .db('news_directory')
        .collection('tech_crunch_news')

    const browser = await puppeteer.launch({
        // headless: false,
    })
    const page = await browser.newPage()
    const URL = TECH_CRUNCH

    log('Loading Page...')

    await removeAds(page)

    await page.goto(URL, {
        waitUntil: 'load',
        timeout: 0,
    })

    log('Page Loaded')

    // Get t
}
