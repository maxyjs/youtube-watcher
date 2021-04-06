function addResult(result) {
  const isHas = this.addedIds.has(result.video.id);
  if (!isHas) {
    this.results.push(result);
    this.addedIds.add(result.video.id);
  }
}

function getResults() {
  return this.results;
}

const resultsContainer = {
  results: [],
  addedIds: new Set(),
  addResult,
  getResults,
  resultsForEach(fn) {
    for (let i = 0; i < this.results.length; i++){
      fn(results[i])
    }
  }
};

module.exports = resultsContainer;
