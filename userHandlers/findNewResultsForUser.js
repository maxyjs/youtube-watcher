const getAllResults = require('../resultsHandlers/getAllResults');
const getViewedVideosForUser = require('./../userHandlers/userViewedControllers/getViewedVideosForUser');
const getListQueriesForUser = require('./getListQueriesForUser');

function filterResultsByViewed(viewedVideos, allResults) {
  const newResults = allResults.filter((result) => {
    if (viewedVideos[result.video.id]) {
      return false;
    } else {
      return true;
    }
  });

  return newResults;
}

function filterByLanguage(results) {
  const filtered = results.filter((result) => {
    if (
      result.queryOptions.termOptions.onlyRuLang === true &&
      detectNotRus(result.video.videoInfo.originTitle)
    ) {
      return false;
    }
    return true;
  });
  function detectNotRus(title) {
    const isHasCirillic = /[а-яА-ЯЁё]/.test(title);
    return !isHasCirillic;
  }

  return filtered;
}

async function findNewResultsForUser(user, cacheAddedVideoToPlaylist, options) {
  const listQueries = getListQueriesForUser(user, options);
  const { value: viewedVideos } = await getViewedVideosForUser(user);
  const allResults = await getAllResults(listQueries);

  const filteredByViewed = filterResultsByViewed(viewedVideos, allResults);
  console.log(
    '\x1b[36m%s\x1b[0m',
    'Отфильтрованные по уже просмотренным пользователем: ',
    filteredByViewed.length
  );

  const filteredByAdded = filteredByViewed.filter((result) => {
    const isAdded = cacheAddedVideoToPlaylist.checkCacheIncludeVideoId(
      result.video.id
    );
    return !isAdded;
  });

  console.log(
    '\x1b[36m%s\x1b[0m',
    'Отфильрованные по уже добавленным в плейлист: ',
    filteredByAdded.length
  );

  const filteredByLanguage = filterByLanguage(filteredByAdded);
  console.log(
    '\x1b[36m%s\x1b[0m',
    'Отфильрованные по языку: ',
    filteredByLanguage.length
  );

  return filteredByLanguage;
}

module.exports = findNewResultsForUser;
