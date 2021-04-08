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

  let combinedResultsForAllTerms = combineResultsForAllTerms(
    resultsForAllTerms
  );
  console.log(
    '\x1b[36m%s\x1b[0m',
    'Общее количество результатов: ',
    combinedResultsForAllTerms.length
  );

  let allResultsWithoutDuplicates = deleteDuplicates(
    combinedResultsForAllTerms
  );
  console.log(
    '\x1b[36m%s\x1b[0m',
    'Уникальные результаты: ',
    allResultsWithoutDuplicates.length
  );

  let filteredByViews = filterByViews(allResultsWithoutDuplicates);
  console.log(
    '\x1b[36m%s\x1b[0m',
    'Отфильтрованные по количеству просмотров: ',
    filteredByViews.length
  );

  let exactResults = filterByExact(filteredByViews);
  console.log('\x1b[36m%s\x1b[0m', 'Точное совпадение: ', exactResults.length);

  let allResultsWithData = await addDataVideoInfoToAllResults(exactResults);

  let filteredAllResults = filterByRating(allResultsWithData);
  console.log(
    '\x1b[36m%s\x1b[0m',
    'Отфильтрованные по рейтингу: ',
    filteredAllResults.length
  );

  return filteredAllResults;
}

function combineResultsForAllTerms(resultsForAllTerms) {
  let combinedResultsForAllTerms = resultsForAllTerms.reduce(
    (acc, resultsForTerm, index) => {
      try {
        const results = resultsForTerm.map((result, index) => {
          return result;
        });
        acc.push(results);
      } catch (err) {}

      return acc;
    },
    []
  );

  combinedResultsForAllTerms = combinedResultsForAllTerms.flat(1);

  return combinedResultsForAllTerms;
}

function deleteDuplicates(combinedResultsForAllTerms) {
  const videoIds = combinedResultsForAllTerms.map((result) => result.video.id);
  const uniqueVideoIds = [...new Set(videoIds)];
  const uniqueResults = [];

  for (const uniqueId of uniqueVideoIds) {
    const uniqueResult = combinedResultsForAllTerms.find((result) => {
      return result.video.id === uniqueId;
    });

    uniqueResults.push(uniqueResult);
  }

  return uniqueResults;
}

async function addDataVideoInfoToAllResults(allResults) {
  if (allResults.length === 0) {
    return allResults;
  }

  const results = [];

  for await (const result of allResults) {
    try {
      const videoInfo = await getVideoInfo(result.video.id);
      result.video.videoInfo = videoInfo;
      results.push(result);
    } catch (err) {
      console.error(
        '\x1b[36m%s\x1b[0m',
        '[addDataVideoInfoToAllResults] \n ',
        err
      );
    }
  }

  return results;
}

function filterByRating(allResults) {
  if (allResults.length === 0) {
    return allResults;
  }

  const filtered = allResults.filter((result) => {
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

function filterByExact(filteredAllResults) {
  const filteredByExact = filteredAllResults.filter(filterByTitle);

  function filterByTitle(result) {
    const titleLower = result.video.title.toLowerCase();
    const term = result.queryOptions.term.toLowerCase();
    const { withQuotes, withoutQuotes } = splitStringByQuotes(term);
    const shortedKeywords = shortKeywords(withoutQuotes);

    const isExact =
      checkExact(shortedKeywords, titleLower) &&
      checkExact(withQuotes, titleLower);

    return isExact;
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

module.exports = getAllResults;
