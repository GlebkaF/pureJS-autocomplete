document.addEventListener("DOMContentLoaded", function () {
  const inputEl = document.getElementById('main-input');
  const outputEl = createOutputEl(inputEl);
  inputEl.addEventListener('input', handleInput);
  inputEl.dispatchEvent(new Event('input')); //Testing
  function handleInput(e) {
    const string = e.target.value;
    if (string) {
      let delay = 300;
      if(string == 'Гл') delay = 1500; //Just for testing
      getMatchesFromApi(string, delay)
        .then((matches)=> {
          if(!matches.length) return outputEl.hide();
          if((matches.length == 1) && (matches[0] === string)) return outputEl.hide();
          if (e.target.value !== string)
            if((e.target.value.indexOf(string) > -1))
              if(!checkRelevanceOfOutput(e.target.value, outputEl)) //В поиске введено Гле (Но апи тормозит сцук, и данные по Гле еще не пришли)
                return appendNewOutput(outputEl, matches); // а мы получили данные по Гл, нужно показать их юзеру, пока не придут новые по Гле
              else
                return false;
          return appendNewOutput(outputEl, matches);
        })
        .catch((err) => {
          outputEl.hide();
          console.error(err);
        });
    }
    else {
      clearDOMNode(outputEl);
      outputEl.hide();
    }
  };
  function createOutputEl(inputEl){
    const outputEl = document.createElement('div');
    outputEl.show = function show(){
      this.style.display = 'block';
    }
    outputEl.hide = function hide(){
      this.style.display = 'none';
    }
    const parentEl = inputEl.parentNode;
    outputEl.style.border = '2px solid #cccccc';
    outputEl.style['border-top'] = 'none';
    outputEl.style.position = 'absolute';
    outputEl.hide();
    parentEl.appendChild(outputEl);
    return outputEl;
  };
  function setRelativeOutputElPosition(inputEl, outputEl){
    outputEl.style.left = inputEl.offsetLeft  + 'px';
    outputEl.style.width = inputEl.clientWidth + 'px';
  };
  function checkRelevanceOfOutput(string, outputEl){
    let relevance = true;
    if(!outputEl) return false;
    if(!outputEl.firstChild) return false;
    outputEl.firstChild.childNodes.forEach((nodeString)=>{
      let stringPartOfNodeValue = nodeString.firstChild.nodeValue.toLowerCase().indexOf(string.toLowerCase()) > -1;
      if(!stringPartOfNodeValue) relevance = false;
    });
    console.log(relevance);
    return relevance;
  }
  function appendNewOutput(outputEl, matches){
    clearDOMNode(outputEl);
    outputEl.appendChild(createMatchesList(matches));
    setRelativeOutputElPosition(inputEl, outputEl);
    outputEl.show();
  }
  function clearDOMNode(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  };
  function getMatchesFromApi(string, delay = 300) {
    const dict = ['Глеб', 'Глоб', 'Глыб', 'Гжеб', 'Гсеб', 'Гсех', 'Гтех', 'Глеп', 'Максим', 'Вера', 'Светлана'];
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const matches = findMatches(string, dict);
        if (matches.length) {
          return resolve(matches);
        }
        else {
          return reject(new Error('Empty response from api'));
        }
      }, delay);
    })
      .catch((err) => {
        if(!err) err = new Error('Unexpected error');
        return err;
      });

  };
  function createListElement(string){
    let listItem = document.createElement('li');
    listItem.innerHTML = string;
    listItem.addEventListener('click', function liItemClicked(e) {
      inputEl.value = e.target.textContent;
      outputEl.hide();
    });
    return listItem;
  }
  function createMatchesList(matches) {
    if (!(matches instanceof Array)) throw new Error('Matches object is not an array');
    let matchesList = document.createElement('ul');
    matchesList.setAttribute('class', 'matched-list');
    matches.forEach((string)=> {
      matchesList.appendChild(createListElement(string));
    });
    return matchesList;
  };
  function findMatches(string, dict) {
    if (typeof string != 'string') throw new Error('Provided string is not a String');
    if (!(dict instanceof Array)) throw new Error('Provided dictionary is not an Array');
    if (!string.length) throw new Error('Provided word is empty');
    if (!dict.length) throw new Error('Provided dict is empty');
    let matches = [];
    dict.forEach((dictString) => {
      let slicedWord = dictString.slice(0, string.length);
      if (slicedWord.toLowerCase() === string.toLowerCase()){
        matches.push(dictString);
      }
    });
    return matches;
  };
});