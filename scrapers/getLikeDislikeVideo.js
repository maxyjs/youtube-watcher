const puppeteer = require("puppeteer");

async function getLikeDislikeVideo(videoId) {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({width: 700, height: 500});
  //
  await page.setRequestInterception(true);

  page.on('request', (req) => {
    if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(`https://www.youtube.com/watch?v=${videoId}`);
  await page.waitForSelector('h1');

  let sentimentValueText = await page.evaluate(() => {
    try {
      const $likeBar = document.getElementById("like-bar");
      const sentimentValueText = $likeBar.style.width;
      return sentimentValueText;
    } catch (e) {
      console.log("[Headless Chrome return Error]:\n", e);
    }

  });

  await browser.close();

  if (sentimentValueText) {
    const sentINT = +(sentimentValueText.replace("%", ''));
    return sentINT;
  }

}


module.exports = getLikeDislikeVideo;