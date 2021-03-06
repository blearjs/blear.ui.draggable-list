/**
 * blear.ui.draggable-list
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 * @update 2018年05月04日11:03:23
 */

'use strict';

var Draggable = require('blear.classes.draggable');
var UI = require('blear.ui');
var object = require('blear.utils.object');
var array = require('blear.utils.array');
var typeis = require('blear.utils.typeis');
var MVVM = require('blear.classes.mvvm');
var selector = require('blear.core.selector');
var attribute = require('blear.core.attribute');
var transform = require('blear.core.transform');

var namespace = 'blearui-draggableList';
var itemHeight = 34;
var defaults = {
    el: 'body',
    // {text: "", value: "", visible: true}
    list: [],
    size: 7,
    active: 0
};
var DraggableList = UI.extend({
    constructor: function (options) {
        var the = this;
        the[_options] = object.assign({}, defaults, options);
        the[_initData]();
        the[_calBoundary]();
        the[_initNode]();
        the[_initMVVM]();
        the[_initEvent]();
        DraggableList.parent(the);
    },

    /**
     * 设置可见性
     * @param index
     * @param visible
     * @returns {DraggableList}
     */
    setVisible: function (index, visible) {
        var the = this;

        the[_data].list[index].visible = visible;
        the[_calBoundary]();
        the[_fixTranslateY]();
        return the;
    },

    /**
     * 设置激活
     * @param index
     * @returns {DraggableList}
     */
    setActive: function (index) {
        var the = this;
        the[_activeIndex] = index;
        the[_calTranslateY]();
        the[_setTranslateY](the[_translateY]);
        the[_emitActiveByActiveIndex](index);
        return the;
    },

    /**
     * 获取当前激活的项目
     * @returns {{index: *, value: *, text: *, visible: boolean}}
     */
    getActive: function () {
        var the = this;
        return object.assign({}, the[_data].list[the[_activeIndex]]);
    },

    /**
     * 手动设置 list
     * @param list
     * @param [active=0]
     * @returns {DraggableList}
     */
    setList: function (list, active) {
        var the = this;
        the[_activeIndex] = active || 0;
        the[_data].list = mapList(list);
        the[_calBoundary]();
        the[_setTranslateY](the[_translateY]);
        the[_emitActiveByActiveIndex](the[_activeIndex]);
        return the;
    },

    /**
     * 销毁实例
     */
    destroy: function () {
        DraggableList.invoke('destroy', this);
    }
});
var sole = DraggableList.sole;
var _options = sole();
var _containerEl = sole();
var _contentEl = sole();
var _listEl = sole();
var _maskEl = sole();
var _activeEl = sole();
var _data = sole();
var _mvvm = sole();
var _draggable = sole();
var _initData = sole();
var _calBoundary = sole();
var _initNode = sole();
var _initMVVM = sole();
var _initEvent = sole();
var _translateY = sole();
var _sizeHeight = sole();
var _minTranslateY = sole();
var _maxTranslateY = sole();
var _setTranslateY = sole();
var _fixTranslateY = sole();
var _activeIndex = sole();
var _calTranslateY = sole();
var _emitActiveByDisplayIndex = sole();
var _emitActiveByActiveIndex = sole();
var proto = DraggableList.prototype;

/**
 * 初始化数据
 */
proto[_initData] = function () {
    var the = this;
    var options = the[_options];

    the[_activeIndex] = options.active;
    the[_translateY] = 0;
    the[_data] = {
        list: mapList(options.list)
    };
};

/**
 * 计算边界
 */
proto[_calBoundary] = function () {
    var the = this;
    var options = the[_options];
    var listLength = 0;
    var sizeHeight = the[_sizeHeight] = itemHeight * options.size;

    the[_maxTranslateY] = (sizeHeight - itemHeight) / 2;
    array.each(the[_data].list, function (index, item) {
        if (item.visible) {
            listLength++;
        }
    });
    the[_minTranslateY] = itemHeight + the[_maxTranslateY] - itemHeight * listLength;
    the[_calTranslateY]();
};

/**
 * 初始化节点
 */
