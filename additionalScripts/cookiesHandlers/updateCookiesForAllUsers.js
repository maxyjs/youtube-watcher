const getAllUsers = require('../../usersProcessing/getAllUsers');
const updateCookiesForUser = require('../cookiesHandlers/updateCookiesForUser');

async function updateCookiesForAllUsers() {
  const users = await getAllUsers();

  for (const user of users) {
    user.cookies = require(user.cookiesPath);
    await updateCookiesForUser(user);
  }
}

updateCookiesForAllUsers().catch((err) => console.error(err));
