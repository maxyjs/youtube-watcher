const getResultsForTerm = require('./getResultsForTerm.js')

async function getResultsForAllTerms(listQueries) {
const resultsForAllTerms = []

// todo: Change getResultsForAllTerms iterator
  async function* asyncIterator(listQueries){
    let i = -1;
    while (i < listQueries.length - 1) {
      i++
      yield [listQueries[i], i];
    }
  }

    for await (const [listQuery, i] of asyncIterator(listQueries)) {
      try {
        let resultsForTerm = await getResultsForTerm(listQuery)

        if (resultsForTerm.length !== 0) {
          resultsForTerm = resultsForTerm.map( resultForTerm => {
            resultForTerm.queryOptions = listQuery
            return resultForTerm
          })
          resultsForAllTerms.push(resultsForTerm)
        }

      } catch (err) {
        console.log(err)
      }

    }

    return resultsForAllTerms

}

module.exports = getResultsForAllTerms;
