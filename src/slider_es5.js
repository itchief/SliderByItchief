'use strict';

var self = this || {};
try {
  self.WeakSet = WeakSet;
} catch (t) {
  !(function (e) {
    var s = new e(),
      t = n.prototype;
    function n(t) {
      'use strict';
      s.set(this, new e()), t && t.forEach(this.add, this);
    }
    (t.add = function (t) {
      return s.get(this).set(t, 1), this;
    }),
      (t.delete = function (t) {
        return s.get(this).delete(t);
      }),
      (t.has = function (t) {
        return s.get(this).has(t);
      }),
      (self.WeakSet = n);
  })(WeakMap);
}

if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

function _instanceof(left, right) {
  if (
    right != null &&
    typeof Symbol !== 'undefined' &&
    right[Symbol.hasInstance]
  ) {
    return !!right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
}

function _classCallCheck(instance, Constructor) {
  if (!_instanceof(instance, Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ('value' in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = privateMap.get(receiver);
  if (!descriptor) {
    throw new TypeError('attempted to set private field on non-instance');
  }
  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError('attempted to set read only private field');
    }
    descriptor.value = value;
  }
  return value;
}

function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = privateMap.get(receiver);
  if (!descriptor) {
    throw new TypeError('attempted to get private field on non-instance');
  }
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }
  return descriptor.value;
}

function _classPrivateMethodGet(receiver, privateSet, fn) {
  if (!privateSet.has(receiver)) {
    throw new TypeError('attempted to get private field on non-instance');
  }
  return fn;
}

var isTouchDevice = function isTouchDevice() {
  return !!('ontouchstart' in window || navigator.maxTouchPoints);
};

var _positionMin = new WeakMap();

var _items = new WeakMap();

var _itemsWidth = new WeakMap();

var _itemsDisplayed = new WeakMap();

var _itemWidth = new WeakMap();

var _transform = new WeakMap();

var _transformStep = new WeakMap();

var _config = new WeakMap();

var _$elem = new WeakMap();

var _$items = new WeakMap();

var _$controls = new WeakMap();

var _getIndex = new WeakSet();

var _move = new WeakSet();

var _eventHandler = new WeakSet();

var _addEventListener = new WeakSet();

var _init = new WeakSet();

var SliderByItchief = /*#__PURE__*/ (function () {
  // позиция активного элемента (минимальная)
  // массив items
  // ширина всех items
  // количество одновременно отображаемых items
  // ширина одного item
  // текущее значение трансформации
  // значение шага трансформации
  // конфигурация слайдера
  // базовый элемент слайдера
  // элемент, в котором находятся items
  // элементы управления слайдером
  function SliderByItchief(_$elem2, _config2) {
    _classCallCheck(this, SliderByItchief);

    _init.add(this);

    _addEventListener.add(this);

    _eventHandler.add(this);

    _move.add(this);

    _getIndex.add(this);

    _positionMin.set(this, {
      writable: true,
      value: 0,
    });

    _items.set(this, {
      writable: true,
      value: [],
    });

    _itemsWidth.set(this, {
      writable: true,
      value: 0,
    });

    _itemsDisplayed.set(this, {
      writable: true,
      value: 0,
    });

    _itemWidth.set(this, {
      writable: true,
      value: 0,
    });

    _transform.set(this, {
      writable: true,
      value: 0,
    });

    _transformStep.set(this, {
      writable: true,
      value: 0,
    });

    _config.set(this, {
      writable: true,
      value: {},
    });

    _$elem.set(this, {
      writable: true,
      value: void 0,
    });

    _$items.set(this, {
      writable: true,
      value: void 0,
    });

    _$controls.set(this, {
      writable: true,
      value: void 0,
    });

    _classPrivateMethodGet(this, _init, _init2).call(this, _$elem2, _config2);

    _classPrivateMethodGet(this, _addEventListener, _addEventListener2).call(
      this
    );
  }

  _createClass(SliderByItchief, [
    {
      key: 'next',
      // public
      value: function next() {
        _classPrivateMethodGet(this, _move, _move2).call(this, 'next');
      },
    },
    {
      key: 'prev',
      value: function prev() {
        _classPrivateMethodGet(this, _move, _move2).call(this, 'prev');
      },
    },
  ]);

  return SliderByItchief;
})();

var _getIndex2 = function _getIndex2() {
  var _this = this;

  var extreme = {
    min: 0,
    max: 0,
  };

  _classPrivateFieldGet(this, _items).forEach(function (item, index) {
    if (
      item.position < _classPrivateFieldGet(_this, _items)[extreme.min].position
    ) {
      extreme.min = index;
    }

    if (
      item.position > _classPrivateFieldGet(_this, _items)[extreme.max].position
    ) {
      extreme.max = index;
    }
  });

  return extreme;
};

