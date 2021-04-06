const axios = require('axios');

async function scrapeResultSearchPage(url) {
  const data = await getHTML(url);
  if (data.error === false) {
    const results = parseHtml(data.html);
    return results;
  } else {
    console.error(data.message)
    console.error(data.reason)
    return []
  }
}

async function getHTML(url) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (err) {
    console.error(err);
  }
}

function parseHtml(html) {
  const results = [];

  let dataText;
  let data;

  try {
    const re = /(?:window\["ytInitialData"] = )(.*?)(?:[;])/;
    const dataText = html.match(re)[1];
    data = JSON.parse(dataText);
  } catch (err) {
    try {
      dataText = html.substring(html.indexOf('ytInitialData') + 17);
      dataText2 = dataText.substring(
        0,
        dataText.indexOf('window["ytInitialPlayerResponse"]') - 6
      );
      data = JSON.parse(dataText2);
    } catch (err) {
      const re = /(?:var ytInitialData = )(.*?)(?:[;])/;
      const dataText = html.match(re)[1] || undefined;
      if (dataText === undefined) {
        return results;
      }
      try {
        data = JSON.parse(dataText);
      } catch (err) {
        return results;
      }
    }
  }

  const sectionLists =
    data.contents.twoColumnSearchResultsRenderer.primaryContents
      .sectionListRenderer.contents;

  sectionLists.forEach((sectionList) => {
    if (
      sectionList.itemSectionRenderer &&
      sectionList.itemSectionRenderer.contents
    ) {
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

function parseVideoRenderer(renderer) {
  let video = {
    id: renderer.videoId,
    title: renderer.title.runs.reduce(comb, ''),
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
        renderer.viewCountText.runs.reduce(comb, '')
      : renderer.publishedTimeText
      ? '0 views'
      : '0 watching',
  };

  if (showResultScrapeSerp === true) {
    console.log('title: = ', video.title);
    console.log('upload_date: = ', video.upload_date);
    console.log('views: = ', video.views);
    console.log('*************************');
  }

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

  const resultParse = { video, uploader };
  return resultParse;
}

function comb(a, b) {
  return a + b.text;
}

module.exports.scrapeResultSearchPage = scrapeResultSearchPage;
