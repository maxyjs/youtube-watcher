const resultsStore = {
  results: [],
  addedIds: new Set(),

  addResult(result) {
    const isHas = this.addedIds.has(result.video.id);
    if (!isHas) {
      this.results.push(result);
      this.addedIds.add(result.video.id);
    }
  },

  getResults() {
    return this.results;
  },
};

module.exports = resultsStore;

