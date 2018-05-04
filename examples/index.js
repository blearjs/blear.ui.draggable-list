/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';

var DraggableList = require('../src/index');

var dl = new DraggableList({
    el: '#demo',
    list: [
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
        // 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029
    ],
    active: 7
}).on('change', function (item) {
    console.log('change', item);
});

console.log(dl.getActive());

// 隐藏 2015、2017、2019
document.getElementById('hide').onclick = function () {
    dl.setVisible(5, false);
    dl.setVisible(7, false);
    dl.setVisible(9, false);
};

// 激活 2016
document.getElementById('active0').onclick = function () {
    dl.setActive(0);
};

// 激活 2016
document.getElementById('active6').onclick = function () {
    dl.setActive(6);
};

// setList
document.getElementById('setList').onclick = function () {
    var i = 0;
    var j = random(5, 20);
    var k = random(0, j - 1);
    var list = [];

    for(; i < j; i++) {
        list.push(Math.random());
    }

    dl.setList(list, k);
};


// ========================
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
