/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';

var DraggableList = require('../src/index');
var easing = require('blear.utils.easing');

var dl = new DraggableList({
    el: '#demo',
    list: randomList()
});


// ========================
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomList() {
    var i = 0;
    var j = random(10, 20);
    var list = [];

    for (; i < j; i++) {
        list.push(Math.random());
    }

    return list;
}
