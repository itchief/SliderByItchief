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
    const minIndex = this.#getIndex().min;
    const maxIndex = this.#getIndex().max;
    const minItem = items[minIndex];
    const maxItem = items[maxIndex];
    if (direction === 'next') {
      this.#currentPosition++;
      if (
        this.#currentPosition + this.#wrapperWidth / this.#itemWidth - 1 >
        maxItem.position
      ) {
        minItem.position = maxItem.position + 1;
        minItem.transform += items.length * 100;
        minItem.element.style.transform = `translateX(${minItem.transform}%)`;
      }
      this.#transformValue -= this.#step;
    } else {
      this.#currentPosition--;
      if (this.#currentPosition < minItem.position) {
        maxItem.position = minItem.position - 1;
        maxItem.transform -= items.length * 100;
        maxItem.element.style.transform = `translateX(${maxItem.transform}%)`;
      }
      this.#transformValue += this.#step;
    }
    this.#$items.style.transform = `translateX(${this.#transformValue}%)`;
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
    this.#wrapperWidth = parseFloat(getComputedStyle(this.#$items).width);
    this.#step = (this.#itemWidth / this.#wrapperWidth) * 100;
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
