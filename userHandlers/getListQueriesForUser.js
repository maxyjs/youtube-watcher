const fs = require('fs');

function getListQueriesForUser(user) {

  try {
    const {userDirectory} = user
    const listQueriesPath = `${userDirectory}\\listsQueries\\list1.json`
    const list = JSON.parse( fs.readFileSync(listQueriesPath) )
    let termsAsStringFromFile = fs.readFileSync( list.termsPath, {encoding:'utf8'} )
    termsAsStringFromFile = termsAsStringFromFile.replace(/(\r\n){2,}/g, '')
    termsAsStringFromFile = termsAsStringFromFile.replace(/[ ]{2,}/g, ' ')
    const termsArray = getTermsAsArray(termsAsStringFromFile)

    let termOptions = list.termOptions
    termOptions = setOptionsForFilterResults(user, termOptions)
    
    const listQueries = termsArray.map(term => {
      return {
        term,
        termOptions
      }
    })
    
    return listQueries
    
  } catch (err) {
    throw err
  }
}

function getTermsAsArray(termsAsStringFromFile) {
  const termsArray = termsAsStringFromFile.split(/\r?\n/)
  const uniqueArray = [...new Set(termsArray)];
  return uniqueArray
}

function setOptionsForFilterResults(user, termOptions) {
  const {defaultMinViews, defaultMinRating} = user
  return {
    minViews: defaultMinViews,
    minRating: defaultMinRating,
    ...termOptions
  }
}

module.exports = getListQueriesForUser







