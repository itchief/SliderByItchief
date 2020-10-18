'use strict';

const isTouchDevice = () => {
  return !!('ontouchstart' in window || navigator.maxTouchPoints);
};

class SliderByItchief {
  #positionMin = 0; // позиция активного элемента (минимальная)
  #items = []; // массив items
  #itemsWidth = 0; // ширина всех items
  #itemsDisplayed = 0; // количество одновременно отображаемых items
  #itemWidth = 0; // ширина одного item
  #transform = 0; // текущее значение трансформации
  #transformStep = 0; // значение шага трансформации
  #config = {}; // конфигурация слайдера
  #$elem; // базовый элемент слайдера
  #$items; // элемент, в котором находятся items
  #$controls; // элементы управления слайдером

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
      const positionMax = this.#positionMin + this.#itemsDisplayed - 1;
      if (this.#config.isLooped === false) {
        if (positionMax >= itemMax.position) {
          return;
        }
        if (positionMax >= itemMax.position - 1) {
          this.#$controls.next.classList.add('slider__control_hide');
        } else {
          this.#$controls.prev.classList.remove('slider__control_hide');
        }
        this.#positionMin++;
        this.#transform -= this.#transformStep;
      } else {
        this.#positionMin++;
        const positionMax = this.#positionMin + this.#itemsDisplayed - 1;
        if (positionMax > itemMax.position) {
          itemMin.position = itemMax.position + 1;
          itemMin.transform += items.length * 100;
          itemMin.element.style.transform = `translateX(${itemMin.transform}%)`;
        }
        this.#transform -= this.#transformStep;
      }
    } else {
      if (this.#config.isLooped === false) {
        if (this.#positionMin <= itemMin.position) {
          return;
        }
        if (this.#positionMin <= itemMin.position + 1) {
          this.#$controls.prev.classList.add('slider__control_hide');
        } else {
          this.#$controls.next.classList.remove('slider__control_hide');
        }
        this.#positionMin--;
        this.#transform += this.#transformStep;
      } else {
        this.#positionMin--;
        if (this.#positionMin < itemMin.position) {
          itemMax.position = itemMin.position - 1;
          itemMax.transform -= items.length * 100;
          itemMax.element.style.transform = `translateX(${itemMax.transform}%)`;
        }
        this.#transform += this.#transformStep;
      }
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
    this.#config = config;
    this.#$items = $elem.querySelector('.slider__items');
    this.#$controls = {
      prev: $elem.querySelector('.slider__control[data-slide="prev"]'),
      next: $elem.querySelector('.slider__control[data-slide="next"]'),
    };
    this.#itemWidth = parseFloat(getComputedStyle($items[0]).width);
    this.#itemsWidth = parseFloat(getComputedStyle(this.#$items).width);
    this.#itemsDisplayed = Math.round(this.#itemsWidth / this.#itemWidth);
    this.#transformStep = 100 / this.#itemsDisplayed;
    $items.forEach((element, position) =>
      this.#items.push({ element, position, transform: 0 })
    );
    if (this.#config.isLooped === false) {
      this.#$controls.prev.classList.add('slider__control_hide');
    }
  }

  // public
  next() {
    this.#move('next');
  }
  prev() {
    this.#move('prev');
  }
}
