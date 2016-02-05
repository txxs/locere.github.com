/**
 * Created by yangyanjun on 15/5/25.
 */

var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    repeatRadio = document.getElementById('repeatRadio'),
    noRepeatRadio = document.getElementById('noRepeatRadio'),
    repeatXRadio = document.getElementById('repeatXRadio'),
    repeatYRadio = document.getElementById('repeatYRadio'),
    image = new Image();

//functions...

function fillCanvasWithPattern(repeatString) {
    var pattern = context.createPattern(image, repeatString);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = pattern;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fill();
}

//event handlers...

repeatRadio.onclick = function (e) {
    fillCanvasWithPattern('repeat');
};

repeatXRadio.onclick = function (e) {
    fillCanvasWithPattern('repeat-x');
};

repeatYRadio.onclick = function (e) {
    fillCanvasWithPattern('repeat-y');
};

noRepeatRadio.onclick = function (e) {
    fillCanvasWithPattern('no-repeat');
};

//initialization...

image.src = 'http://img17.poco.cn/mypoco/myphoto/20150525/10/17800049220150525103428060.png';
image.onload = function (e) {
    fillCanvasWithPattern('repeat');
};