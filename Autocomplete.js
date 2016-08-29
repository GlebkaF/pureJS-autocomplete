'use strict';
const KEY_ARROW_UP_CODE = 38;
const KEY_ARROW_DOWN_CODE = 40;
const KEY_ENTER_CODE = 13;

class Autocomplete {
  constructor(options) {
    if(!options.inputId) throw new Error('Input id was not provided');
    if(!options.apiFunction) throw new Error('Api function was not provided');
    this.inputEl = document.getElementById(options.inputId);
    this._getMatchesFromApi = options.apiFunction;
    if(!this.inputEl) throw new Error('Input with such id was not found');
    if(!(this._getMatchesFromApi instanceof Function)) throw new Error('Provided api function is not a function');
    this.outputEl = this._createOutputEl(this.inputEl);
    this.inputEl.addEventListener('input', this._handleInput.bind(this));
    this.inputEl.addEventListener('focus', this._handleInput.bind(this));
    this.inputEl.addEventListener('blur', this._handleBlur.bind(this));
    this.inputEl.addEventListener('keydown', this._handleArrowNavigation.bind(this));
    return this;
  }

  _createOutputEl(inputEl) {
    const outputEl = document.createElement('div');
    outputEl.show = function show() {
      this.style.display = 'block';
    }.bind(outputEl);
    outputEl.hide = function hide() {
      this.style.display = 'none';
    }.bind(outputEl);
    const parentEl = inputEl.parentNode;
    // Todo: стоит ли здесь дрочица и это все выносить?
    // Здесь нужно взять шрифт из инпута, добавить id
    // Сформировать стили для списков
    const inputStyle = getComputedStyle(inputEl);
    outputEl.style.border = '2px solid #cccccc';
    outputEl.style['border-top'] = 'none';
    outputEl.style.position = 'absolute';
    outputEl.style.background = 'white';
    outputEl.style.cursor = 'default';
    outputEl.style['font-size'] = inputStyle['font-size'];
    outputEl.style['font'] = inputStyle['font'];
    outputEl.hide();
    parentEl.appendChild(outputEl);
    return outputEl;
  }

  _handleBlur() {
    // Let the li click handler handle click first
    // TODO : fix this 200 delay before blur
    setTimeout(this.outputEl.hide, 200);
  };

  _handleInput(e) {
    const string = e.target.value;
    if (string) {
      let delay = 300;
      if (string == 'Гл') delay = 1500; //Just for testing
      this._getMatchesFromApi(string, delay)
        .then((matches)=> {
          //TODO: обернуть в функции проверки
          if (!matches || !matches.length) return this.outputEl.hide();
          if ((matches.length == 1) && (matches[0] === string)) return this.outputEl.hide();
          if (e.target.value !== string){
            if ((e.target.value.indexOf(string) > -1)) {
              if (!this._checkOutputRelevance(e.target.value, this.outputEl)) { //В поиске введено Гле (Но апи тормозит сцук, и данные по Гле еще не пришли)
                return this._appendNewOutput(this.outputEl, matches); // а мы получили данные по Гл, нужно показать их юзеру, пока не придут новые по Гле
              }
              else{
                return false;
              }
            }
            else{
              return false;
            }
          }
          return this._appendNewOutput(this.outputEl, matches);
        })
    }
    else {
      this._clearDOMNode(this.outputEl);
      this.outputEl.hide();
    }
  }

  _setRelativeOutputElPosition(inputEl, outputEl) {
    outputEl.style.left = inputEl.offsetLeft + 'px';
    outputEl.style.width = inputEl.clientWidth + 'px';
  }

  _checkOutputRelevance(string, outputEl) {
    let relevance = true;
    if (!outputEl) return false;
    if (!outputEl.firstChild) return false;
    outputEl.firstChild.childNodes.forEach((nodeString)=> {
      let stringPartOfNodeValue = nodeString.firstChild.nodeValue.toLowerCase().indexOf(string.toLowerCase()) > -1;
      if (!stringPartOfNodeValue) relevance = false;
      // TODO: Не возвращает релевантные данные когда в списке и в поле строки совпадают
      console.log('nodeString.firstChild.nodeValue.toLowerCase() ', nodeString.firstChild.nodeValue.toLowerCase());
      console.log('str ', string);
    });
    return relevance;
  }

  _appendNewOutput(outputEl, matches) {
    this._clearDOMNode(outputEl);
    outputEl.appendChild(this._createMatchesList(matches));
    this._setRelativeOutputElPosition(this.inputEl, outputEl);
    outputEl.show();
    return outputEl;
  }

  _clearDOMNode(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    return node;
  }

  _removeElClass(el, className) {
    if (el) {
      let newClassList = [];
      el.classList.forEach((elClass) => {
        if (elClass !== className)
          newClassList.push(elClass);
      });
      el.classList = newClassList;
      return el;
    }
    else {
      return false;
    }
  }

  _createListElement(string) {
    // This function is not pure
    let listItem = document.createElement('li');
    listItem.innerHTML = string;
    listItem.addEventListener('click', function liItemClicked(e) {
      console.log('clicked');
      this.inputEl.value = e.target.textContent;
      this.outputEl.hide();
    }.bind(this));
    listItem.addEventListener('mouseenter', function liItemMouseEnter(e) {
      e.target.parentNode.childNodes.forEach((el) => {
        this._removeElClass(el, 'li-hovered');
      });
      e.target.classList.add('li-hovered');
    }.bind(this));
    listItem.addEventListener('mouseout', function liItemMouseOut(e) {
      this._removeElClass(e.target, 'li-hovered');
    }.bind(this));
    return listItem;
  }

  _createMatchesList(matches) {
    //Seems pure but _createListEl :C
    if (!(matches instanceof Array)) throw new Error('Matches object is not an array');
    let matchesList = document.createElement('ul');
    matchesList.setAttribute('class', 'matched-list');
    matchesList.style['list-style-type'] = 'none';
    matchesList.style.margin = '0px';
    matchesList.style.padding = '3px';
    matches.forEach((string)=> {
      matchesList.appendChild(this._createListElement(string));
    });
    return matchesList;
  }

//List navigation

  _handleArrowNavigation(e) {
    switch (e.keyCode) {
      case KEY_ARROW_UP_CODE:
        e.preventDefault();
        this._navigate(this.outputEl.firstChild, 'up');
        break;
      case KEY_ARROW_DOWN_CODE:
        e.preventDefault();
        this._navigate(this.outputEl.firstChild, 'down');
        break;
      case KEY_ENTER_CODE:
        const hoveredEl = this.outputEl.firstChild.querySelector('.li-hovered');
        if (hoveredEl && this.outputEl.style.display == 'block') {
          this.inputEl.value = hoveredEl.textContent;
          this.outputEl.hide();
        }
        break;
    }
  }

  _navigate(el, action) {
    if (!el) return false;
    if (!el.childNodes) return false;
    let targetdEl;
    const hovered = el.querySelector('.li-hovered');
    if (hovered) this._removeElClass(hovered, 'li-hovered');
    switch (action) {
      case 'up':
        targetdEl = hovered ? hovered.previousSibling : el.lastChild;
        if (!targetdEl) targetdEl = el.lastChild;
        break;
      case 'down':
        targetdEl = hovered ? hovered.nextSibling : el.firstChild;
        if (!targetdEl) targetdEl = el.firstChild;
        break;
    }
    if (targetdEl)
      targetdEl.classList.add('li-hovered');
  }

};
