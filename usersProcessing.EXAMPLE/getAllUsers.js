const usersList = [
  {
    userName: '',
    userDirectory: '( absolute path )',
    cookiesPath: '( absolute path )',
    addPlaylistMark: 'auto_watcher_example', // плейлист для добавления найденных видео должен содержать эту строку. плейлист создать вручную в аккаунте
    defaultMinRating: 4.4, // минимальный рейтинг видео для фильтрации по рейтину. ( 0-5 )
    defaultMinViews: 1000, // минимальное количество просмотров видео по умолчанию для юзера
  },
];

function getAllUsers() {
  return usersList;
}

module.exports = getAllUsers;
