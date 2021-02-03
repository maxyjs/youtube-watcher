const addVideoToPlaylist = require('./addVideoToPlaylist')
const getInstanceBrowser = require('../getInstanceBrowser')


async function addAllVideosToPlaylist(videoIds, user) {

  console.log('\x1b[44m%s\x1b[0m', "Добавление видео в плейлист...")

    const resultsAdded = []
    const instanceBrowser = await getInstanceBrowser(user)

    for (const id of videoIds) {
      const result = await addVideoToPlaylist(instanceBrowser, id, user.addPlaylistMark)
      resultsAdded.push(result)
    }

    await instanceBrowser.browser.close()
    return resultsAdded

}


module.exports = addAllVideosToPlaylist;
