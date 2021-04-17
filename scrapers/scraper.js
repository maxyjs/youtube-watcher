const { showResultScrapeSerp } = require('../appSettings');
const puppeteer = require('puppeteer');

async function scrapeByBrowser(url, getContents) {
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto(url);
  let contents = await page.evaluate(getContents);
  await browser.close();

  return contents;
}

function parseVideoRenderer(renderer) {
  let video = {
    id: renderer.videoId,
    title: renderer.title.runs.reduce((acc, run) => {
      return acc + run.text;
    }, ''),
    url: `https://www.youtube.com${renderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
    duration: renderer.lengthText ? renderer.lengthText.simpleText : 'Live',
    snippet: renderer.descriptionSnippet
      ? renderer.descriptionSnippet.runs.reduce(
        (a, b) => a + (b.bold ? `<b>${b.text}</b>` : b.text),
        ''
      )
      : '',
    upload_date: renderer.publishedTimeText
      ? renderer.publishedTimeText.simpleText
      : 'Live',
    thumbnail_src:
    renderer.thumbnail.thumbnails[renderer.thumbnail.thumbnails.length - 1]
      .url,
    views: renderer.viewCountText
      ? renderer.viewCountText.simpleText ||
      renderer.viewCountText.runs.reduce((acc, run) => {
        return acc + run.text;
      }, '')
      : renderer.publishedTimeText
        ? '0 views'
        : '0 watching',
    uploader: {
      username: renderer.ownerText.runs[0].text,
      url: `https://www.youtube.com${renderer.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
    },
  };

  if (showResultScrapeSerp === true) {
    console.log('title: = ', video.title);
    console.log('upload_date: = ', video.upload_date);
    console.log('views: = ', video.views);
    console.log('*************************');
  }

  const resultParse = { video };
  return resultParse;
}

function parseContents(contents) {
  const results = [];
  contents.forEach((sectionList) => {
    if (sectionList?.itemSectionRenderer?.contents) {
      sectionList.itemSectionRenderer.contents.forEach((content) => {
        try {
          if (content.hasOwnProperty('videoRenderer')) {
            const lengthText = content.videoRenderer.lengthText;

            // Ignore type video "Live"
            if (lengthText !== undefined) {
              results.push(parseVideoRenderer(content.videoRenderer));
            }
          }
        } catch (ex) {
          console.log(ex);
          console.log(content);
        }
      });
    }
  });
  return results;
}

function getContents() {
  const contents =
    window.ytInitialData.contents.twoColumnSearchResultsRenderer.primaryContents
      .sectionListRenderer.contents;
  return contents;
}

async function scrapeResultSearchPage(url) {
  const contents = await scrapeByBrowser(url, getContents);
  return parseContents(contents);
}

module.exports.scrapeResultSearchPage = scrapeResultSearchPage;
