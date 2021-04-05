const getUserByName = require('./getUserByName');
const handleUser = require('../userHandlers/handleUser');

async function generalProcessController(userName, options) {
  const { testMode } = options;
  const user = getUserByName(userName);

  if (user === undefined) {
    console.error(`Not found user by user name: ${userName}`);
    process.exit(1);
  }

  console.log('\x1b[44m%s\x1b[0m', 'Start handle user: ', userName); // bg blue
  console.log('\x1b[33m%s\x1b[0m', 'testMode  = ', testMode); // font yellow

  const resultHandleUser = await handleUser(user, options);
  if (resultHandleUser) {
    if (resultHandleUser.error === true) {
      console.error(resultHandleUser);
      process.exit(1);
    }

    if (resultHandleUser.message) {
      console.log(resultHandleUser.message);
    }
  }
}

module.exports = generalProcessController;
