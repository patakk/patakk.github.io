var canvas;
var grid;
var min_dist = 10;
var cell_size = min_dist*1.414;
var particles = {};
var brd = 40
var index = 0;
var lifespan = 120;

let has_gravity = false;
let has_color = false;
let prev_color = false;
let color_timer = 0.0;
var screen_sc = 1.0;

let bloom;

let particlesImage;

var scriptTxt;

var pallete_idx = 0;
var pallete = [
    'ee6055-60d394-aaf683-ffd97d-ff9b85',
    '5bc0eb-fde74c-9bc53d-e55934-fa7921',
    'c200fb-ec0868-fc2f00-ec7d10-ffbc0a',
    'f9c80e-f86624-ea3546-662e9b-43bccd',
    '471ca8-884ab2-ff930a-f24b04-d1105a',
]

let courierM;
function preload() {
    courierM = loadFont('assets/CourierM_Bold.ttf');
    scriptTxt = loadStrings('assets/sketch.txt');
}

var img_a;
var charsImgs = {};
var charsImgsFaded = {};
var noiseImgs = [];
var cursorImgs = [];
var special = "!?_.,:;/$%&#'\"+-=*@<>()[]{}";
var upper = "ABCDEFGHIJKLMNOPQRSUVWXYZ";
var lower = "abcdefghijklmnopqrstuvwxyz";
var numerical = "0123456789";
var charset = upper + lower + numerical + special;
var scriptChrIdx = 0;

function createCursorImages(){
    for(var ww = 0; ww < 10; ww++){
        cursorImg = createGraphics(15, 24);
        cursorImg.rectMode(CENTER);
        cursorImg.push();
        cursorImg.clear();
        cursorImg.noStroke();
        cursorImg.translate(cursorImg.width/2, cursorImg.height/2);
        var ngrains = random(40);
        for(var k = 0; k < 1; k++){
            var rr = random(1,2);
            cursorImg.fill(0, random(0, 77));
            cursorImg.rect(0, 0+3, 2, 13);
            cursorImg.rect(0, 0+3+13/2, 7, 2);2
            cursorImg.rect(0, 0+3-13/2, 7, 2);
            cursorImg.push();
            //cursorImg.tint(255, 122);
            //cursorImg.image(noiseImgs[round(frameCount/27.)%noiseImgs.length], mouseX, mouseY+3);
            cursorImg.pop();
        }
        cursorImg.filter(BLUR, 2);
        //cursorImg.image(noiseImgs[round(frameCount/27.)%noiseImgs.length], mouseX, mouseY+3);
        for(var k = 0; k < 1; k++){
            var rr = random(1,2);
            cursorImg.fill(0, random(133, 136));
            cursorImg.rect(0, 0+3, 2, 13, 1);
            cursorImg.rect(0, 0+3+13/2, 7, 2, 1);
            cursorImg.rect(0, 0+3-13/2, 7, 2, 1);
            cursorImg.push();
            //cursorImg.tint(255, 122);
            //cursorImg.image(noiseImgs[round(frameCount/27.)%noiseImgs.length], mouseX, mouseY+3);
            cursorImg.pop();
        }
        cursorImg.pop();
        cursorImgs.push(cursorImg);
    }
    print(cursorImgs)
}

function createNoiseImages(){
    for(var ww = 0; ww < 10; ww++){
        noiseImg = createGraphics(15, 18);
        noiseImg.push();
        noiseImg.clear();
        noiseImg.noStroke();
        noiseImg.translate(noiseImg.width/2, noiseImg.height/2);
        var ngrains = random(40);
        for(var k = 0; k < ngrains; k++){
            var rr = random(1,1.1);
            noiseImg.fill(0, random(0, 111));
            //noiseImg.fill(0, 255);
            noiseImg.ellipse(3*random(-1,1,1,1), 2+4*random(-1,1,1,1), rr, rr);
        }
        noiseImg.pop();
        noiseImgs.push(noiseImg);
    }
}

function createCharImage(chr){
    chrImg = createGraphics(18, 22);
    chrImg.push();
    chrImg.clear();
    chrImg.textFont(courierM);
    chrImg.textSize(18);
    //chrImg.fill(0, 10);
    //chrImg.stroke(0, 90);
    //chrImg.rect(0, 0, chrImg.width, chrImg.height);
    chrImg.noStroke();
    chrImg.translate(chrImg.width/2, chrImg.height/2);
    chrImg.fill(0, 180);
    chrImg.noStroke();
    chrImg.textAlign(CENTER, CENTER);
    chrImg.text(chr, 0, 0);
    chrImg.pop();

    return chrImg;
}

