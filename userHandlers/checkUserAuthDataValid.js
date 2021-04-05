const getInstanceBrowser = require('../Browser/getInstanceBrowser');
const checkCookiesFile = require('../cookiesHandlers/checkCookiesFile');

async function checkUserAuthDataValid(user) {
  const resultChecked = await checkCookiesFile(user);

  if (resultChecked.error === true) {
    return resultChecked;
  }

  user.cookies = require(`${user.userDirectory}\\cookies.json`);

  const instanceBrowser = await getInstanceBrowser(user);

  if (instanceBrowser.error === true) {
    await instanceBrowser.browser.close();

    return {
      error: true,
      reason: `Failed login!`,
    };
  }

  await instanceBrowser.browser.close();
  return {
    error: false,
  };
}

module.exports = checkUserAuthDataValid;
