const axios = require('axios');

async function scrapeResultSearchPage(url) {
  const html = await getHTML(url);
  const results = parseHtml(html);
  return results;
}

async function getHTML(url) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (err) {
    console.error(err);
  }
}

function getContents(html) {
  let contents = [];
  let data = null;

  const re = /(?:var ytInitialData = )(.*?)(?:[;])/;
  const dataText = html.match(re)[1] || undefined;
  if (dataText === undefined) {
    return contents;
  }
  try {
    data = JSON.parse(dataText);
    contents =
      data.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents;
    return contents;
  } catch (err) {
    return contents;
  }
}

function parseHtml(html) {
  const results = [];
  const contents = getContents(html);

  contents.forEach((content) => {
    if (content.hasOwnProperty('videoRenderer')) {
      const lengthText = content.videoRenderer.lengthText;

      // Ignore type video "Live"
      if (lengthText !== undefined) {
        results.push(parseVideoRenderer(content.videoRenderer));
      }
    }
  });

  return results;
}

function parseVideoRenderer(renderer) {
  let uploader = {
    username: renderer.ownerText.runs[0].text,
    url: `https://www.youtube.com${renderer.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
  };
  uploader.verified =
    (renderer.ownerBadges &&
      renderer.ownerBadges.some(
        (badge) => badge.metadataBadgeRenderer.style.indexOf('VERIFIED') > -1
      )) ||
    false;

  let video = {
    id: renderer.videoId,
    title: renderer.title.runs.reduce((acc, item) => {
      return acc + item.text;
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
      renderer.viewCountText.runs.reduce((acc, item) => {
        return acc + item.text;
      }, '')
      : renderer.publishedTimeText
        ? '0 views'
        : '0 watching',

    uploader,
  };

  const resultParse = { video };
  return resultParse;
}

module.exports.scrapeResultSearchPage = scrapeResultSearchPage;