function createCharImageFaded(chr){
    chrImg = createGraphics(18, 22);
    chrImg.push();
    chrImg.clear();
    chrImg.textFont(courierM);
    chrImg.textSize(18);
    //chrImg.fill(0, 10);
    //chrImg.stroke(0, 90);
    //chrImg.rect(0, 0, chrImg.width, chrImg.height);
    chrImg.fill(0, 77);
    chrImg.noStroke();
    chrImg.translate(chrImg.width/2, chrImg.height/2);
    chrImg.textAlign(CENTER, CENTER);
    chrImg.text(chr, 0, 0);
    chrImg.pop();
    if(random(100) < 110)
        chrImg.filter(BLUR, random(1,2));

    return chrImg;
}

function reposition_canvas(){
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - height) / 2;
    canvas.position(x, y);

    grid = []

    min_dist = 10 * screen_sc;
    cell_size = min_dist*1.414;

    for(var y=0; y<height/min_dist; y++){
        var row = [];
        for(var x=0; x<width/min_dist; x++){
            row.push([]);
        }
        grid.push(row)
    }

    imageMode(CENTER);

    
    img_a = createGraphics(40, 20);
    img_a.push();
    img_a.clear();
    img_a.textFont(courierM);
    img_a.fill(0, 10);
    img_a.rect(0, 0, 40, 20);
    img_a.fill(50);
    img_a.noStroke();
    img_a.translate(img_a.width/2, img_a.height/2);
    img_a.textAlign(CENTER, CENTER);
    img_a.text("Hello", 0, 0);
    img_a.pop();

    for(var k = 0; k < charset.length; k++){
        var chr = charset.charAt(k);
        charsImgs[chr] = createCharImage(chr);
        charsImgsFaded[chr] = createCharImageFaded(chr);
    }
    print(charsImgs);
}

function reposition_buttons(){
    toggle_button = select('#toggle');
    color_button = select('#color');
    toggle_button.style('opacity', 0.5)
    color_button.style('opacity', 0.5)

    var x, y;
    if(windowWidth > windowHeight){
        x = (windowWidth + width) / 2;
        y = (windowHeight - height) / 2;
        toggle_button.position(x, y);
        x = (windowWidth + width) / 2;
        y = (windowHeight + height) / 2 - color_button.height;
        color_button.position(x, y);
    }
    else{
        x = (windowWidth - width) / 2;
        y = (windowHeight + height) / 2;
        toggle_button.position(x, y);
        x = (windowWidth + width) / 2 - color_button.width;
        y = (windowHeight + height) / 2;
        color_button.position(x, y);
    }

    toggle_button.mouseClicked(function (){
        if(has_gravity == true){
            // toggle_button.style('color', '#CFA343');
            toggle_button.style('opacity', 0.5);
            // toggle_button.html('gravity off', false);
        }
        else{
            // toggle_button.style('color', '#71507A');
            toggle_button.style('opacity', 1.0);
            // toggle_button.html('gravity on&nbsp;', false);
        }
        has_gravity = !has_gravity;
    });
    color_button.mouseClicked(function (){
        if(has_color == true){
            // color_button.style('color', '#CFA343');
            color_button.style('opacity', 0.5);
            // color_button.html('color off', false);
        }
        else{
            // color_button.style('color', '#71507A');
            color_button.style('opacity', 1.0);
            // color_button.html('color on&nbsp;', false);
        }
        has_color = !has_color;
    });
}

function setup() {
    if(windowWidth > windowHeight){
        canvas = createCanvas(780, 780, WEBGL);
    }
    else{
        canvas = createCanvas(windowWidth, windowWidth, WEBGL);
    }
    scriptTxt = scriptTxt.join('');
    print(scriptTxt);
    screen_sc = width/780;
    pallete_idx = int(random(0, pallete.length));
    reposition_canvas();
    //reposition_buttons();
    rectMode(CENTER);
    particlesImage = createGraphics(width, height);
    createNoiseImages();
    createCursorImages();
    noCursor();

    particlesImage.imageMode(CENTER);
    let NUM_PARTICLES = 10;
    fx = createShader(
        `precision highp float; 
        attribute vec3 aPosition;
        void main() { 
        gl_Position = vec4(aPosition, 1.0); 
        }`, `
        precision highp float;
        uniform sampler2D tex;
        uniform float time;

        float rand(vec2 n) { 
            return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        void main() {
            //float bri = 0.0;
        //float maxBri = 0.001; // adjust depending on the number of particles
        vec2 resolution = vec2(780, 780)*2.;
        vec2 pos = gl_FragCoord.xy / resolution;
        pos.y = 1. - pos.y;
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3333333333333333) * vec2(1,0);
        color += texture2D(tex, pos) * 0.29411764705882354;
        color += texture2D(tex, pos + (off1 / resolution)) * 0.35294117647058826;
        color += texture2D(tex, pos - (off1 / resolution)) * 0.35294117647058826;
        gl_FragColor = color + 0.06*vec4(vec3((-1. + 2.*rand(pos+.01*vec2(mod(time,100.))))), 0);
        }`
    );
    shader(fx);
}

