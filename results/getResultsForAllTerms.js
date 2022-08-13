const getResultsForTerm = require('./getResultsForTerm.js');
const resultsStore = require('.//resultsStore');

async function getResultsForAllTerms(listQueries) {
  for (const listQuery of listQueries) {
    try {
      await getResultsForTerm(resultsStore, listQuery);
    } catch (err) {
      console.log(err);
    }
  }

  return resultsStore.getResults();
}

module.exports = getResultsForAllTerms;
