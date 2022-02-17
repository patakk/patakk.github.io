var canvas;
var grid;
var min_dist = 10;
var cell_size = min_dist*1.414;
var particles = {};
var brd = 40
var index = 0;
var lifespan = 400;

let has_gravity = false;
let has_color = false;
let prev_color = false;
let color_timer = 0.0;
var screen_sc = 1.0;

var pallete_idx = 0;
var pallete = [
    'ee6055-60d394-aaf683-ffd97d-ff9b85',
    '5bc0eb-fde74c-9bc53d-e55934-fa7921',
    'c200fb-ec0868-fc2f00-ec7d10-ffbc0a',
    'f9c80e-f86624-ea3546-662e9b-43bccd',
    '471ca8-884ab2-ff930a-f24b04-d1105a',
]

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
        canvas = createCanvas(600, 600);
    }
    else{
        canvas = createCanvas(windowWidth, windowWidth);
    }
    screen_sc = width/600;
    pallete_idx = int(random(0, pallete.length));
    reposition_canvas();
    reposition_buttons();
    rectMode(CENTER);
}

function windowResized(){
        print('hmm')
    if(windowWidth > windowHeight){
        resizeCanvas(600, 600);
    }
    else{
        resizeCanvas(windowWidth, windowWidth);
    }
    screen_sc = width/600;
    reposition_canvas();
    reposition_buttons();
}

function draw() {
    //background('#29FFBC');
    background('#cdcdcd');
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

    if(mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
        create_particles();
        noStroke();
        fill('#e73900');
        var rad = random(3,14);
        ellipse(mouseX, mouseY, rad, rad)
    }
}

class Particle{
    constructor(idx, x, y) {
        /*x = max(0, min(width, x));
        y = max(0, min(height, y));*/
        this.idx = idx
        this.vel = createVector(0, 0);
        this.pos = createVector(x+random(-3,3), y+random(-3,3))
        var gix = int(this.pos.x / cell_size)
        var giy = int(this.pos.y / cell_size)
        grid[giy][gix].push(this.idx)
        this.ang = 0
        this.age = 0
        this.sca = 1.5+0*random(0.8, 2);
        this.random_ang_vel = random(0.35, 1.1);
        this.min_dist = min_dist*this.sca;
        this.acc = createVector(0, 0);
        this.looking = this.vel.copy();
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
                /*print("bljhh");*/
                continue;
            }
            try{
                if(this.idx == particle.idx)
                    continue
            }
            catch(err){
                /*console.log('xxxx', idcx, idx, particle, this.idx, local_particles)*/
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
            this.acc.add(createVector(0, 0.2));
            var up = 0;
            if(lifespan - this.age < 120){
                up = -0.6 * (1 - (lifespan - this.age)/120);
            }
            this.acc.add(createVector(0, up));
        }

        this.vel.add(this.acc);

        this.vel.mult(0.9);
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

        push();
        translate(this.pos.x, this.pos.y);
        rotate(angle);

        var hexs = pallete[pallete_idx].split('-');
        var fill1 = color('#cdcdcd')
        var fill2 = color('#'+hexs[this.idx%hexs.length])

        var stroke1 = color(0,0,0,255);
        var stroke2 = color(0,0,0,255);

        noFill();
        stroke(50);
        stroke(lerpColor(stroke1, stroke2, power(color_timer, 2)));
        fill(lerpColor(fill1, fill2, power(color_timer, 2)));

        rect(0, 0, scx, scy);
        pop();
    }
}

function create_particles() {
    if(true || mouseX > brd && mouseX < width-brd && mouseY > brd && mouseY < height-brd){
        if(frameRate() < 35)
            return;
        for(var k = 0; k < 3; k++){
            idx = index++;
            particles[idx] = new Particle(idx, mouseX, mouseY)
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
    if(keyCode == 65){
        var co = 0;
        for(var y=0; y<height/min_dist; y++){
            for(var x=0; x<width/min_dist; x++){
                if(dead[p] in grid[y][x])
                    co += grid[y][x].length;
            }
        }
        print(co);
    }
}