function windowResized(){
        print('hmm')
    if(windowWidth > windowHeight){
        resizeCanvas(780, 780);
    }
    else{
        resizeCanvas(windowWidth, windowWidth);
    }
    screen_sc = width/780;
    reposition_canvas();
    reposition_buttons();
}

function draw() {
    //background('#29FFBC');
    if(frameCount%30==0)
        print(frameRate(), Object.keys(particles).length);
    particlesImage.background('#cdcdcd');
    if(frameCount%100==0){
        // print(frameRate());
    }
    // for(var y = 0; y < height; y+=cell_size){
    //     stroke('#ff0000');
    //     line(0, y, width, y)
    // }
    // for(var x = 0; x < width; x+=cell_size){
    //     stroke('#ff0000');
    //     line(x, 0, x, height)
    // }

    var dead = [];
    for(var p in particles){
        if(particles[p].age > lifespan){
            dead.push(int(p));
        }
        particles[p].update();
        particles[p].display();
    }

    if(dead.length > 0){
        for(var p in dead){
            // print(dead[p])
            delete particles[dead[p]]
        }
        for(var y=0; y<height/min_dist; y++){
            for(var x=0; x<width/min_dist; x++){
                for(var p in dead){
                    if(grid[y][x].includes(dead[p])){
                        // print(dead, dead[p])
                        // print(grid[y][x])
                        // print(dead[p] in grid[y][x])
                        grid[y][x].splice(grid[y][x].indexOf(dead[p]), 1)
                        // print(grid[y][x])
                        // print('.---')
                    }
                }
            }
        }
    }

    if(has_color){
        if(prev_color == false){
            color_timer = 0;
            pallete_idx = (pallete_idx + 1) % pallete.length;
        }
        prev_color = true;
        color_timer += 1.0/30;
        color_timer = max(0, min(1, color_timer));
    }
    else{
        if(prev_color == true){
            color_timer = 1;
        }
        prev_color = false;
        color_timer -= 1.0/30;
        color_timer = max(0, min(1, color_timer));
    }

    if(mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height && mouseButton === LEFT){
        createParticles();
        //createScriptText();
        //noStroke();
        //fill('#e73900');
        //var rad = random(3,14);
        //ellipse(mouseX, mouseY, rad, rad);
    }

    particlesImage.fill(0, 190);
    particlesImage.noStroke();
    if(round(frameCount/27.)%2 != 0){
        particlesImage.image(cursorImgs[round(frameCount/27.)%cursorImgs.length], mouseX, mouseY+3);
        particlesImage.image(noiseImgs[round(frameCount/27.)%noiseImgs.length], mouseX, mouseY+3);
    }
    
    fx.setUniform('tex', particlesImage);
    fx.setUniform('time', frameCount*1.0);
    quad(-1, -1, 1, -1, 1, 1, -1, 1);
    //image(particlesImage, 0, 0);
}


function keyTyped() {
    if(!charset.includes(key))
        return;
    createCharParticle(key);
}

class Particle{
    constructor(idx, x, y, character) {
        /*x = max(0, min(width, x));
        y = max(0, min(height, y));*/
        this.idx = idx
        this.vel = createVector(-15, 0);
        this.pos = createVector(x+random(-3,3), y+random(-3,3))
        var gix = int(this.pos.x / cell_size)
        var giy = int(this.pos.y / cell_size)
        grid[giy][gix].push(this.idx)
        this.ang = 0
        this.age = 0
        this.sca = 1.5+0*random(0.8, 2);
        this.random_ang_vel = random(0.35, 1.1)*.1;
        this.min_dist = min_dist*this.sca;
        this.acc = createVector(0, 0);
        this.looking = this.vel.copy();
        this.character = character;
        this.noiseImgIdx = round(random(noiseImgs.length-1));
        //this.chrImg = charsImgs[this.character]
    }

