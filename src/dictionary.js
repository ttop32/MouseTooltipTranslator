async function fetchJson(url, options = {}) {
  return await fetch(url, options)
    .then((response) => response.json())
    .catch((err) => console.log(err));
}

async function fetchPronunciation(word, lang) {
  return await fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
}

export default { fetchPronunciation };
