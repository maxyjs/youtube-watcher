const getRatingVideo = require('../scrapers/getRatingVideo.js');

async function* asyncIterator(results) {
  //TODO: Change iterator RATING
  let i = -1;
  while (i < results.length - 1) {
    i++;
    yield results[i];
  }
}

async function addRatingVideosForAllResults(results) {
  for await (const videoObj of asyncIterator(results)) {
    try {
      const rating = await getRatingVideo(videoObj.video.id);
      videoObj.rating = rating;
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = addRatingVideosForAllResults;