var _move2 = function _move2(direction) {
  var items = _classPrivateFieldGet(this, _items);

  var itemMin =
    items[_classPrivateMethodGet(this, _getIndex, _getIndex2).call(this).min];

  var itemMax =
    items[_classPrivateMethodGet(this, _getIndex, _getIndex2).call(this).max];

  if (direction === 'next') {
    var positionMax =
      _classPrivateFieldGet(this, _positionMin) +
      _classPrivateFieldGet(this, _itemsDisplayed) -
      1;

    if (_classPrivateFieldGet(this, _config).isLooped === false) {
      var _this$positionMin;

      if (positionMax >= itemMax.position) {
        return;
      }

      if (positionMax >= itemMax.position - 1) {
        _classPrivateFieldGet(this, _$controls).next.classList.add(
          'slider__control_hide'
        );
      } else {
        _classPrivateFieldGet(this, _$controls).prev.classList.remove(
          'slider__control_hide'
        );
      }

      _classPrivateFieldSet(
        this,
        _positionMin,
        (_this$positionMin = +_classPrivateFieldGet(this, _positionMin)) + 1
      ),
        _this$positionMin;

      _classPrivateFieldSet(
        this,
        _transform,
        _classPrivateFieldGet(this, _transform) -
          _classPrivateFieldGet(this, _transformStep)
      );
    } else {
      var _this$positionMin2;

      _classPrivateFieldSet(
        this,
        _positionMin,
        (_this$positionMin2 = +_classPrivateFieldGet(this, _positionMin)) + 1
      ),
        _this$positionMin2;

      var _positionMax =
        _classPrivateFieldGet(this, _positionMin) +
        _classPrivateFieldGet(this, _itemsDisplayed) -
        1;

      if (_positionMax > itemMax.position) {
        itemMin.position = itemMax.position + 1;
        itemMin.transform += items.length * 100;
        itemMin.element.style.transform = 'translateX('.concat(
          itemMin.transform,
          '%)'
        );
      }

      _classPrivateFieldSet(
        this,
        _transform,
        _classPrivateFieldGet(this, _transform) -
          _classPrivateFieldGet(this, _transformStep)
      );
    }
  } else {
    if (_classPrivateFieldGet(this, _config).isLooped === false) {
      var _this$positionMin3;

      if (_classPrivateFieldGet(this, _positionMin) <= itemMin.position) {
        return;
      }

      if (_classPrivateFieldGet(this, _positionMin) <= itemMin.position + 1) {
        _classPrivateFieldGet(this, _$controls).prev.classList.add(
          'slider__control_hide'
        );
      } else {
        _classPrivateFieldGet(this, _$controls).next.classList.remove(
          'slider__control_hide'
        );
      }

      _classPrivateFieldSet(
        this,
        _positionMin,
        (_this$positionMin3 = +_classPrivateFieldGet(this, _positionMin)) - 1
      ),
        _this$positionMin3;

      _classPrivateFieldSet(
        this,
        _transform,
        _classPrivateFieldGet(this, _transform) +
          _classPrivateFieldGet(this, _transformStep)
      );
    } else {
      var _this$positionMin4;

      _classPrivateFieldSet(
        this,
        _positionMin,
        (_this$positionMin4 = +_classPrivateFieldGet(this, _positionMin)) - 1
      ),
        _this$positionMin4;

      if (_classPrivateFieldGet(this, _positionMin) < itemMin.position) {
        itemMax.position = itemMin.position - 1;
        itemMax.transform -= items.length * 100;
        itemMax.element.style.transform = 'translateX('.concat(
          itemMax.transform,
          '%)'
        );
      }

      _classPrivateFieldSet(
        this,
        _transform,
        _classPrivateFieldGet(this, _transform) +
          _classPrivateFieldGet(this, _transformStep)
      );
    }
  }

  _classPrivateFieldGet(this, _$items).style.transform = 'translateX('.concat(
    _classPrivateFieldGet(this, _transform),
    '%)'
  );
};

var _eventHandler2 = function _eventHandler2(e) {
  var target = e.target;

  if (target.classList.contains('slider__control')) {
    e.preventDefault();

    _classPrivateMethodGet(this, _move, _move2).call(
      this,
      target.dataset.slide
    );
  }
};

var _addEventListener2 = function _addEventListener2() {
  _classPrivateFieldGet(this, _$elem).addEventListener(
    'click',
    _classPrivateMethodGet(this, _eventHandler, _eventHandler2).bind(this)
  );
};

var _init2 = function _init2($elem, config) {
  var _this2 = this;

  var $items = $elem.querySelectorAll('.slider__item');

  _classPrivateFieldSet(this, _$elem, $elem);

  _classPrivateFieldSet(this, _config, config);

  _classPrivateFieldSet(this, _$items, $elem.querySelector('.slider__items'));

  _classPrivateFieldSet(this, _$controls, {
    prev: $elem.querySelector('.slider__control[data-slide="prev"]'),
    next: $elem.querySelector('.slider__control[data-slide="next"]'),
  });

  _classPrivateFieldSet(
    this,
    _itemWidth,
    parseFloat(getComputedStyle($items[0]).width)
  );

  _classPrivateFieldSet(
    this,
    _itemsWidth,
    parseFloat(getComputedStyle(_classPrivateFieldGet(this, _$items)).width)
  );

  _classPrivateFieldSet(
    this,
    _itemsDisplayed,
    Math.round(
      _classPrivateFieldGet(this, _itemsWidth) /
        _classPrivateFieldGet(this, _itemWidth)
    )
  );

  _classPrivateFieldSet(
    this,
    _transformStep,
    100 / _classPrivateFieldGet(this, _itemsDisplayed)
  );

  $items.forEach(function (element, position) {
    return _classPrivateFieldGet(_this2, _items).push({
      element: element,
      position: position,
      transform: 0,
    });
  });

  if (_classPrivateFieldGet(this, _config).isLooped === false) {
    _classPrivateFieldGet(this, _$controls).prev.classList.add(
      'slider__control_hide'
    );
  }
};
