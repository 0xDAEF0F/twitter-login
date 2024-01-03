import { PlaywrightCrawler, KeyValueStore } from 'crawlee';
import 'dotenv/config'

const crawler = new PlaywrightCrawler({
    async requestHandler({ page }) {
        await page.setViewportSize({ width: 1440, height: 986 })

        const store = await KeyValueStore.open('cookies')
        const twitterCookies = await store.getValue('twitter')

        if (twitterCookies) {
            await page.context().addCookies(twitterCookies as any)

            await page.goto('https://twitter.com')

            await page.waitForTimeout(10_000)

            // Update cookies
            await store.setValue('twitter', await page.context().cookies(['https://twitter.com']))
        } else {
            await page.goto('https://twitter.com/login');

            // click on the username input
            await page.locator('input[autocomplete][autocorrect]').click()

            // type username
            await page.keyboard.type(process.env.TWITTER_USERNAME!, { delay: 100 });

            // click Next
            await page.keyboard.press('Enter')

            await page.waitForTimeout(1_000)

            // type password
            await page.keyboard.type(process.env.TWITTER_PASSWORD!, { delay: 100 });

            // click Log In
            await page.keyboard.press('Enter')

            await page.waitForTimeout(10_000)

            // get cookies
            await store.setValue('twitter', await page.context().cookies(['https://twitter.com']))
        }
    },
    maxRequestsPerCrawl: 20,
    headless: false,
});

await crawler.run(['https://www.google.com']);
