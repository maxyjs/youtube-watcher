const getResultsForTerm = require('./getResultsForTerm.js');
const resultsContainer = require('./../resultsHandlers/resultsContainer');

async function getResultsForAllTerms(listQueries) {
  // todo: Change getResultsForAllTerms iterator
  async function* asyncIterator(listQueries) {
    let i = -1;
    while (i < listQueries.length - 1) {
      i++;
      yield [listQueries[i], i];
    }
  }

  for await (const [listQuery, i] of asyncIterator(listQueries)) {
    try {
      await getResultsForTerm(resultsContainer, listQuery);
    } catch (err) {
      console.log(err);
    }
  }

  return resultsContainer.getResults();
}

module.exports = getResultsForAllTerms;
