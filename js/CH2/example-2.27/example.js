/**
 * Created by yangyanjun on 15/5/31.
 */

var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    text = 'Spinning',
    angle = Math.PI/50,
    clockwise = true,
    fontHeight = 128,
    origin = { },
    paused = true,
    scale = 1.008;

// Functions...

function drawText() {
    context.fillText(text, 0, 0);
    context.strokeText(text, 0, 0);
}

// Event handlers...

canvas.onclick = function() {
    paused = !paused;
    if (!paused) {
        clockwise = !clockwise;
        scale = 1/scale;
    }
};

// Animation...

setInterval(function() {
    if (!paused) {
        context.clearRect(-origin.x, -origin.y,
            canvas.width, canvas.height);

        context.rotate((clockwise ? angle : -angle));
        context.scale(scale, scale);

        drawText();
    }
}, 1000/60);

// Initialization...

context.font = fontHeight + 'px Palatino';

context.fillStyle = 'cornflowerblue';
context.strokeStyle = 'yellow';

context.shadowColor = 'rgba(100, 100, 150, 0.8)';
context.shadowOffsetX = 5;
context.shadowOffsetY = 5;
context.shadowBlur = 10;

context.textAlign = 'center';
context.textBaseline = 'middle';

origin.x = canvas.width/2;
origin.y = canvas.height/2;

context.transform(1, 0, 0, 1, origin.x, origin.y);

drawText();