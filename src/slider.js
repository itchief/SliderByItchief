'use strict';

const hasTouchDevice = () => {
  return !!('ontouchstart' in window || navigator.maxTouchPoints);
};

const hasElementInVew = $elem => {
  const rect = $elem.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  const vertInView = rect.top <= windowHeight && rect.top + rect.height >= 0;
  const horInView = rect.left <= windowWidth && rect.left + rect.width >= 0;
  return vertInView && horInView;
};

class SliderByItchief {
  #positionMin = 0; // позиция активного элемента (минимальная)
  #items = []; // массив items
  #itemsWidth = 0; // ширина всех items
  #itemsDisplayed = 0; // количество одновременно отображаемых items
  #itemWidth = 0; // ширина одного item
  #transform = 0; // текущее значение трансформации
  #transformStep = 0; // значение шага трансформации
  #intervalId = null;
  //#responsive = {};
  #config = {}; // конфигурация слайдера
  #$elem; // базовый элемент слайдера
  #$items; // элемент, в котором находятся items
  #$controls; // элементы управления слайдером
  #hasTransition = false;

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

  #getElementByPosition(position) {
    let element;
    this.#items.forEach(item => {
      if (item.position === position) {
        element = item.element;
      }
    });
    return element;
  }

  #itemsOnBothSides() {
    const items = this.#items;
    const $inView = this.#$items.querySelectorAll('.slider__item.in-view');
    const positionMax = this.#positionMin + this.#itemsDisplayed - 1;
    const itemMax = items[this.#getIndex().max];
    const itemMin = items[this.#getIndex().min];
    // удаление у items класса in-view
    $inView.forEach(element => {
      element.classList.remove('in-view');
    });
    // добавление класса in-view к отображаемым items
    for (let i = this.#positionMin; i < this.#positionMin + this.#itemsDisplayed; i++) {
      this.#getElementByPosition(i).classList.add('in-view');
    }
    if (this.#positionMin === itemMin.position) {
      // добавление элемента слева
      itemMax.position = itemMin.position - 1;
      itemMax.transform -= items.length * 100;
      itemMax.element.style.transform = `translateX(${itemMax.transform}%)`;
    } else if (positionMax === itemMax.position) {
      // добавление элемента справа
      itemMin.position = itemMax.position + 1;
      itemMin.transform += items.length * 100;
      itemMin.element.style.transform = `translateX(${itemMin.transform}%)`;
    }
  }

  // сдвиг слайда
  #move(direction) {
    if (!hasElementInVew(this.#$elem) || this.#hasTransition) {
      return;
    }
    this.#hasTransition = true;
    const items = this.#items;
    const itemMin = items[this.#getIndex().min];
    const itemMax = items[this.#getIndex().max];
    //
    const itemMinNext = items[this.#getIndex().min + 1];
    //
    if (direction === 'next') {
      const positionMax = this.#positionMin + this.#itemsDisplayed - 1;
      if (this.#config.infinite === false) {
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
        this.#itemsOnBothSides();
        this.#transform -= this.#transformStep;
      }
    } else {
      if (this.#config.infinite === false) {
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
        this.#itemsOnBothSides();
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
      this.#autoplay('off');
      this.#move(target.dataset.slide);
      this.#autoplay();
    }
  }

  #reset() {
    const $item = this.#$elem.querySelector('.slider__item');
    const $items = this.#$elem.querySelector('.slider__items');
    const itemWidth = parseFloat(getComputedStyle($item).width);
    const itemsWidth = parseFloat(getComputedStyle($items).width);
    const itemsDisplayed = Math.round(itemsWidth / itemWidth);
    if (itemsDisplayed === this.#itemsDisplayed) {
      return;
    }
    this.#autoplay('off');
    this.#positionMin = 0;
    this.#transform = 0;
    this.#itemWidth = itemWidth;
    this.#itemsWidth = itemsWidth;
    this.#itemsDisplayed = itemsDisplayed;
    this.#transformStep = 100 / itemsDisplayed;
    $items.classList.add('slider__items_off');
    $items.style = '';
    $items.querySelectorAll('.slider__item').forEach($elem => {
      $elem.style = '';
    });
    window.setTimeout(() => {
      $items.classList.remove('slider__items_off');
      this.#items = [];
      $items.querySelectorAll('.slider__item').forEach((element, position) => {
        this.#items.push({ element, position, transform: 0 });
      });
      this.#itemsOnBothSides();
      this.#autoplay();
    }, 200);
  }

  // подключения обработчиков событий для слайдера
  #addEventListener() {
    this.#$elem.addEventListener('click', this.#eventHandler.bind(this));
    this.#$items.addEventListener('transitionend', () => {
      this.#hasTransition = false;
    });
    if (this.#config.autoplay === true) {
      this.#$elem.addEventListener('mouseenter', () => {
        this.#autoplay('off');
      });
      this.#$elem.addEventListener('mouseleave', () => {
        this.#autoplay();
      });
    }
    window.addEventListener('resize', this.#reset.bind(this));
  }

  #autoplay(action) {
    if (this.#config.autoplay !== true) {
      return;
    }
    if (action === 'off') {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
      return;
    }
    if (this.#intervalId === null) {
      this.#intervalId = setInterval(() => {
        this.#move('next');
      }, this.#config.autoplaySpeed);
    }
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

    $items.forEach((element, position) => this.#items.push({ element, position, transform: 0 }));
    this.#itemsOnBothSides();
    if (this.#config.infinite === false) {
      this.#$controls.prev.classList.add('slider__control_hide');
    }
    this.#autoplay();
  }

  // public
  next() {
    this.#move('next');
  }
  prev() {
    this.#move('prev');
  }
}
