const getListQueriesForUser = require('./getListQueriesForUser')
const getAllResults = require('../resultsHandlers/getAllResults')


async function  getResultForUserTerm(user){
  const listQueries = getListQueriesForUser(user)
  const result = await getAllResults(listQueries)
  return result
}


module.exports = getResultForUserTerm