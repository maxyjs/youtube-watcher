const findNewResultsForUser = require('./findNewResultsForUser');
const addAllVideosToPlaylist = require('./userPlaylistsHandlers/addAllVideosToPlaylist');
const checkUserAuthDataValid = require('../userHandlers/checkUserAuthDataValid');
const CacheAddedVideoToPlaylist = require('../cacheManagers/CacheAddedVideoToPlaylist');

async function handleUser(user, options) {
  const { testMode } = options || false;

  const resultChecked = await checkUserAuthDataValid(user);

  if (resultChecked.error === true) {
    return resultChecked;
  }

  const cacheAddedVideoToPlaylist = new CacheAddedVideoToPlaylist(user);

  const newResults = await findNewResultsForUser(
    user,
    cacheAddedVideoToPlaylist
  );
  const allIdsVideos = newResults.map((result) => {
    return result.video.id;
  });

  if (testMode === true) {
    if (allIdsVideos.length > 0) {
      const baseUrl = 'https://www.youtube.com/watch_videos?video_ids=';

      const allIdsVideos_string = allIdsVideos.join(',');

      const playlist = `${baseUrl}${allIdsVideos_string}`;

      console.log(
        '\x1b[36m%s\x1b[0m',
        'Ссылка на анонимный плейлист с результатами поиска: \n',
        playlist
      );
    } else {
      return {
        message: 'Не найдено новых видео',
      };
    }

    return;
  }

  let resultsAdded = [];

  if (allIdsVideos.length > 0) {
    try {
      resultsAdded = await addAllVideosToPlaylist(allIdsVideos, user);
      saveAddedVideoToCacheFile(resultsAdded, cacheAddedVideoToPlaylist);
    } catch (err) {
      console.error(err);
    }
  }

  return resultsAdded;
}

function saveAddedVideoToCacheFile(resultsAdded, cacheAddedVideoToPlaylist) {
  const successfullyAddedList = resultsAdded.reduce((acc, resultAdded) => {
    if (resultAdded.isSuccessfullyAdded === true) {
      acc.push(resultAdded.id);
      return acc;
    } else {
      return acc;
    }
  }, []);

  console.log('Сохранено в обработанные: ', successfullyAddedList.length);

  if (successfullyAddedList.length > 0) {
    cacheAddedVideoToPlaylist.addListVideoIdToFile(successfullyAddedList);
  }
}

module.exports = handleUser;
