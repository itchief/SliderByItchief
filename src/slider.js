'use strict';

class SliderByItchief {
  #positionLeftItem = 0;
  #wrapperWidth = 0;
  #itemWidth = 0;
  #transform = 0;
  #step = 0;
  #items = [];
  #$wrapper = null;
  #$items = null;
  #$controls = null;

  constructor($elem, config) {
    this.#init($elem, config);
    this.#setUpListeners();
  }

  #getIndexMin(_items) {
    let indexItem = 0;
    _items.forEach(function (item, index) {
      if (item.position < _items[indexItem].position) {
        indexItem = index;
      }
    });
    return indexItem;
  }

  #getIndexMax(_items) {
    let indexItem = 0;
    _items.forEach(function (item, index) {
      if (item.position > _items[indexItem].position) {
        indexItem = index;
      }
    });
    return indexItem;
  }

  #move(direction) {
    let nextItem;
    if (direction === 'right') {
      this.#positionLeftItem++;
      if (
        this.#positionLeftItem + this.#wrapperWidth / this.#itemWidth - 1 >
        this.#items[this.#getIndexMax(this.#items)].position
      ) {
        nextItem = this.#getIndexMin(this.#items);
        this.#items[nextItem].position =
          this.#items[this.#getIndexMax(this.#items)].position + 1;
        this.#items[nextItem].transform += this.#items.length * 100;
        this.#items[nextItem].item.style.transform =
          'translateX(' + this.#items[nextItem].transform + '%)';
      }
      this.#transform -= this.#step;
    }
    if (direction === 'left') {
      this.#positionLeftItem--;
      if (
        this.#positionLeftItem <
        this.#items[this.#getIndexMin(this.#items)].position
      ) {
        nextItem = this.#getIndexMax(this.#items);
        this.#items[nextItem].position =
          this.#items[this.#getIndexMin(this.#items)].position - 1;
        this.#items[nextItem].transform -= this.#items.length * 100;
        this.#items[nextItem].item.style.transform =
          'translateX(' + this.#items[nextItem].transform + '%)';
      }
      this.#transform += this.#step;
    }
    this.#$wrapper.style.transform = 'translateX(' + this.#transform + '%)';
  }

  // обработчик события click для кнопок "назад" и "вперед"
  #controlClick(e) {
    if (e.target.classList.contains('slider__control')) {
      e.preventDefault();
      var direction = e.target.classList.contains('slider__control_right')
        ? 'right'
        : 'left';
      this.#move(direction);
    }
  }

  #setUpListeners() {
    //console.log(that);
    // добавление к кнопкам "назад" и "вперед" обрботчика _controlClick для событя click
    const that = this;
    this.#$controls.forEach(function (item) {
      item.addEventListener('click', that.#controlClick.bind(that));
    });
  }

  #init($elem, config) {
    this.#$wrapper = $elem.querySelector('.slider__wrapper');
    this.#$items = $elem.querySelectorAll('.slider__item');
    this.#$controls = $elem.querySelectorAll('.slider__control');
    this.#wrapperWidth = parseFloat(getComputedStyle(this.#$wrapper).width); // ширина обёртки
    this.#itemWidth = parseFloat(getComputedStyle(this.#$items[0]).width); // ширина одного элемента
    this.#positionLeftItem = 0; // позиция левого активного элемента
    this.#transform = 0; // значение транфсофрмации .slider_wrapper
    this.#step = (this.#itemWidth / this.#wrapperWidth) * 100; // величина шага (для трансформации)
    this.#items = []; // массив элементов
    // наполнение массива _items
    const that = this;
    this.#$items.forEach(function (item, index) {
      that.#items.push({ item: item, position: index, transform: 0 });
    });
    //this.setUpListeners();
  }
  right() {
    // метод right
    this.#move('right');
  }
  left() {
    // метод left
    this.#move('left');
  }
}
