const puppeteer = require("puppeteer");
const url = "https://youtube.com/feed/history";
const {headlesMode} = require('../../appSettings')


async function parseViewedVideoFromHistory(user, maxIdsCount) {

  console.log('\x1b[44m%s\x1b[0m', "Парсинг истории просмотров...")

  const {cookies} = user
  const browser = await puppeteer.launch({headless: headlesMode});

  const page = await browser.newPage();

  await page.setCookie(...cookies);
  await page.goto(url);

  const delay = 2000;
  let countIter = Math.ceil(maxIdsCount / 20)

  do {
    await scrollDown(page);
    countIter--
    await page.waitFor(delay);
  } while (countIter);

  await page.waitFor(delay);

  const viewedVideoObj = await getViewedVideoObj(page);
  await browser.close();

  return viewedVideoObj

}


async function getViewedVideoObj(page) {

  return await page.$$eval("#video-title", (links) => {
    return links.reduce((viewedVideoObj, link) => {
      const regId = /(?:https:\/\/www.youtube.com\/watch\?v=)(.*?)(?:&|$)/
      const id = regId.exec(link)[1]
      viewedVideoObj[id] = true
      return viewedVideoObj
    }, {})
  })

}


async function scrollDown(page) {
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight);
  })
}

module.exports = parseViewedVideoFromHistory;