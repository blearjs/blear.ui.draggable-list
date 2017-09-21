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
    ]
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
