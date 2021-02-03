const scraper = require('../scrapers/scraper')

function createUrlFromOptions(queryOptions, numPage = 1) {

  // thisMonth: "&sp=EgIIBA%253D%253D",
  // allTime: "&sp=CAISAhAB"  <--- videos by upload date
  // allTime: "&sp=EgIQAQ%253D%253D"  <--- video by relevance

  const enumDateTimeUpload = {
    thisMonth: "&sp=EgIIBA%253D%253D",
    // allTime: "&sp=CAISAhAB"
    allTime: "&sp=EgIQAQ%253D%253D"  // allTime: "&sp=EgIQAQ%253D%253D"  <--- video by relevance
  }

  const defaultDateTimeUpload = "allTime"

  const { term, termOptions = {} } = queryOptions

  const dateTimeUpload = termOptions.dateTimeUpload ? termOptions.dateTimeUpload : defaultDateTimeUpload

  const wordsWithIntitleCommand = modifyTermForSearchInTitleOnly(term)

  const encodeTerm = encodeURIComponent(wordsWithIntitleCommand)
  const url = `https://www.youtube.com/results?q=${encodeTerm}&page=${numPage}${enumDateTimeUpload[dateTimeUpload]}`
  return url
}

function modifyTermForSearchInTitleOnly(term) {
  const words = term.split(' ')
  const wordsWithIntitleCommand = words.map(word => {
    return `intitle:${word}`
  }).join(' ')
  return wordsWithIntitleCommand
}

async function getResultsForTerm(queryOptions) {

  const url = createUrlFromOptions(queryOptions)

  let results = await scraper.scrapeResultSearchPage(url)

return results
}

module.exports = getResultsForTerm;