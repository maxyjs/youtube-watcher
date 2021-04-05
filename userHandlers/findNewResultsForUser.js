const getAllResults = require('../resultsHandlers/getAllResults');
const getViewedVideosForUser = require('./../userHandlers/userViewedControllers/getViewedVideosForUser');
const getListQueriesForUser = require('./getListQueriesForUser');

async function findNewResultsForUser(user, cacheAddedVideoToPlaylist) {
  const listQueries = getListQueriesForUser(user);
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

  return filteredByAdded;
}

function filterResultsByViewed(viewedVideos, allResults) {
  let newResults = [];

  newResults = allResults.filter((result) => {
    if (viewedVideos[result.video.id]) {
      return false;
    } else {
      return true;
    }
  });

  return newResults;
}

module.exports = findNewResultsForUser;
