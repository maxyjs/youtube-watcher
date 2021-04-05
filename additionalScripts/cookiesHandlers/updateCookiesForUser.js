const getInstanceBrowser = require('../../Browser/getInstanceBrowser');

async function updateCookiesForUser(user) {
  const instanceBrowser = await getInstanceBrowser(user);

  if (instanceBrowser.error === true) {
    console.warn(user.userName);
    console.warn(instanceBrowser.errorReason);
    console.warn('Required manual update cookies file!');
  } else {
    console.log(
      '\x1b[44m%s\x1b[0m',
      `Cookie file for user ${user.userName} succesfully updated`
    ); // bg blue
  }

  await instanceBrowser.browser.close();
}

module.exports = updateCookiesForUser;
