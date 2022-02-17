let canvas;

let cellSize = 20;

var started = false;
var x0 = -1;
var y0 = -1;

var th = 7;
var cap = 0;

var curves = [];
var curve;

var pg;

function setup(){
    canvas = createCanvas(displayWidth, displayHeight);
    pg = createGraphics(displayWidth, displayHeight);

    rectMode(CENTER);
    strokeCap(SQUARE);
    pg.rectMode(CENTER);
    pg.strokeCap(SQUARE);

    if(cap == 0){
        strokeCap(ROUND);
        pg.strokeCap(ROUND);
    }
    else{
        strokeCap(ROUND);
        pg.strokeCap(SQUARE);
    }
} 


function draw(){
    background(221);
    pg.clear();
    drawGrid();

    for(var k = 0; k < curves.length; k++){
        curves[k].draw();
    }

    if((mouseX/cellSize)%1.0 > .5)
        x0 = ceil(mouseX/cellSize)*cellSize - cellSize/2;
    else
        x0 = floor(mouseX/cellSize)*cellSize + cellSize/2;
    if((mouseY/cellSize)%1.0 > .5)
        y0 = ceil(mouseY/cellSize)*cellSize - cellSize/2;
    else
        y0 = floor(mouseY/cellSize)*cellSize + cellSize/2;

    if (mouseIsPressed == true && !started) {
        started = true;

        curve = new Curve(curves.length);
        curves.push(curve);

        curve.setStart(x0, y0);
    } 
    else if (mouseIsPressed == true && started) {
        noFill();
        stroke(255,0,0);
        strokeWeight(th);
        var x1 = curves[curves.length-1].sx;
        var y1 = curves[curves.length-1].sy;
        var x2 = mouseX;
        var y2 = mouseY;
        //line(x1, y1, x2, y2);

        noStroke();
        fill(255,0,0);
        var dd = dist(x1,y1,x2,y2);
        var qv = round(th*1.5);
        var ct = (dd/qv);
        var aa = atan2(y2-y1, x2-x1);
        for(var t = 0; t <= ct; t++){
            var p = t/ct;
            var xx = lerp(x1, x2, p);
            var yy = lerp(y1, y2, p);
            push();
            translate(xx, yy);
            rotate(aa);
            if(cap == 0)
                ellipse(0, 0, th, th);
            else
                rect(0, 0, th, th);
            pop();
        }
    }
    else if (mouseIsPressed == false && started){
        curve.setEnd(x0, y0);
        started = false;
    }

    image(pg, 0, 0);
}

function drawGrid(){
    noStroke();
    fill(196);
    for(var x = cellSize/2; x < width; x += cellSize){
        for(var y = cellSize/2; y < height; y += cellSize){
            ellipse(x, y, 3, 3);
        }
    }

}

function mouseWheel(event) {
  //move the square according to the vertical scroll amount
  th = max(1, th-event.delta*.05);
  //uncomment to block page scrolling
  //return false;
}

function keyTyped() {
    if (key === 't') {
        if(curves.length == 0)
            return;
        curves[curves.length-1].type = (curves[curves.length-1].type + 1)%curves[curves.length-1].numTypes;
    }
    if (key === 'x') {
        if(curves.length == 0)
            return;
        curves.pop();
    }
    if (key === 'p') {
        //cellSize = min(40, (cellSize + 1));
    }
    if (key === 'u') {
        //cellSize = max(15, (cellSize - 1));
    }
    if (key === 'q') {
        cap = (cap+1)%2;
        if(cap == 0){
            strokeCap(ROUND);
            pg.strokeCap(ROUND);
        }
        else{
            strokeCap(ROUND);
            pg.strokeCap(SQUARE);
        }
    }
    if (key === 's') {
        if(curves.length == 0)
            return;
        pg.save();
    }
}


function drawBezier(x0, y0, x1, y1, type){
    var c0x, c0y, c1x, c1y;

    var kh = 0.58;
    if(type == 1){
        c0x = x0;
        c0y = y0 + kh*(y1-y0);
        c1x = x1 + kh*(x0-x1);
        c1y = y1;
    }
    if(type == 2){
        c0x = x0 + kh*(x1-x0);
        c0y = y0;
        c1x = x1;
        c1y = y1 + kh*(y0-y1);
    }
    if(type == 3){
        c0x = x0;
        c0y = y0 + kh*(y1-y0);
        c1x = x1;
        c1y = y1 + kh*(y0-y1);
    }
    if(type == 4){
        c0x = x0 + kh*(x1-x0);
        c0y = y0;
        c1x = x1 + kh*(x0-x1);
        c1y = y1;
    }

    pg.bezier(x0, y0, c0x, c0y, c1x, c1y, x1, y1);
}

function drawArc(x0, y0, x1, y1, diagonal, type){
    if(!diagonal || type == 3 || type == 4){
        drawBezier(x0, y0, x1, y1, type);
        return;
    }
    var cx = -1;
    var cy = -1;
    var a0 = -1;
    var a1 = -1;

    cx = x1;
    cy = y0;
    a0 = atan2(y0-cy, x0-cx);
    a1 = atan2(y1-cy, x1-cx);

    if(x1>x0 && y1>y0 || x1<x0 && y1<y0){
        a0 = atan2(y1-cy, x1-cx);
        a1 = atan2(y0-cy, x0-cx);
    }

    while(a1 < a0)
        a1 += 2*PI;

    var rad = dist(x0, y0, cx, cy);
    pg.beginShape();
    for(var a = a0; a <= a1; a += 2*PI/round(rad*3)){
        var x = cx + rad * cos(a);
        var y = cy + rad * sin(a);
        pg.vertex(x, y);
    }
    pg.vertex(x, y);
    pg.vertex(x, y);
    pg.endShape();
}

class Curve {

    constructor(ind) {
        this.ind = ind;
        this.sx = -1;
        this.sy = -1;
        this.ex = -1;
        this.ey = -1;
        this.type = 0;
        this.numTypes = 5;
    }

    setStart(x, y){
        this.sx = x;
        this.sy = y;
    }

    setEnd(x, y){
        this.ex = x;
        this.ey = y;

        this.diagonal = false;
        this.numTypes = 5;
        //if(round(abs(this.ex - this.sx)) == round(abs(this.ey - this.sy))){
        //    this.diagonal = true;
        //    this.numTypes = 3;
        //}
    }

    draw(){
        pg.noFill();
        pg.stroke(19);
        pg.strokeWeight(th);

        if(this.ex == -1)
            return;

        if(this.diagonal == true){
            if(this.type == 0)
                pg.line(this.sx, this.sy, this.ex, this.ey);
            else if(this.type == 1)
                drawArc(this.sx, this.sy, this.ex, this.ey, this.diagonal, this.type);
            else if(this.type == 2)
                drawArc(this.ex, this.ey, this.sx, this.sy, this.diagonal, this.type);
        }
        else{
            if(this.type == 0)
                pg.line(this.sx, this.sy, this.ex, this.ey);
            else
                drawArc(this.sx, this.sy, this.ex, this.ey, this.diagonal, this.type);
        }

    }
}