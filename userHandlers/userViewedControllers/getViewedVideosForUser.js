const fs = require('fs');
const parseViewedVideoFromHistory = require('./parseViewedVideoFromHistory.js')
const {updateCacheViewedVideos: updateEveryMillisecond} = require("./../../appSettings");

async function getViewedVideosForUser(user) {

  const oldViewedObj = getViewedVideosFromFile(user)

  if (shouldUpdateListViewedVodeos(oldViewedObj)) {

    const {userName} = user
    const maxIdsCount = 500
    const _viewedVideosObj = await parseViewedVideoFromHistory(user, maxIdsCount)
    const count = Object.keys(_viewedVideosObj).length

    const viewedVideosObj = {
      userName,
      value: _viewedVideosObj,
      count,
      lastUpdate: Date.now()
    }

    const merged = mergeOldAndNewViewedVideos(oldViewedObj, viewedVideosObj)

    await saveViewedVideosToFile(merged, user)

    return merged

  } else {
    return oldViewedObj
  }

}

function getViewedVideosFromFile(user) {

  const {userName, userDirectory} = user
  const filePath = `${userDirectory}\\cache\\${userName}_viewedVideosObj.json`

  try {
    const viewedVideosObj = require(filePath)
    return viewedVideosObj
  } catch (err) {
    console.error(`[ getViewedVideosFromFile ]\nTried Read file ${filePath}
    `)
    return {
      userName,
      value: undefined,
      count: 0,
      lastUpdate: Date.now(),
    }
  }

}

function shouldUpdateListViewedVodeos(oldViewedObj) {
  let should = true
  const {lastUpdate = 1} = oldViewedObj

  if (Date.now() - lastUpdate < updateEveryMillisecond) {
    should = false
  }

  return should
}

function saveViewedVideosToFile(viewedVideosObj, user) {

  const {userName, userDirectory} = user
  const filePath = `${userDirectory}\\cache\\${userName}_viewedVideosObj.json`

  try {
    fs.writeFileSync(filePath, JSON.stringify(viewedVideosObj));
  } catch (err) {
    console.error(`[ saveViewedVideosToFile ]\nTried Write file ${filePath}
    `)
    throw err
  }


}

function mergeOldAndNewViewedVideos(oldObj = {value: {}}, newObj = {value: {}}) {
  const newValue = {
    ...oldObj.value,
    ...newObj.value
  }

  newObj.value = newValue
  newObj.count = Object.keys(newValue).length

  return newObj
}


module.exports = getViewedVideosForUser