proto[_initNode] = function () {
    var the = this;
    var options = the[_options];
    var queryEl = function (className) {
        return selector.query('.' + namespace + '-' + className, the[_containerEl])[0];
    };

    the[_containerEl] = selector.query(options.el)[0];
    the[_containerEl].innerHTML = require('./template.html');
    the[_contentEl] = selector.children(the[_containerEl])[0];
    the[_listEl] = queryEl('list');
    the[_maskEl] = queryEl('mask');
    the[_activeEl] = queryEl('active');
    attribute.style(the[_contentEl], 'height', the[_sizeHeight]);
    attribute.style(the[_maskEl], 'background-size', '100% ' + the[_maxTranslateY] + 'px');
    attribute.style(the[_activeEl], 'top', the[_maxTranslateY] + 'px');
    the[_setTranslateY](the[_translateY]);
};

/**
 * 初始化 MVVM
 */
proto[_initMVVM] = function () {
    var the = this;
    var options = the[_options];

    the[_mvvm] = new MVVM({
        el: the[_containerEl],
        data: the[_data]
    });
};

/**
 * 初始化事件
 */
proto[_initEvent] = function () {
    var the = this;
    var options = the[_options];
    var startY;

    the[_draggable] = new Draggable({
        axis: 'y',
        containerEl: the[_containerEl],
        effectedSelector: the[_containerEl],
        handleSelector: the[_containerEl],
        shadow: false,
        draggable: false
    }).on('dragStart', function (meta) {
        startY = the[_translateY];
        // console.log('dragStart', meta);
    }).on('dragMove', function (meta) {
        the[_setTranslateY](startY + meta.deltaY);
        // console.log('dragMove', meta);
    }).on('dragEnd', function (meta) {
        // console.log('dragEnd', meta);
        the[_translateY] += meta.deltaY;
        the[_fixTranslateY]();
    });
};

/**
 * 设置偏移
 * @param y
 */
proto[_setTranslateY] = function (y) {
    var the = this;
    var options = the[_options];

    attribute.style(the[_listEl], 'transform', {
        translateY: y
    });
};

/**
 * 修正偏移
 */
proto[_fixTranslateY] = function () {
    var the = this;
    var options = the[_options];
    var translateY = the[_translateY];

    translateY = Math.max(translateY, the[_minTranslateY]);
    translateY = Math.min(translateY, the[_maxTranslateY]);
    var deltaY = the[_maxTranslateY] - translateY;
    var displayIndex = Math.round(deltaY / itemHeight);
    translateY = -displayIndex * itemHeight + the[_maxTranslateY];
    var distance = Math.abs(the[_translateY] - translateY);
    // the[_setTranslateY](the[_translateY] = translateY);
    transform.transit(the[_listEl], {
        transform: {
            translateY: the[_translateY] = translateY
        }
    }, {
        easing: 'out',
        duration: Math.min(distance, 300)
    });
    the[_emitActiveByDisplayIndex](displayIndex);
};

/**
 * 计算偏移
 */
proto[_calTranslateY] = function () {
    var the = this;
    var options = the[_options];
    var list = the[_data].list;
    var visibleIndex = -1;

    array.each(list, function (index, item) {
        if (item.visible) {
            visibleIndex++;
        }

        if (the[_activeIndex] === index) {
            return false;
        }
    });

    the[_translateY] = the[_maxTranslateY] - itemHeight * visibleIndex;
};

/**
 * 发送激活事件
 * @param displayIndex
 */
proto[_emitActiveByDisplayIndex] = function (displayIndex) {
    var the = this;
    var options = the[_options];
    var foundItem = null;
    var visibleIndex = -1;
    var list = the[_data].list;

    array.each(list, function (_, item) {
        if (item.visible) {
            visibleIndex++;
        }

        if (visibleIndex === displayIndex) {
            foundItem = item;
            return false;
        }
    });

    var activeIndex = foundItem.index;

    if (the[_activeIndex] === activeIndex) {
        return;
    }

    the[_emitActiveByActiveIndex](activeIndex);
};

/**
 * 发送激活事件
 */
proto[_emitActiveByActiveIndex] = function (activeIndex) {
    var the = this;

    the[_activeIndex] = activeIndex;
    the.emit('change', object.assign({}, the[_data].list[activeIndex]));
};

require('./style.css', 'css|style');
DraggableList.defaults = defaults;
module.exports = DraggableList;

// ================================================

/**
 * 包装 list
 * @param list
 * @returns {Array}
 */
function mapList(list) {
    return array.map(list, function (item, index) {
        if (!typeis.Object(item)) {
            item = {
                value: item,
                text: item
            };
        }

        if (!typeis.Boolean(item.visible)) {
            item.visible = true;
        }

        item.index = index;
        return item;
    });
}