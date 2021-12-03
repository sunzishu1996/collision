'use strict';

/**
 * 自定义二维向量的类，为了记录向量与坐标点
 */
class Vec {
    x = 0;
    y = 0;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
//获取dom中的各节点与生成canvas画布绘制多边形
const canvasBox = document.getElementsByClassName('canvasBox')[0];
const myCanvas = document.createElement('canvas');
const cc = myCanvas.getContext('2d');
const poly1Text = document.getElementById('poly1Text');
const poly2Text = document.getElementById('poly2Text');
const outputText = document.getElementById('outputText');
//为从文本框中筛选出坐标点的正则
const dotReg = /\-?\d+,\-?\d+/g;
//分别存储两个多边形坐标点的数组
let dot1Arr, dot2Arr;

//将生成的canvas放置在dom中
(function () {
    myCanvas.width = 800;
    myCanvas.height = 600;
    myCanvas.style.backgroundColor = 'gray';
    canvasBox.appendChild(myCanvas);
})();

/**
 * 当单击“计算”按钮后，先从文本框中筛选坐标点，其次进行多边形是否为凹多边形的判断，最后显示是否发生碰撞
 */
function calc() {
    const str1 = poly1Text.value;
    const str2 = poly2Text.value;
    const dot1StrArr = str1.match(dotReg);
    const dot2StrArr = str2.match(dotReg);
    if (!dot1StrArr) {
        alert('多边形1中存在语法问题，无法检测出点');
        return;
    }
    if (!dot2StrArr) {
        alert('多边形2中存在语法问题，无法检测出点');
        return;
    }
    if (dot1StrArr.length < 3) {
        alert('多边形1未能构成多边形，请至少保证有3个点');
        return;
    }
    if (dot2StrArr.length < 3) {
        alert('多边形2未能构成多边形，请至少保证有3个点');
        return;
    }
    //将文本框中筛选出的坐标点转换成可用于计算的数据并存储
    dot1Arr = [];
    dot2Arr = [];
    for (let i in dot1StrArr) {
        const tempDotArr = dot1StrArr[i].split(',');
        dot1Arr.push(new Vec(parseInt(tempDotArr[0]), parseInt(tempDotArr[1])));
    }
    for (let i in dot2StrArr) {
        const tempDotArr = dot2StrArr[i].split(',');
        dot2Arr.push(new Vec(parseInt(tempDotArr[0]), parseInt(tempDotArr[1])));
    }
    draw();//调用自定义绘制函数将两个多边形绘制出来
    outputText.innerHTML = '---';
    //调用自定义凹多边形判断函数判断是否为凹多边形
    if (!isValidPoly(dot1Arr)) {
        alert('多边形1是凹多边形，无法进行检测');
        return;
    }
    if (!isValidPoly(dot2Arr)) {
        alert('多边形2是凹多边形，无法进行检测');
        return;
    }
    outputText.innerHTML = '检测结果：' + (collision() ? '已' : '未') + '碰撞';
}

/**
 * 检测两个多边形是否发生碰撞
 * @returns {boolean} 两个多边形是否发生碰撞
 */
function collision() {
    const normal = new Vec(1, 0);
    for (let i = 0; i < dot1Arr.length; ++i) {
        const curDot = dot1Arr[i];
        const nextDot = dot1Arr[(i + 1) % dot1Arr.length];
        normal.y = -(nextDot.x - curDot.x) / (nextDot.y - curDot.y);
        if (!isProjectIntersect(normal)) return false;
    }
    for (let i = 0; i < dot2Arr.length; ++i) {
        const curDot = dot2Arr[i];
        const nextDot = dot2Arr[(i + 1) % dot2Arr.length];
        normal.y = -(nextDot.x - curDot.x) / (nextDot.y - curDot.y);
        if (!isProjectIntersect(normal)) return false;
    }
    return true;
}

/**
 * 检测两个多边形各点在指定法线向量上的投影是否相交
 * @param {Vec} normal 指定法线向量
 * @returns {boolean} 是否相交
 */
function isProjectIntersect(normal) {
    let p1Min = 0, p1Max = 0;
    for (let j = 0; j < dot1Arr.length; ++j) {
        const dot = dot1Arr[j];
        const projection = (normal.x * dot.x + normal.y * dot.y) / Math.hypot(normal.x, normal.y);
        if (!j) p1Min = p1Max = projection;
        else {
            if (projection < p1Min) p1Min = projection;
            if (projection > p1Max) p1Max = projection;
        }
    }
    let p2Min = 0, p2Max = 0;
    for (let j = 0; j < dot2Arr.length; ++j) {
        const dot = dot2Arr[j];
        const projection = (normal.x * dot.x + normal.y * dot.y) / Math.hypot(normal.x, normal.y);
        if (!j) p2Min = p2Max = projection;
        else {
            if (projection < p2Min) p2Min = projection;
            if (projection > p2Max) p2Max = projection;
        }
    }
    return p1Max > p2Min && p2Max > p1Min;
}

/**
 * 分蓝红两色将两个多边形绘制在canvas画布上
 */
function draw() {
    cc.clearRect(0, 0, myCanvas.width, myCanvas.height);
    cc.beginPath();
    cc.strokeStyle = 'blue';
    for (let i in dot1Arr) {
        if (i == 0) cc.moveTo(dot1Arr[i].x, myCanvas.height - dot1Arr[i].y);
        else cc.lineTo(dot1Arr[i].x, myCanvas.height - dot1Arr[i].y);
    }
    cc.closePath();
    cc.stroke();
    cc.beginPath();
    cc.strokeStyle = 'red';
    for (let i in dot2Arr) {
        if (i == 0) cc.moveTo(dot2Arr[i].x, myCanvas.height - dot2Arr[i].y);
        else cc.lineTo(dot2Arr[i].x, myCanvas.height - dot2Arr[i].y);
    }
    cc.closePath();
    cc.stroke();
}

/**
 * 检测并返回一个多边形是否不为凹多边形（无法检测出复合图形）
 * @param {Vec[]} vecArr 多边形各坐标点的数组
 * @returns {boolean} 多边形是否不为凹多边形
 */
function isValidPoly(vecArr) {
    if (vecArr.length > 3) {
        const tempVecArr = [];
        vecArr.map(v => {
            tempVecArr.push(new Vec(v.x, v.y));
        });
        let innerDotCount = vecArr.length;
        for (let i = 0; i < vecArr.length; ++i) {
            let prevPos = 0;
            const dot = tempVecArr.splice(i, 1)[0];
            for (let j = 0; j < tempVecArr.length; ++j) {
                const pos = dotVectorPos(dot, tempVecArr[j], tempVecArr[(j + 1) % tempVecArr.length]);
                if (prevPos && (pos !== prevPos || pos === 0)) {
                    --innerDotCount;
                    break;
                }
                prevPos = pos;
            }
            tempVecArr.splice(i, 0, dot);
        }
        return !innerDotCount;
    }
    return true;
}

/**
 * 检测并返回一个坐标点在一个向量的位置
 * @param {Vec} dot0 被检测的坐标点
 * @param {Vec} dot1 向量的开始位置坐标
 * @param {Vec} dot2 向量的结束位置坐标
 * @returns {number} 坐标点在向量的位置，-1为左，1为右，0为坐标点在向量上
 */
function dotVectorPos(dot0, dot1, dot2) {
    const vec = new Vec(dot2.x - dot1.x, dot2.y - dot1.y);
    const angle = Math.atan2(vec.y, vec.x) * 180 / Math.PI;
    let k = vec.y / vec.x;
    let b = (dot1.x * dot2.y - dot2.x * dot1.y) / (dot1.x - dot2.x);
    let pos = Math.sign(k * dot0.x + b - dot0.y);
    pos *= angle >= -90 && angle <= 90 ? 1 : -1;
    return pos;
}