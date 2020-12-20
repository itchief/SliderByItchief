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
  _positionMin = 0; // позиция активного элемента (минимальная)
  _items = []; // массив items
  _itemsWidth = 0; // ширина всех items
  _itemsOnScreen = 0; // количество одновременно отображаемых items
  _itemWidth = 0; // ширина одного item
  _transform = 0; // текущее значение трансформации
  _transformStep = 0; // значение шага трансформации
  _intervalId = null;
  //_responsive = {};
  _config = {}; // конфигурация слайдера
  _$elem; // базовый элемент слайдера
  _$sliderItems; // элемент, в котором находятся items
  _$sliderItem; // коллекция элементов (items)
  _$controls; // элементы управления слайдером
  _$indicators; // индикаторы
  _hasTransition = false;
  _queue = [];
  _moveByOne = false;
  _durationDefault = 600;
  _acceleration = 6;
  _duration = this._durationDefault;
  _durationProcess = this._durationDefault;

  constructor($elem, config) {
    this._init($elem, config);
    this._addEventListener();
  }

  // animate
  _animate({ start, end, timing, draw }) {
    const that = this;
    start();
    this._hasTransition = true;
    let startTime = performance.now();
    requestAnimationFrame(function animate(time) {
      if (that._durationProcess > that._duration) {
        that._durationProcess -= 20;
      } else {
        that._durationProcess = that._duration;
      }
      if (startTime > time) startTime = time;
      let timeFraction = (time - startTime) / that._durationProcess;
      if (timeFraction > 1) timeFraction = 1;
      let progress = timing(timeFraction);
      draw(progress);
      if (timeFraction < 1) {
        requestAnimationFrame(animate);
      } else {
        end();
      }
    });
  }

  // получить крайние элементы
  _getExtremeElementsByOrder() {
    let min = 0;
    let max = 0;
    let $min, $max;
    this._$sliderItem.forEach($elem => {
      const order = +$elem.dataset.order;
      if (order <= min) {
        min = order;
        $min = $elem;
      } else if (order >= max) {
        max = order;
        $max = $elem;
      }
    });
    return { $min, $max };
  }

  // переместить крайний элемент
  _moveExtremeElement(direction) {
    const $elements = this._getExtremeElementsByOrder();
    const count = this._$sliderItem.length;
    const minOrder = +$elements.$min.dataset.order;
    const maxOrder = +$elements.$max.dataset.order;
    let translate = +$elements.$min.dataset.translate;
    let maxOr2 = -2;
    if (direction === 'next') {
      maxOr2 = -1;
    }
    if (minOrder < maxOr2) {
      //this._transform += this._transformStep;
      $elements.$min.dataset.order = minOrder + count;
      translate += count * 100;
      $elements.$min.dataset.translate = translate;
      $elements.$min.style.transform = `translateX(${translate}%)`;
    }
    let maxOr1 = this._$sliderItem.length - 2;
    if (direction === 'prev') {
      maxOr1 = this._$sliderItem.length - 3;
    }
    if (maxOrder > maxOr1) {
      let translateMax = +$elements.$max.dataset.translate;
      $elements.$max.dataset.order = minOrder - 1;
      translateMax -= count * 100;
      $elements.$max.dataset.translate = translateMax;
      $elements.$max.style.transform = `translateX(${translateMax}%)`;
    }
  }

  /* _getIndex() {
    const extreme = { min: 0, max: 0 };
    this._items.forEach((item, index) => {
      if (item.position < this._items[extreme.min].position) {
        extreme.min = index;
      }
      if (item.position > this._items[extreme.max].position) {
        extreme.max = index;
      }
    });
    return extreme;
  }

  _getElementByPosition(position) {
    let element;
    this._items.forEach(item => {
      if (item.position === position) {
        element = item.element;
      }
    });
    return element;
  }*/

  _updateIndicators() {
    this._$sliderItem.forEach(($element, index) => {
      if ($element.classList.contains('in-view')) {
        this._$indicators[index].classList.add('active');
      } else {
        this._$indicators[index].classList.remove('active');
      }
    });
  }

  _itemsOnBothSides() {
    const items = this._items;
    const $inView = this._$sliderItems.querySelectorAll('.slider__item.in-view');
    const positionMax = this._positionMin + this._itemsOnScreen - 1;
    const itemMax = items[this._getIndex().max];
    const itemMin = items[this._getIndex().min];
    // удаление у items класса in-view
    $inView.forEach(element => {
      element.classList.remove('in-view');
    });
    // добавление класса in-view к отображаемым items
    for (let i = this._positionMin; i < this._positionMin + this._itemsOnScreen; i++) {
      this._getElementByPosition(i).classList.add('in-view');
    }
    this._updateIndicators();
    if (this._positionMin === itemMin.position) {
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
  _move(direction) {
    if (!hasElementInVew(this._$elem) || this._hasTransition) {
      return;
    }
    this._hasTransition = true;
    const that = this;

    this._animate({
      start() {
        that._moveExtremeElement(direction);
        if (direction === 'next') {
          that._$sliderItem.forEach($element => {
            $element.dataset.order = +$element.dataset.order - 1;
          });
        } else {
          that._$sliderItem.forEach($element => {
            $element.dataset.order = +$element.dataset.order + 1;
          });
        }
      },
      timing(timeFraction) {
        return timeFraction;
      },
      draw(progress) {
        const pr1 = progress * that._transformStep;
        const value = direction === 'next' ? that._transform - pr1 : that._transform + pr1;
        that._$sliderItems.style.transform = `translateX(${value}%)`;
      },
      end() {
        that._transform =
          direction === 'next'
            ? that._transform - that._transformStep
            : that._transform + that._transformStep;
        that._hasTransition = false;
        if (that._queue.length > 0) {
          const direct = that._queue[0];
          that._queue.shift();
          that._move(direct);
        }
      },
    });

    /*this._$sliderItem.forEach(element => {
      const order = direction === 'next' ? +element.style.order - 1 : +element.style.order + 1;
      element.style.order = order;
    });
    const transformStep = direction === 'next' ? -this._transformStep : this._transformStep;
    this._transform += transformStep;
    if (forced) {
      this._$sliderItems.classList.add('slider__items_transition2');
    } else {
      this._$sliderItems.classList.add('slider__items_transition2');
    }
    this._$sliderItems.style.transform = `translateX(${this._transform}%)`;
    //});*/

    /*if (direction === 'next') {
      const positionMax = this._positionMin + this._itemsOnScreen - 1;
      if (this._config.infinite === false) {
        if (positionMax >= itemMax.position) {
          return;
        }
        if (positionMax >= itemMax.position - 1) {
          this._$controls.next.classList.add('slider__control_hide');
        } else {
          this._$controls.prev.classList.remove('slider__control_hide');
        }
        this._positionMin++;
        this._transform -= this._transformStep;
      } else {
        this._positionMin++;
        const positionMax = this._positionMin + this._itemsOnScreen - 1;
        if (positionMax > itemMax.position) {
          itemMin.position = itemMax.position + 1;
          itemMin.transform += items.length * 100;
          itemMin.element.style.transform = `translateX(${itemMin.transform}%)`;
        }
        this._itemsOnBothSides();
        this._transform -= this._transformStep;
      }
    } else {
      if (this._config.infinite === false) {
        if (this._positionMin <= itemMin.position) {
          return;
        }
        if (this._positionMin <= itemMin.position + 1) {
          this._$controls.prev.classList.add('slider__control_hide');
        } else {
          this._$controls.next.classList.remove('slider__control_hide');
        }
        this._positionMin--;
        this._transform += this._transformStep;
      } else {
        this._positionMin--;
        if (this._positionMin < itemMin.position) {
          itemMax.position = itemMin.position - 1;
          itemMax.transform -= items.length * 100;
          itemMax.element.style.transform = `translateX(${itemMax.transform}%)`;
        }
        this._itemsOnBothSides();
        this._transform += this._transformStep;
      }
    }
    this._$sliderItems.style.transform = `translateX(${this._transform}%)`;
    */
  }

  // обработчик click для слайдера
  _eventHandler(e) {
    const target = e.target;
    this._autoplay('off');
    if (target.classList.contains('slider__control')) {
      // при клике на кнопки влево и вправо
      e.preventDefault();
      if (this._hasTransition) {
        this._duration = this._durationDefault / this._acceleration;
        this._queue.push(target.dataset.slide);
      } else {
        this._duration = this._durationDefault;
        this._move(target.dataset.slide);
      }
    } else if (target.dataset.slideTo) {
      // при клике на индикаторы
      const index = +target.dataset.slideTo;
      this._moveTo(index);
    }
    this._autoplay();
    console.log(this._queue);
  }

  _moveTo(index) {
    let minIndex = this._$indicators.length - 1;
    this._$indicators.forEach(element => {
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
      this._move(direction, true);
    }
  }

  _reset() {
    const itemWidth = parseFloat(getComputedStyle(this._$sliderItem[0]).width);
    const itemsWidth = parseFloat(getComputedStyle(this._$sliderItems).width);
    const itemsDisplayed = Math.round(itemsWidth / itemWidth);
    if (itemsDisplayed === this._itemsOnScreen) {
      return;
    }
    this._autoplay('off');
    this._positionMin = 0;
    this._transform = 0;
    this._itemWidth = itemWidth;
    this._itemsWidth = itemsWidth;
    this._itemsOnScreen = itemsDisplayed;
    this._transformStep = 100 / itemsDisplayed;
    this._$sliderItems.classList.add('slider__items_off');
    this._$sliderItems.style = '';
    this._$sliderItem.forEach($elem => {
      $elem.style = '';
    });
    window.setTimeout(() => {
      this._$sliderItems.classList.remove('slider__items_off');
      this._items = [];
      this._$sliderItem.forEach((element, position) => {
        this._items.push({ element, position, transform: 0 });
      });
      this._itemsOnBothSides();
      this._autoplay();
    }, 200);
  }

  // подключения обработчиков событий для слайдера
  _addEventListener() {
    this._$elem.addEventListener('click', this._eventHandler.bind(this));
    if (this._config.autoplay === true) {
      this._$elem.addEventListener('mouseenter', () => {
        this._autoplay('off');
      });
      this._$elem.addEventListener('mouseleave', () => {
        this._autoplay();
      });
    }
    window.addEventListener('resize', this._reset.bind(this));
  }

  _autoplay(action) {
    if (this._config.autoplay !== true) {
      return;
    }
    if (action === 'off') {
      clearInterval(this._intervalId);
      this._intervalId = null;
      return;
    }
    if (this._intervalId === null) {
      this._intervalId = setInterval(() => {
        this._move('next');
      }, this._config.autoplaySpeed);
    }
  }

  // первичная настройка слайдера
  _init($elem, config) {
    const $items = $elem.querySelectorAll('.slider__item');
    this._$elem = $elem;
    this._$sliderItems = $elem.querySelector('.slider__items');
    this._$sliderItem = $items;
    this._$controls = {
      prev: $elem.querySelector('.slider__control[data-slide="prev"]'),
      next: $elem.querySelector('.slider__control[data-slide="next"]'),
    };
    this._$indicators = $elem.querySelectorAll('.slider__indicators>li');
    this._config = config;
    this._itemWidth = parseFloat(getComputedStyle($items[0]).width);
    this._itemsWidth = parseFloat(getComputedStyle(this._$sliderItems).width);
    this._itemsOnScreen = Math.round(this._itemsWidth / this._itemWidth);
    this._transformStep = 100 / this._itemsOnScreen;

    if (!this._moveByOne) {
      //this._transformStep = 100;
    }

    $items.forEach((element, position) => {
      element.dataset.order = position;
      element.dataset.translate = 0;
      this._items.push({ element, position, transform: 0 });
    });
    //this._itemsOnBothSides();
    $items[$items.length - 1].dataset.order = -1;
    $items[$items.length - 1].dataset.translate = -$items.length * 100;
    $items[$items.length - 1].style.transform = `translateX(${
      $items[$items.length - 1].dataset.translate
    }%)`;

    //
    if (this._config.infinite === false) {
      this._$controls.prev.classList.add('slider__control_hide');
    }
    //this._autoplay();
  }

  // public
  next() {
    this._move('next');
    this._move('next');
    this._move('next');
    this._move('next');
    this._move('next');
    this._move('next');
    this._move('next');
    this._move('next');
    this._move('next');
    this._move('next');
    this._move('next');
    this._move('next');
  }
  prev() {
    this._move('prev', true);
  }
}

/*document.querySelectorAll('[data-slider="sliderbyitchief"]').forEach($element => {
  const dataset = $element.dataset;
  const infinite = dataset.infinite === 'true' ? true : false;
  const autoplay = dataset.autoplay === 'true' ? true : false;
  let autoplaySpeed = dataset.autoplayspeed ? parseInt(dataset.autoplayspeed) : 5000;
  new SliderByItchief($element, {
    infinite: infinite,
    autoplay: autoplay,
    autoplaySpeed: autoplaySpeed,
  });
});*/

const $slider = document.querySelector('[data-slider="sliderbyitchief"]');
const slider = new SliderByItchief($slider, {
  /*infinite: infinite,
  autoplay: autoplay,
  autoplaySpeed: autoplaySpeed,*/
});