    update(){
        this.age += 1;
        var from_all = [];
        var gix0 = int(this.pos.x / cell_size)
        var giy0 = int(this.pos.y / cell_size)
        var local_particles = []
        for(var iy=-1; iy<2; iy++){
            for(var ix=-1; ix<2; ix++){
                try{
                    local_particles = local_particles.concat(grid[giy0+iy][gix0+ix])
                }
                catch(err){
                    /*print('ehh')*/
                }
            }
        }
        /*console.log(this.idx)*/

        for(var idcx in local_particles){
            var idx = local_particles[idcx];
            var particle = particles[idx];
            try{
                if(particle.age > lifespan){
                    continue;
                }
            }
            catch(err){
                continue;
            }
            try{
                if(this.idx == particle.idx)
                    continue
            }
            catch(err){
            }

            var from_vec = p5.Vector.sub(this.pos, particle.pos);
            var from_vec_m = from_vec.mag();
            if(from_vec_m > (this.min_dist+particle.min_dist)/2)
                continue
            // var from_vec_s = from_vec.mult(this.min_dist / from_vec_m - 1 / this.min_dist)
            // var from_vec_s = from_vec.mult(1 / ((this.min_dist+particle.min_dist)/2))
            from_all.push(from_vec)
        }

        var vec_from = createVector(0, 0);
        for(var fai in from_all){
            var fa = from_all[fai];
            vec_from = vec_from.add(fa)
        }
        var vec_from_m = vec_from.mag()
        if(vec_from_m != 0.){
            vec_from.div(vec_from_m);
        }

        this.acc = createVector(0, 0);
        this.acc.add(vec_from.mult(1));

        if(this.pos.x < brd){
            var fac = 1 - this.pos.x / brd;
            if(fac > 0.5)
                fac = 1;
            else
                fac = fac / 0.5;
            this.acc.add(createVector(2*fac, 0));
        }
        if(this.pos.y < brd){
            var fac = 1 - this.pos.y / brd;
            if(fac > 0.5)
                fac = 1;
            else
                fac = fac / 0.5;
            this.acc.add(createVector(0, 2*fac));
        }

        if(this.pos.x > width - brd){
            var fac = (this.pos.x - (width - brd)) / brd;
            if(fac > 0.5)
                fac = 1;
            else
                fac = fac / 0.5;
            this.acc.add(createVector(-2*fac, 0));
        }

        if(this.pos.y > height - brd){
            var fac = (this.pos.y - (height - brd)) / brd;
            if(fac > 0.5)
                fac = 1;
            else
                fac = fac / 0.5;
            this.acc.add(createVector(0, -2*fac));
        }


        if(has_gravity){
            this.acc.add(createVector(0, 1));
            var up = 0;
            if(lifespan - this.age < 120){
                up = -0.6 * (1 - (lifespan - this.age)/120);
            }
            this.acc.add(createVector(0, up));
        }

        this.vel.add(this.acc);

        this.vel.mult(0.8);
        this.pos.add(this.vel);
        var gix1 = int(this.pos.x / cell_size);
        var giy1 = int(this.pos.y / cell_size);
        if(gix0 != gix1 || giy0 != giy1){
            grid[giy0][gix0].splice(grid[giy0][gix0].indexOf(this.idx), 1)
            grid[giy1][gix1].push(this.idx)
        }
    }

