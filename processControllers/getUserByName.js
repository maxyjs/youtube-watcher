const getAllUsers = require('../usersProcessing/getAllUsers');

function getUserByName(userName) {
  const allUsers = getAllUsers();
  const targetUser = allUsers.find((user) => user.userName === userName);
  return targetUser;
}

module.exports = getUserByName;
