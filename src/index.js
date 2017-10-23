/**
 * blear.ui.draggable-list
 * @author ydr.me
 * @create 2016年06月04日14:09:36
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
var layout = require('blear.core.layout');

var namespace = 'blearui-draggableList';
var itemHeight = 34;
var defaults = {
    el: 'body',
    // {text: "", value: "", visible: true}
    list: [],
    size: 7
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

    // setActive: function (index) {
    //
    // },

    /**
     * 获取当前激活的项目
     * @returns {{index: *, value: *, text: *, visible: boolean}}
     */
    getActive: function () {
        var the = this;
        return wrapItem(the[_data].list, the[_activeIndex]);
    },

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
var proto = DraggableList.prototype;

/**
 * 初始化数据
 */
proto[_initData] = function () {
    var the = this;
    var options = the[_options];
    var list = array.map(options.list, function (item, index) {
        if (!typeis.Object(item)) {
            item = {
                value: item,
                text: item
            };
        }

        if (!typeis.Boolean(item.visible)) {
            item.visible = true;
        }

        return item;
    });

    the[_activeIndex] = options.active;
    the[_translateY] = 0;
    the[_data] = {list: list};
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
    the[_translateY] = the[_maxTranslateY] - itemHeight * the[_activeIndex];
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
        containerEl: document.body,
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
        startY = the[_translateY];
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
    var activeIndex = Math.round(deltaY / itemHeight);
    translateY = -activeIndex * itemHeight + the[_maxTranslateY];
    the[_setTranslateY](the[_translateY] = translateY);

    if (the[_activeIndex] === activeIndex) {
        return;
    }

    the.emit('change', wrapItem(the[_data].list, the[_activeIndex] = activeIndex));
};

require('./style.css', 'css|style');
DraggableList.defaults = defaults;
module.exports = DraggableList;


/**
 * 包裹
 * @param list
 * @param index
 * @returns {{index: *, value: *, text: *, visible: boolean}}
 */
function wrapItem(list, index) {
    var foundItem = null;
    var foundIndex = -1;

    array.each(list, function (_, item) {
        if (item.visible) {
            foundIndex++;
        }

        if (foundIndex === index) {
            foundItem = item;
            return false;
        }
    });

    return {
        index: index,
        value: foundItem.value,
        text: foundItem.text,
        visible: foundItem.visible
    };
}
