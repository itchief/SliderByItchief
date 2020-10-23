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
  #$wrapper; // элемент, в котором находятся items
  #$items; // коллекция элементов (items)
  #$controls; // элементы управления слайдером
  #$indicators; // индикаторы
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

  #updateIndicators() {
    this.#$items.forEach(($element, index) => {
      if ($element.classList.contains('in-view')) {
        this.#$indicators[index].classList.add('active');
      } else {
        this.#$indicators[index].classList.remove('active');
      }
    });
  }

  #itemsOnBothSides() {
    const items = this.#items;
    const $inView = this.#$wrapper.querySelectorAll('.slider__item.in-view');
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
    this.#updateIndicators();
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
  #move(direction, forced = false) {
    if (!forced) {
      if (!hasElementInVew(this.#$elem) || this.#hasTransition) {
        return;
      }
    }
    this.#hasTransition = true;
    const items = this.#items;
    const itemMin = items[this.#getIndex().min];
    const itemMax = items[this.#getIndex().max];
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
    this.#$wrapper.style.transform = `translateX(${this.#transform}%)`;
  }

  // обработчик click для слайдера
  #eventHandler(e) {
    const target = e.target;
    this.#autoplay('off');
    if (target.classList.contains('slider__control')) {
      // при клике на кнопки влево и вправо
      e.preventDefault();
      this.#move(target.dataset.slide);
    } else if (target.dataset.slideTo) {
      // при клике на индикаторы
      const index = +target.dataset.slideTo;
      this.#moveTo(index);
    }
    this.#autoplay();
  }

  #moveTo(index) {
    let minIndex = this.#$indicators.length - 1;
    this.#$indicators.forEach(element => {
      if (element.classList.contains('active')) {
        const slideTo = +element.dataset.slideTo;
        if (slideTo < minIndex) {
          minIndex = slideTo;
        }
      }
    });
    const diff = index - minIndex;
    if (diff === 0) {
      return;
    }
    const direction = diff > 0 ? 'next' : 'prev';
    for (let i = 1; i <= Math.abs(diff); i++) {
      this.#move(direction, true);
    }
  }

  #reset() {
    const itemWidth = parseFloat(getComputedStyle(this.#$items[0]).width);
    const itemsWidth = parseFloat(getComputedStyle(this.#$wrapper).width);
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
    this.#$wrapper.classList.add('slider__items_off');
    this.#$wrapper.style = '';
    this.#$items.forEach($elem => {
      $elem.style = '';
    });
    window.setTimeout(() => {
      this.#$wrapper.classList.remove('slider__items_off');
      this.#items = [];
      this.#$items.forEach((element, position) => {
        this.#items.push({ element, position, transform: 0 });
      });
      this.#itemsOnBothSides();
      this.#autoplay();
    }, 200);
  }

  // подключения обработчиков событий для слайдера
  #addEventListener() {
    this.#$elem.addEventListener('click', this.#eventHandler.bind(this));
    this.#$wrapper.addEventListener('transitionend', () => {
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
    this.#$wrapper = $elem.querySelector('.slider__items');
    this.#$items = $items;
    this.#$controls = {
      prev: $elem.querySelector('.slider__control[data-slide="prev"]'),
      next: $elem.querySelector('.slider__control[data-slide="next"]'),
    };
    this.#$indicators = $elem.querySelectorAll('.slider__indicators>li');
    this.#config = config;
    this.#itemWidth = parseFloat(getComputedStyle($items[0]).width);
    this.#itemsWidth = parseFloat(getComputedStyle(this.#$wrapper).width);
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

document.querySelectorAll('[data-slider="sliderbyitchief"]').forEach($element => {
  const dataset = $element.dataset;
  const infinite = dataset.infinite === 'true' ? true : false;
  const autoplay = dataset.autoplay === 'true' ? true : false;
  let autoplaySpeed = dataset.autoplayspeed ? parseInt(dataset.autoplayspeed) : 5000;
  new SliderByItchief($element, {
    infinite: infinite,
    autoplay: autoplay,
    autoplaySpeed: autoplaySpeed,
  });
});
