const fs = require('fs')

async function checkCookiesFile(user) {

  const filePath = `${user.userDirectory}\\cookies.json`

  let resultChecked = checkByExistFile(filePath)

  if (resultChecked.error === true) {
    return resultChecked
  }

  resultChecked = checkByValidData(filePath)

  function checkByValidData(filePath) {

    const data = require(filePath)
    const isValid = data.length > 1

    if (isValid) {
      return {
        isExist: true,
        error: false
      }
    }

    return {
      isExist: true,
      error: true,
      reason: `No valid data:\n${filePath}`
    }
  }

  function checkByExistFile(filePath) {

    try {
      if (fs.existsSync(filePath)) {
        return {
          isExist: true,
          error: false
        }
      } else {
        return {
          isExist: false,
          error: true,
          reason: `File not found at path:\n${filePath}`
        }
      }
    } catch (err) {
      return {
        isExist: false,
        error: true,
        reason: `File not found at path:\n${filePath}`
      }
    }

  }

  return resultChecked
}

module.exports = checkCookiesFile;