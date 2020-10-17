'use strict';

class SliderByItchief {
  #currentPosition = 0; // позиция активного элемента
  #wrapperWidth = 0; // ширина контейнера
  #itemWidth = 0; // вычисленная ширина одного слайда
  #transformValue = 0; // текущее значение трансформации
  #step = 0; // величина значения шага трансформации
  #items = []; // массив, в котором хранятся текущее состояние слайдов
  #$elem; // основной элемент слайдера
  #$items; // элемент, непосредственно содержащий слайды

  constructor($elem, config) {
    this.#init($elem, config);
    this.#setUpListeners();
  }

  #getIndexMin(_items) {
    let indexItem = 0;
    _items.forEach(function (item, index) {
      if (item.index < _items[indexItem].index) {
        indexItem = index;
      }
    });
    return indexItem;
  }

  #getIndexMax(_items) {
    let indexItem = 0;
    _items.forEach(function (item, index) {
      if (item.index > _items[indexItem].index) {
        indexItem = index;
      }
    });
    return indexItem;
  }

  // сдвиг слайда
  #move(direction) {
    let nextItem;
    if (direction === 'next') {
      this.#currentPosition++;
      if (
        this.#currentPosition + this.#wrapperWidth / this.#itemWidth - 1 >
        this.#items[this.#getIndexMax(this.#items)].index
      ) {
        nextItem = this.#getIndexMin(this.#items);
        this.#items[nextItem].index =
          this.#items[this.#getIndexMax(this.#items)].index + 1;
        this.#items[nextItem].value += this.#items.length * 100;
        this.#items[nextItem].element.style.transform = `translateX(${
          this.#items[nextItem].value
        }%)`;
      }
      this.#transformValue -= this.#step;
    }
    if (direction === 'prev') {
      this.#currentPosition--;
      if (
        this.#currentPosition <
        this.#items[this.#getIndexMin(this.#items)].index
      ) {
        nextItem = this.#getIndexMax(this.#items);
        this.#items[nextItem].index =
          this.#items[this.#getIndexMin(this.#items)].index - 1;
        this.#items[nextItem].value -= this.#items.length * 100;
        this.#items[nextItem].element.style.transform =
          'translateX(' + this.#items[nextItem].value + '%)';
      }
      this.#transformValue += this.#step;
    }
    this.#$items.style.transform = `translateX(${this.#transformValue}%)`;
  }

  // обработчик события click для слайдера
  #controlClick(e) {
    const target = e.target;
    if (target.classList.contains('slider__control')) {
      e.preventDefault();
      this.#move(target.dataset.slide);
    }
  }

  // подключения обработчиков событий для слайдера
  #setUpListeners() {
    this.#$elem.addEventListener('click', this.#controlClick.bind(this));
  }

  // первичная настройка слайдера
  #init($elem, config) {
    const $items = $elem.querySelectorAll('.slider__item');
    this.#$elem = $elem;
    this.#$items = $elem.querySelector('.slider__items');
    this.#itemWidth = parseFloat(getComputedStyle($items[0]).width);
    this.#wrapperWidth = parseFloat(getComputedStyle(this.#$items).width);
    this.#step = (this.#itemWidth / this.#wrapperWidth) * 100;
    $items.forEach((item, index) =>
      this.#items.push({ element: item, index: index, value: 0 })
    );
  }

  // public
  next() {
    this.#move('next');
  }
  prev() {
    this.#move('prev');
  }
}
