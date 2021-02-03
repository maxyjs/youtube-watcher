const fs = require('fs')

function saveNewCookiesToFile(user, newCookies) {
  const {cookiesPath} = user

  fs.writeFileSync(cookiesPath, JSON.stringify(newCookies));
}

module.exports = saveNewCookiesToFile;