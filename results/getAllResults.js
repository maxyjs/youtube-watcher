const getResultsForAllTerms = require('./getResultsForAllTerms.js');
const getVideoInfo = require('../scrapers/getVideoInfo.js');

async function getAllResults(listQueries) {
  console.log(
    '\x1b[36m%s\x1b[0m',
    'Количество поисковых запросов: ',
    listQueries.length
  );
  const resultsForAllTerms = await getResultsForAllTerms(listQueries);
  const handledResults = await handleResultsForAllTerms(resultsForAllTerms);
  return handledResults;
}

async function handleResultsForAllTerms(resultsForAllTerms) {
  console.log('\x1b[33m%s\x1b[0m', 'Результат парсинга:'); // font yellow

  let filteredByViews = filterByViews(resultsForAllTerms);
  console.log(
    '\x1b[36m%s\x1b[0m',
    'Отфильтрованные по количеству просмотров: ',
    filteredByViews.length
  );

  let exactResults = filterByExact(filteredByViews);
  console.log('\x1b[36m%s\x1b[0m', 'Точное совпадение: ', exactResults.length);

  let results = await addDataVideoInfoToAllResults(exactResults);

  let filteredByRating = filterByRating(results);
  console.log(
    '\x1b[36m%s\x1b[0m',
    'Отфильтрованные по рейтингу: ',
    filteredByRating.length
  );

  let filteredByGlobalExcludeWords = filterByGlobalExcludeWords(
    filteredByRating
  );
  console.log(
    '\x1b[36m%s\x1b[0m',
    'Отфильтрованные по словам исключениям: ',
    filteredByGlobalExcludeWords.length
  );

  return filteredByGlobalExcludeWords;
}

function filterByViews(results) {
  const getViewsNumber = (result) => {
    const viewsString = result.video.views;
    const viewsNumber = +viewsString.replace(/\D/g, '');
    return viewsNumber;
  };

  const filtered = results.filter((result) => {
    const views = getViewsNumber(result);
    const minViews = result.queryOptions.termOptions.minViews;
    return views < minViews ? false : true;
  });

  return filtered;
}

function filterByExact(results) {
  const filteredByExact = results.filter(filterByTitle);

  function filterByTitle(result) {
    const titleLower = result.video.title.toLowerCase();
    const term = result.queryOptions.term.toLowerCase();
    const { withQuotes, withoutQuotes } = splitStringByQuotes(term);
    const shortedKeywords = shortKeywords(withoutQuotes);

    const isExactWithoutQuotes = checkExact(shortedKeywords, titleLower);
    const isExactWithQuotes = checkExact(withQuotes, titleLower);

    return isExactWithoutQuotes && isExactWithQuotes;
  }

  function splitStringByQuotes(string) {
    const groups = /['"](.+?)['"]/g;
    const withQuotes = Array.from(string.matchAll(groups), (match) => match[1]);
    const withoutQuotes = string.replace(groups, '').split(' ').filter(Boolean);

    const result = {
      withQuotes,
      withoutQuotes,
    };

    return result;
  }

  function shortKeywords(keywords) {
    const shortedKeywords = keywords.map((word) => {
      if (word.length <= 5) {
        return word;
      }
      return word.slice(0, word.length - Math.ceil(word.length / 4));
    });
    return shortedKeywords;
  }

  function checkExact(keyWords, title) {
    return keyWords.every((word) => titleContainsWord(word, title));
  }

  function titleContainsWord(word, title) {
    return title.includes(word);
  }

  return filteredByExact;
}

async function addDataVideoInfoToAllResults(results) {
  if (results.length === 0) {
    return results;
  }

  const handledResults = [];

  for await (const result of results) {
    try {
      const videoInfo = await getVideoInfo(result.video.id);
      result.video.videoInfo = videoInfo;
      handledResults.push(result);
    } catch (err) {
      console.error(
        '\x1b[36m%s\x1b[0m',
        '[addDataVideoInfoToAllResults] \n ',
        err
      );
    }
  }

  return handledResults;
}

function filterByRating(results) {
  if (results.length === 0) {
    return results;
  }

  const filtered = results.filter((result) => {
    const minRating = result.queryOptions.termOptions.minRating;

    if (!result.video.videoInfo.rating) {
      return false;
    }

    const isHR =
      result.video.videoInfo.rating &&
      result.video.videoInfo.rating > minRating;
    return isHR;
  });

  return filtered;
}

function filterByGlobalExcludeWords(results) {
  if (results.length === 0) {
    return results;
  }

  const globalExcludeWords =
    results[0].queryOptions.termOptions.globalExcludeWords;

  if (!globalExcludeWords) {
    return results;
  }

  const filtered = results.filter((result) => {
    const title = result.video.title;
    if (
      globalExcludeWords.some((word) =>
        title.toLowerCase().includes(word.toLowerCase())
      )
    ) {
      return false;
    }
    return true;
  });

  return filtered;
}

module.exports = getAllResults;
