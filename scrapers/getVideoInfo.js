const axios = require('axios');

async function getRating(videoId) {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    var { data } = await axios.get(url);
    const re = /averageRating":(\d.\d)/;
    let match = data.match(re)[1];
    const rating = parseFloat(match);

    return {
      isError: false,
      rating,
    };
  } catch (err) {
    return {
      isError: true,
      rating: null,
    };
  }
}

async function getVideoInfo(videoId) {
  const rating = await getRating(videoId);
  return rating;
}

module.exports = getVideoInfo;
