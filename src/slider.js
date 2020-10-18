'use strict';

class SliderByItchief {
  #positionMin = 0; // позиция активного элемента (минимальная)
  #items = []; // массив items
  #itemsWidth = 0; // ширина всех items
  #itemsDisplayed = 0; // количество одновременно отображаемых items
  #itemWidth = 0; // ширина одного item
  #transform = 0; // текущее значение трансформации
  #transformStep = 0; // значение шага трансформации
  #$elem; // базовый элемент слайдера
  #$items; // элемент, в котором находятся items

  constructor($elem, config) {
    this.#init($elem, config);
    this.#addEventListener();
  }

  #getIndex() {
    const extreme = { min: 0, max: 0 };
    this.#items.forEach((item, index) => {
      if (item.position < this.#items[extreme.min].position) {
        extreme.min = index;
      }
      if (item.position > this.#items[extreme.max].position) {
        extreme.max = index;
      }
    });
    return extreme;
  }

  // сдвиг слайда
  #move(direction) {
    const items = this.#items;
    const itemMin = items[this.#getIndex().min];
    const itemMax = items[this.#getIndex().max];
    if (direction === 'next') {
      this.#positionMin++;
      const positionMax = this.#positionMin + this.#itemsDisplayed - 1;
      if (positionMax > itemMax.position) {
        itemMin.position = itemMax.position + 1;
        itemMin.transform += items.length * 100;
        itemMin.element.style.transform = `translateX(${itemMin.transform}%)`;
      }
      this.#transform -= this.#transformStep;
    } else {
      this.#positionMin--;
      if (this.#positionMin < itemMin.position) {
        itemMax.position = itemMin.position - 1;
        itemMax.transform -= items.length * 100;
        itemMax.element.style.transform = `translateX(${itemMax.transform}%)`;
      }
      this.#transform += this.#transformStep;
    }
    this.#$items.style.transform = `translateX(${this.#transform}%)`;
  }

  // обработчик события click для слайдера
  #eventHandler(e) {
    const target = e.target;
    if (target.classList.contains('slider__control')) {
      e.preventDefault();
      this.#move(target.dataset.slide);
    }
  }

  // подключения обработчиков событий для слайдера
  #addEventListener() {
    this.#$elem.addEventListener('click', this.#eventHandler.bind(this));
  }

  // первичная настройка слайдера
  #init($elem, config) {
    const $items = $elem.querySelectorAll('.slider__item');
    this.#$elem = $elem;
    this.#$items = $elem.querySelector('.slider__items');
    this.#itemWidth = parseFloat(getComputedStyle($items[0]).width);
    this.#itemsWidth = parseFloat(getComputedStyle(this.#$items).width);
    this.#itemsDisplayed = Math.round(this.#itemsWidth / this.#itemWidth);
    this.#transformStep = 100 / this.#itemsDisplayed;
    $items.forEach((element, position) =>
      this.#items.push({ element, position, transform: 0 })
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
