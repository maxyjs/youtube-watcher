const scraper = require('../scrapers/scraper');
const { showErrorResultScrapeSerp } = require('./../appSettings');

function getVideosLengthOption(termOptions) {
  const indexAllVideoLength = {
    thisMonth: [
      '&sp=CAASBAgEEAE%253D', // by relevance
      '&sp=CAISBAgEEAE%253D', // by date upload
      '&sp=CAMSBAgEEAE%253D', // by views
      '&sp=CAESBAgEEAE%253D', // by rating
    ],
    thisYear: [
      '&sp=CAASBAgFEAE%253D', // by relevance
      '&sp=CAISBAgFEAE%253D', // by date upload
      '&sp=CAMSBAgFEAE%253D', // by views
      '&sp=CAESBAgFEAE%253D', // by rating
    ],
    allTime: [
      '&sp=CAASAhAB', // by relevance
      '&sp=CAISAhAB', // by date upload
      '&sp=CAMSAhAB', // by views
      '&sp=CAESAhAB', // by rating
    ],
  };
  const indexLongVideo = {
    thisMonth: [
      '&sp=EgYIBBABGAI%253D', // by relevance
      '&sp=CAISBggEEAEYAg%253D%253D', // by date upload
      '&sp=CAMSBggEEAEYAg%253D%253D', // by views
      '&sp=CAESBggEEAEYAg%253D%253D', // by rating
    ],
    thisYear: [
      '&sp=CAASBggFEAEYAg%253D%253D', // by relevance
      '&sp=CAISBggFEAEYAg%253D%253D', // by date upload
      '&sp=CAMSBggFEAEYAg%253D%253D', // by views
      '&sp=CAESBggFEAEYAg%253D%253D', // by rating
    ],
    allTime: [
      '&sp=CAASBBABGAI%253D', // by relevance
      '&sp=CAISBBABGAI%253D', // by date upload
      '&sp=CAMSBBABGAI%253D', // by views
      '&sp=CAESBBABGAI%253D', // by rating
    ],
  };

  const { videosLength = 'allTimes' } = termOptions;

  return videosLength === 'allTimes' ? indexAllVideoLength : indexLongVideo;
}

function createUrlsByDateTime(chunk, queryOptions) {
  const urls = [];
  const { termOptions = {} } = queryOptions;
  const videosLengthOption = getVideosLengthOption(termOptions);
  const whatTimes = termOptions.dateTimeUpload
    ? termOptions.dateTimeUpload
    : ['allTime', 'thisMonth', 'thisYear'];

  const urlsByAllTimes = allTimes(chunk, videosLengthOption, whatTimes);

  urls.push(...urlsByAllTimes);

  return urls;

  function allTimes(chunk, indexTimes, whatTimes) {
    const setUrls = [];

    for (const whatTime of whatTimes) {
      const times = indexTimes[whatTime];
      const urls = allSorted(chunk, times);
      setUrls.push(...urls);
    }

    return setUrls;
  }

  function allSorted(chunk, times) {
    const urls = times.map((time) => {
      return `${chunk}${time}`;
    });
    return urls;
  }
}

function prepareUrlChunk(term) {
  const encodeTerm = encodeURIComponent(term);
  const chunk = `https://www.youtube.com/results?q=${encodeTerm}`;
  return chunk;
}

function modifyTermForSearchInTitleOnly(term) {
  const words = term.split(' ');
  const wordsWithIntitleCommand = words
    .map((word) => {
      return `intitle:${word}`;
    })
    .join(' ');
  return wordsWithIntitleCommand;
}

function createUrls(queryOptions) {
  const { term } = queryOptions;
  const chunk = prepareUrlChunk(term);
  const urlInTitleKeywords = prepareUrlChunk(
    modifyTermForSearchInTitleOnly(term)
  );

  const urls = createUrlsByDateTime(chunk, queryOptions);
  urls.push(urlInTitleKeywords);

  return urls;
}

async function getResultsForAllUrls(resultsContainer, queryOptions) {
  const urls = createUrls(queryOptions);

  for (const url of urls) {
    try {
      const results = await scraper.scrapeResultSearchPage(url);
      results.forEach((result) => {
        result.queryOptions = queryOptions;
        resultsContainer.addResult(result);
      });

      if (results.length >= 20) {
        try {
          const resultsPage2 = await scraper.scrapeResultSearchPage(
            `${url}&page=2`
          );
          resultsPage2.forEach((result) => {
            result.queryOptions = queryOptions;
            resultsContainer.addResult(result);
          });
        } catch {
          showErrorResultScrapeSerp &&
          console.log(
            '\x1b[33m%s\x1b[0m',
            'PAGE 2: failed scrape url:\n',
            `${url}&page=2`
          ); // font yellow
        }
      }
    } catch {
      showErrorResultScrapeSerp &&
      console.log('\x1b[33m%s\x1b[0m', 'failed scrape url:\n', url); // font yellow
    }
  }

  return resultsContainer;
}

async function getResultsForTerm(resultsContainer, queryOptions) {
  await getResultsForAllUrls(resultsContainer, queryOptions);
}

module.exports = getResultsForTerm;
