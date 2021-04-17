const getRatingVideo = require('../scrapers/getRatingVideo.js');

async function addRatingVideosForAllResults(results) {
  for (const result of results) {
    try {
      const rating = await getRatingVideo(result.video.id);
      result.rating = rating;
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = addRatingVideosForAllResults;
