const getResultsForTerm = require('./getResultsForTerm.js');
const resultsContainer = require('.//resultsContainer');

async function getResultsForAllTerms(listQueries) {
  for (const listQuery of listQueries) {
    try {
      await getResultsForTerm(resultsContainer, listQuery);
    } catch (err) {
      console.log(err);
    }
  }

  return resultsContainer.getResults();
}

module.exports = getResultsForAllTerms;
