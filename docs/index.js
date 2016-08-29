
  document.addEventListener("DOMContentLoaded", function () {
    const dict = ['Глеб', 'Глоб', 'Глыб', 'Гжеб', 'Гсеб', 'Гсех', 'Гтех', 'Глеп', 'Максим', 'Вера', 'Светлана'];
    const apiFunction =  function _getMatchesFromApi(string, delay = 300) {
      function  findMatches(string, dict) {
        if (typeof string != 'string') throw new Error('Provided string is not a String');
        if (!(dict instanceof Array)) throw new Error('Provided dictionary is not an Array');
        if (!string.length) throw new Error('Provided word is empty');
        if (!dict.length) throw new Error('Provided dict is empty');
        let matches = [];
        dict.forEach((dictString) => {
          let slicedWord = dictString.slice(0, string.length);
          if (slicedWord.toLowerCase() === string.toLowerCase()) {
            matches.push(dictString);
          }
        });
        return matches;
      }
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const matches = findMatches(string, dict);
          resolve(matches);
        }, delay);
      })
    };
    const options = {
      inputId : "main-input",
      apiFunction : apiFunction
    };
    const autoInput = new Autocomplete(options);
  });