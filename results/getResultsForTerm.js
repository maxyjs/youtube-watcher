const scraper = require('../scrapers/scraper');
const { showErrorResultScrapeSerp } = require('./../appSettings');

function getVideosLengthParams(termOptions) {
  const paramsAllVideoLength = {
    thisMonth: [
      '&sp=CAASBAgEEAE%253D', // by relevance
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
  const paramsLongVideo = {
    thisMonth: [
      '&sp=EgYIBBABGAI%253D', // by relevance
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

  return videosLength === 'allTimes' ? paramsAllVideoLength : paramsLongVideo;
}

function createUrlsByDateTime(chunk, queryOptions) {
  const urls = [];
  const { termOptions = {} } = queryOptions;
  const videosLengthOption = getVideosLengthParams(termOptions);
  const timesUpload = termOptions.dateTimeUpload
    ? termOptions.dateTimeUpload
    : ['allTime', 'thisMonth', 'thisYear'];

  const urlsByAllTimes = allTimes(chunk, videosLengthOption, timesUpload);

  urls.push(...urlsByAllTimes);

  return urls;

  function allTimes(chunk, videosLengthOption, timesUpload) {
    const setUrls = [];

    for (const whatTime of timesUpload) {
      const times = videosLengthOption[whatTime];
      const urls = allSorted(chunk, times);
      setUrls.push(...urls);
    }

    return setUrls;
  }

  function allSorted(chunk, times) {
    return times.map((time) => {
      return `${chunk}${time}`;
    });
  }
}

function prepareUrlChunk(term) {
  const encodeTerm = encodeURIComponent(term);
  return `https://www.youtube.com/results?q=${encodeTerm}`;
}

function createUrls(queryOptions) {
  const { term } = queryOptions;
  const chunk = prepareUrlChunk(term);

  return createUrlsByDateTime(chunk, queryOptions);
}

async function getResultsForAllUrls(resultsStore, queryOptions) {
  const urls = createUrls(queryOptions);

  for (const url of urls) {
    try {
      const results = await scraper.scrapeResultSearchPage(url);
      results.forEach((result) => {
        result.queryOptions = queryOptions;
        resultsStore.addResult(result);
      });
    } catch {
      showErrorResultScrapeSerp &&
        console.log('\x1b[33m%s\x1b[0m', 'failed scrape url:\n', url); // font yellow
    }
  }

  return resultsStore;
}

async function getResultsForTerm(resultsStore, queryOptions) {
  await getResultsForAllUrls(resultsStore, queryOptions);
}

module.exports = getResultsForTerm;