    display(){
        var aag = this.age;
        if(aag > lifespan-30)
            aag = lifespan-aag;
        var scx = (10*screen_sc * min(aag, 30)/30 + power(color_timer, 2)) * this.sca;
        var scy = (4*screen_sc * min(aag, 30)/30 + power(color_timer, 2)) * this.sca;
        var direction = ((this.idx % 2) * 2) - 1;
        var velocity = (this.idx % 20) / 20;

        this.looking = p5.Vector.add(this.looking, p5.Vector.mult(p5.Vector.sub(this.vel, this.looking), 0.1));
        //this.looking = this.looking.add(this.vel.sub(this.looking).mult(0.011));

        this.ang = this.ang + 1/30*PI*2 * direction * this.vel.mag()/3 * this.random_ang_vel;
        /*var angle1 = this.looking.heading();
        var angle2 = this.ang;

        var angle = angle1;
        if(this.age < 30){
            angle = angle1;
        }
        else if(this.age < 120){
            var p = (this.age-30)/90;
            angle = (1-p)*angle1 + angle2*p;
        }
        else{
            angle = angle2;
        }*/
        var angle = this.ang;

        particlesImage.push();
        particlesImage.translate(this.pos.x, this.pos.y);
        particlesImage.rotate(angle);
        
        var sss = this.age;
        if(sss > lifespan-30)
            sss = map(sss, lifespan-30, lifespan, 1, 0);
        else
            sss = 1;
        particlesImage.scale(sss);

        var hexs = pallete[pallete_idx].split('-');
        var fill1 = color('#cdcdcd')
        var fill2 = color('#'+hexs[this.idx%hexs.length])

        var stroke1 = color(0,0,0,255);
        var stroke2 = color(0,0,0,255);

        particlesImage.noFill();
        particlesImage.stroke(50);
        particlesImage.stroke(lerpColor(stroke1, stroke2, power(color_timer, 2)));
        particlesImage.fill(lerpColor(fill1, fill2, power(color_timer, 2)));

        particlesImage.noStroke();
        //fill(50);
        //tint(lerpColor(fill1, fill2, power(color_timer, 2)));
        var gltx = 1;
        if(noise(this.idx) > 0.8)
            gltx = 2;

        var glsx = 3;
        var glsy = 1;

        particlesImage.fill(0);
        particlesImage.noStroke();
        //particlesImage.rect(0,0,1,1);
        particlesImage.image(charsImgs[this.character], 0, 0);
        particlesImage.image(charsImgsFaded[this.character], glsx*gltx*(-.5+noise(this.idx)), glsy*gltx*(-.5+noise(this.idx)));
        particlesImage.image(charsImgsFaded[this.character], glsx*(-.5+noise(this.idx)), glsy*(-.5+noise(this.idx)));
        particlesImage.image(charsImgsFaded[this.character], glsx*(-.5+noise(this.idx)), glsy*(-.5+noise(this.idx)));
        particlesImage.image(noiseImgs[this.noiseImgIdx], 0, 0);
        //text("a", 0, 0);
        //rect(0, 0, scx, scy);
        particlesImage.pop();
    }
}

function createParticles() {
    if(true || mouseX > brd && mouseX < width-brd && mouseY > brd && mouseY < height-brd){
        //if(frameRate() < 35)
        //    return;
        for(var k = 0; k < 3; k++){
            idx = index++;
            if(round(frameCount/90.)%2 == 0 && false){
                var lolo = ".,:;";
                var chrIdx = round(random(0, lolo.length-1));
                var character = lolo[chrIdx];
                particles[idx] = new Particle(idx, max(brd, min(width-brd, mouseX)), max(brd, min(height-brd, mouseY)), character);
            }
            else{
                var chrIdx = round(random(0, lower.length-1));
                var character = lower[chrIdx];
                particles[idx] = new Particle(idx, max(brd, min(width-brd, mouseX)), max(brd, min(height-brd, mouseY)), character);
            }
        }
    }
}

function createScriptText() {
    if(true || mouseX > brd && mouseX < width-brd && mouseY > brd && mouseY < height-brd){
        //if(frameRate() < 35)
        //    return;
        for(var k = 0; k < 1; k++){
            scriptChrIdx = (scriptChrIdx+1)%scriptTxt.length;
            var character = scriptTxt[scriptChrIdx];
            if(!charset.includes(character))
                continue;
            idx = index++;
            particles[idx] = new Particle(idx, max(brd, min(width-brd, mouseX)), max(brd, min(height-brd, mouseY)), character);
        }
    }
}

function createCharParticle(character) {
    if(true || mouseX > brd && mouseX < width-brd && mouseY > brd && mouseY < height-brd){
        //if(frameRate() < 35)
        //    return;
        for(var k = 0; k < 1; k++){
            idx = index++;
            particles[idx] = new Particle(idx, max(brd, min(width-brd, mouseX)), max(brd, min(height-brd, mouseY)), character)
        }
    }
}

function power(p, g) {
    if (p < 0.5)
        return 0.5 * pow(2*p, g);
    else
        return 1 - 0.5 * pow(2*(1 - p), g);
}

function keyPressed(){
    /*if(keyCode == 65){
        var co = 0;
        for(var y=0; y<height/min_dist; y++){
            for(var x=0; x<width/min_dist; x++){
                if(dead[p] in grid[y][x])
                    co += grid[y][x].length;
            }
        }
        print(co);
    }*/
}
