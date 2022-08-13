const fs = require('fs');

class CacheAddedVideoToPlaylist {
  constructor(user) {
    this.user = user;
    this.userDirectory = user.userDirectory;
    this.cache = undefined;
    this.cacheFileDirectoryName = 'cache';
    this.cacheDirectoryPath = `${this.userDirectory}\\${this.cacheFileDirectoryName}`;
    this.cacheFileName = 'cacheAddedVideoToPlaylist.json';
    this.cacheFilePath = `${this.cacheDirectoryPath}\\${this.cacheFileName}`;
    this.emptyCacheTemplate = {
      user: user.userName,
      addedVideoIds: {},
    };
    this.init();
  }

  init() {
    this._checkExistCacheDirectory();
    if (!this._checkExistCacheFile()) {
      this._setRuntimeEmptyCache();
      this.checkCacheIncludeVideoId = (id) => {
        return false;
      };
    } else {
      this._setCacheFromFile();
    }
  }

  /* PRIVATE */

  _setRuntimeEmptyCache() {
    this.cache = this.emptyCacheTemplate;
  }

  _setCacheFromFile() {
    this.cache = require(this.cacheFilePath);
  }

  _checkExistCacheDirectory() {
    try {
      fs.statSync(this.cacheDirectoryPath);
    } catch (err) {
      console.error('Not found cache directory');
      throw new Error(err);
    }
  }

  _checkExistCacheFile() {
    try {
      fs.statSync(this.cacheFilePath);
    } catch (err) {
      return false;
    }
    return true;
  }

  /* PUBLIC */

  addVideoIdToCache(id) {
    this.cache.addedVideoIds[id] = true;
  }

  checkCacheIncludeVideoId(id) {
    return !!this.cache.addedVideoIds[id];
  }

  addListVideoIdToFile(ids) {
    ids.forEach((id) => this.addVideoIdToCache(id));
    this.saveCacheFile();
  }

  saveCacheFile() {
    fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.cache));
  }
}

module.exports = CacheAddedVideoToPlaylist;
