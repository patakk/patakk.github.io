let camera, scene, renderer;
var vShader, fShader;

var points;
var ress = 800;
var baseWidth = 1;
var baseHeight = 1;
var winScale;
var pg;
var canvas;
var paletteCanvas;
fxrand = function(){
    return Math.random();
}

var seed = fxrand()*10000;

var scrollscale = 1.;
var globalIndex = 0;
var frameCount = 0;
var particlePositions = [];
var particleColors = [];
var particleSizes = [];
var particleAngles = [];
var particleIndices = [];

var horizon = fxrandom(0.3, 0.8);

var offcl = [fxrandom(-42, 14), fxrandom(-37, 34), fxrandom(-37, 37)]
skyclr = {
    a: [144, 121, 92, 255],
    ad: [29, 35, 22, 0],
    b: [88, 77, 83, 88],
    bd: [11, 28, 17, 88],
    c: [130, 85, 62, 255],
    cd: [39, 25, 22, 0],
}


treeclr = {
    a: [194, 82, 70, 255],
    ad: [39, 25, 22, 0],
    b: [191, 95, 80, 255],
    bd: [39, 25, 22, 0],
    c: [164, 82, 70, 188],
    cd: [39, 25, 22, 33],
    d: [88, 77, 83, 118],
    dd: [11, 28, 17, 55],
}

groundclr = {
    c: [200, 134, 69, 255],
    cd: [49, 25, 22, 0],
    b: [88, 77, 83, 188],
    bd: [11, 28, 17, 55],
    a: [216, 85, 62, 255],
    ad: [39, 25, 22, 0],
}

orange = {
    a: [216, 85, 22, 255],
    ad: [39, 25, 22, 0],
    b: [88, 77, 83, 127],
    bd: [11, 28, 17, 127],
}

indigo = { // old sky
    a: [102, 153, 220, 255],
    ad: [2, 5, 25, 0],
    b: [227, 233, 111, 16],
    bd: [5, 11, 111, 16],
}


function isMobile() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

function power(p, g) {
    if (p < 0.5)
        return 0.5 * Math.pow(2*p, g);
    else
        return 1 - 0.5 * Math.pow(2*(1 - p), g);
}

function fxrandom(v1, v2){
    return v1 + (v2-v1)*fxrand();
}

function dist(x1, y1, x2, y2){
    return Math.sqrt((x2-x1)**2, (y2-y1)**2);
}

function animate() {
    
    requestAnimationFrame(animate);
    
    if(renderer){
        points.material.uniforms.u_time.value = frameCount++;
        points.material.uniforms.u_scrollscale.value = scrollscale;
        renderer.render(scene, camera);
    }
}



function draw(){
    //image(pg, 0, 0, canvas.width, canvas.height);
}

function getHorizon(x){
    var dispr = .5*baseHeight*(-.5*power(noise(x*0.003+3133.41), 3))
    return baseHeight*horizon + .8*baseHeight*(-.5*power(noise(x*0.003), 2)) + dispr*fxrand();
}

function map(x, v1, v2, v3, v4){
    return (x-v1)/(v2-v1)*(v4-v3)+v3;
}

function max(x, y){
    if(x >= y)
        return x;
    return y;
}

function min(x, y){
    if(x <= y)
        return x;
    return y;
}

function constrain(x, a, b){
    return max(a, min(x, b));
}

function radians(angle){
    return angle/360.*2*3.14159;
}

function reset(){
    noiseSeed(fxrandom(0, 100000));
    globalIndex = 0;
    frameCount = 0;
    offcl = [fxrandom(-14*3, 14), fxrandom(-7, 4), fxrandom(-7, 7)]
    seed = fxrand()*10000;
    horizon = fxrandom(0.7, 0.8);

    wind = fxrandom(-.4, +.4);
    if(fxrand() < .5)
        wind = 3.14 + wind;

    canvasWidth = ress;
    canvasHeight = ress;

    ww = window.innerWidth || canvas.clientWidth || body.clientWidth,
    hh = window.innerHeight|| canvas.clientHeight|| body.clientHeight;

    baseWidth = ress-16;
    baseHeight = ress-16;

    if(ww < hh){
        canvasWidth = ww;
        canvasHeight = hh;
        baseWidth = ww-16;
        baseHeight = hh-16;
    }

    if(ww < 800 || hh < 800){
        canvasWidth = ww;
        canvasHeight = hh;
        baseWidth = ww-16;
        baseHeight = hh-16;
    }

    ww = canvasWidth
    wh = canvasHeight

    /*if(ww/wh > 1){
        baseWidth = Math.round(ress * ww/wh)
        baseHeight = ress
    }
    else{
        baseWidth = ress
        baseHeight = Math.round(ress * wh/ww)
    }*/
    winScale = ww / baseWidth;

    //groundclr.a = [255., 0., 0., 255];
    groundclr.a[3] = 0;
    var rx, ry;
    var pixelData;
    rx = Math.random()*33+128;
    ry = Math.random()*33+128;
    pixelData = paletteCanvas.getContext('2d').getImageData(rx, ry, 1, 1).data;
    if(Math.random()<1.5) groundclr.a = [pixelData[0], pixelData[1], pixelData[2], 255];
    rx += Math.random()*88-44;
    ry += Math.random()*88-44;
    pixelData = paletteCanvas.getContext('2d').getImageData(rx, ry, 1, 1).data;
    if(Math.random()<1.5) groundclr.b = [pixelData[0], pixelData[1], pixelData[2], 0];
    rx += Math.random()*88-44;
    ry += Math.random()*88-44;
    pixelData = paletteCanvas.getContext('2d').getImageData(rx, ry, 1, 1).data;
    if(Math.random()<1.5) groundclr.c = [pixelData[0], pixelData[1], pixelData[2], 0];

    rx += Math.random()*33-16;
    ry += Math.random()*33-16;
    pixelData = paletteCanvas.getContext('2d').getImageData(rx, ry, 1, 1).data;
    if(Math.random()<1.5) skyclr.a = [pixelData[0], pixelData[1], pixelData[2], 255];
    rx += Math.random()*33-16;
    ry += Math.random()*33-16;
    pixelData = paletteCanvas.getContext('2d').getImageData(rx, ry, 1, 1).data;
    if(Math.random()<1.5) skyclr.b = [pixelData[0], pixelData[1], pixelData[2], 188];
    rx += Math.random()*33-16;
    ry += Math.random()*33-16;
    pixelData = paletteCanvas.getContext('2d').getImageData(rx, ry, 1, 1).data;
    if(Math.random()<1.5) skyclr.c = [pixelData[0], pixelData[1], pixelData[2], 188];
    
    rx += Math.random()*66-36;
    ry += Math.random()*66-36;
    pixelData = paletteCanvas.getContext('2d').getImageData(rx, ry, 1, 1).data;
    if(Math.random()<1.5) treeclr.a = [pixelData[0], pixelData[1], pixelData[2], 255];
    rx += Math.random()*66-36;
    ry += Math.random()*66-36;
    pixelData = paletteCanvas.getContext('2d').getImageData(rx, ry, 1, 1).data;
    if(Math.random()<1.5) treeclr.b = [pixelData[0], pixelData[1], pixelData[2], 188];
    rx += Math.random()*66-36;
    ry += Math.random()*66-36;
    pixelData = paletteCanvas.getContext('2d').getImageData(rx, ry, 1, 1).data;
    if(Math.random()<1.5) treeclr.c = [pixelData[0], pixelData[1], pixelData[2], 255];

    //resizeCanvas(ww, wh, true);
    //pg = createGraphics(ww, wh);

    particlePositions = [];
    particleColors = [];
    particleSizes = [];
    particleAngles = [];
    particleIndices = [];

    generateBackground();
    generateForeground();
    generateTrees();

    loadShadersAndData();

    animate();

    console.log(globalIndex)
}

function loadShadersAndData(){
    
    //const material = new THREE.PointsMaterial( { size: 15, vertexColors: true } );
    var loader = new THREE.FileLoader();
    var numFilesLeft = 2;
    function runMoreIfDone() {
        --numFilesLeft;
        if (numFilesLeft === 0) {
            loadData();
        }
    }
    loader.load('assets/shaders/particle.frag',function ( data ) {fShader =  data; runMoreIfDone(); },);
    loader.load('assets/shaders/particle.vert',function ( data ) {vShader =  data; runMoreIfDone(); },);
}

function loadData(){
    /*
    canvas2 = document.createElement("canvas");
    canvas2.id = "hello"
    canvas2.width = ww;
    canvas2.height = wh;
    canvas2.style.position = 'absolute';
    canvas2.style.left = '0px';
    canvas2.style.top = '0px';
    canvas2.style.z_index = '1111';
    console.log(canvas2)
    document.body.append(canvas2)
    */
    camera = new THREE.OrthographicCamera(-canvasWidth/2, canvasWidth/2, canvasHeight/2, -canvasHeight/2, 1, 1000);
    //camera = new THREE.PerspectiveCamera( 27, canvasWidth / canvasHeight, 5, 3500 );
    //camera.position.z = 2750;

    var ff = true;
    if(scene)
      ff = false;
    scene = new THREE.Scene();
    hsv = [fxrand(), fxrandom(0.2, 0.66), fxrandom(0.35, 0.55)]
    bgcolor = HSVtoRGB(hsv[0], hsv[1], hsv[2])

    rx = Math.random()*256;
    ry = Math.random()*256;
    pixelData = paletteCanvas.getContext('2d').getImageData(rx, ry, 1, 1).data;
    console.log(pixelData);
    bgcolor = [pixelData[0]/255., pixelData[1]/255., pixelData[2]/255.];

    scene.background = new THREE.Color( bgcolor[0], bgcolor[1], bgcolor[2]);
    //scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );

    //

    const particles = 33133;

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( particlePositions, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( particleColors, 4 ) );
    geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( particleSizes, 2 ) );
    geometry.setAttribute( 'angle', new THREE.Float32BufferAttribute( particleAngles, 1 ) );
    geometry.setAttribute( 'index', new THREE.Float32BufferAttribute( particleIndices, 1 ) );

    var customUniforms = {
        u_time: { value: frameCount },
        u_scrollscale: { value: scrollscale },
    };

    const material = new THREE.ShaderMaterial( {
        uniforms: customUniforms,
        vertexShader: vShader,
        fragmentShader: fShader,
        transparent:  true
      });

    points = new THREE.Points( geometry, material );
    scene.add( points );

    //

    if(ff)
        renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( canvasWidth, canvasHeight );
    renderer.domElement.id = "threejsCanvas"
    //renderer.domElement.style.position = "absolute";
    //renderer.domElement.style.left = "0px";
    //renderer.domElement.style.top = "0px";
    if(ff)
        document.body.appendChild( renderer.domElement );

    console.log("af");
    console.log(renderer.domElement);
    repositionCanvas(renderer.domElement);

    //renderer.render( scene, camera );

    //window.addEventListener( 'resize', onWindowResize );
}


function repositionCanvas(canvas){
    var win = window,
    doc = document,
    body = doc.getElementsByTagName('body')[0],
    ww = win.innerWidth || canvas.clientWidth || body.clientWidth,
    hh = win.innerHeight|| canvas.clientHeight|| body.clientHeight;
    
    if(isMobile()){
      //canvas.width = ww;
      //canvas.height = hh;
      //canvas.style.borderWidth = "0px";
    }
    else{
      //canvas.width = Math.min(ww, hh) - 130;
      //canvas.height = Math.min(ww, hh) - 130;
    }

    canvas.style.position = 'absolute';
    canvas.style.left = ww/2 - canvasWidth/2 + 'px';
    canvas.style.top = hh/2 - canvasHeight/2 + 'px';
    
}

function onWindowResize() {
    ww = win.innerWidth || canvas.clientWidth || body.clientWidth,
    hh = win.innerHeight|| canvas.clientHeight|| body.clientHeight;

    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( canvasWidth, canvasHeight );

}

var cnt = 0

function drawTree(rx, ry, kk, pp){
    
    //pg.noStroke();
    //pg.fill(255);
    //pg.ellipse(rx, ry, 40, 40);
    var perspective = map(ry, getHorizon(rx), baseHeight, 0.5, 0.8);
    var perspective2 = map(ry, getHorizon(rx), baseHeight, 0.1, 0.8);
    //perspective = 1;

    var seed1 = fxrandom(0, 100000);
    var detail = fxrandom(5, 8)*.55;
    var amp = 12;
    var frq = 0.003;
    var pscale = map(ry, getHorizon(rx), baseHeight, 0.1, 1.0);
    var fade = map(ry, baseHeight*horizon*1.0, baseHeight, 0.88, 1.0);
    var maxwidth = 20;
    var startroot = fxrandom(0.92, 0.95);
    var rootmax = fxrandom(0.9, 2.2);

    var pos, col, size, angle;

    var offcl2 = [fxrandom(-15,+4), fxrandom(-15,+4), fxrandom(-15,+4)]
    //pg.fill(map(ry, baseHeight*horizon*1.0, baseHeight, 222, 255));
    for(var y = ry; y > 0; y -= detail*perspective){
        var rootwide = constrain(map(y, ry, ry*startroot, 1, 0), 0, 1);
        rootwide = 1 + rootmax*Math.pow(rootwide, 4);
        for(var x = rx - pscale*maxwidth*rootwide; x < rx + pscale*maxwidth*rootwide; x += max(1, 4*perspective)){
            var xx = x + amp*(-.5 + power(noise(rx*frq, y*frq, seed1), 2)) + fxrandom(-detail,detail)*1*(.4 + .6*Math.pow(1.-perspective2, 4));
            var yy = y + fxrandom(-detail,detail)*1.5;
            col = [
                offcl2[0] + offcl[0] + fade*treeclr.a[0] + fxrandom(-treeclr.ad[0], treeclr.ad[0]),
                offcl2[1] + offcl[1] + fade*treeclr.a[1] + fxrandom(-treeclr.ad[1], treeclr.ad[1]),
                offcl2[2] + offcl[2] + fade*treeclr.a[2] + fxrandom(-treeclr.ad[2], treeclr.ad[2]),
                treeclr.a[3] + fxrandom(-treeclr.ad[3], treeclr.ad[3]),
            ];
            if(noise(xx*0.05, yy*0.004) + map(ry, baseHeight*horizon*1.0, baseHeight, -.2, .2) < 0.35+fxrandom(-.1,.1)+y/baseHeight){
                col = [
                    offcl2[0] + offcl[0] + fade*treeclr.b[0] + fxrandom(-treeclr.bd[0], treeclr.bd[0]),
                    offcl2[1] + offcl[1] + fade*treeclr.b[1] + fxrandom(-treeclr.bd[1], treeclr.bd[1]),
                    offcl2[2] + offcl[2] + fade*treeclr.b[2] + fxrandom(-treeclr.bd[2], treeclr.bd[2]),
                    treeclr.b[3] + fxrandom(-treeclr.bd[3], treeclr.bd[3]),
                ];
            }
            else if(noise(xx*0.05, yy*0.004) + map(ry, baseHeight*horizon*1.0, baseHeight, -.2, .2) < 0.5+fxrandom(-.1,.1)){
                col = [
                    offcl2[0] + offcl[0] + fade*treeclr.c[0] + fxrandom(-treeclr.cd[0], treeclr.cd[0]),
                    offcl2[1] + offcl[1] + fade*treeclr.c[1] + fxrandom(-treeclr.cd[1], treeclr.cd[1]),
                    offcl2[2] + offcl[2] + fade*treeclr.c[2] + fxrandom(-treeclr.cd[2], treeclr.cd[2]),
                    treeclr.c[3] + fxrandom(-treeclr.cd[3], treeclr.cd[3]),
                ];
            }
            pos = [xx, yy];
            angle = radians(fxrandom(-16,16));
            if(fxrand() > 0.97){
                var rb = fxrandom(0,255);
                col = [rb, rb, rb, fxrandom(0,88)];
                ww = 10*pscale*fxrandom(.9, 1.1);
                size = [0, 0];
                if(xx-ww > rx - pscale*maxwidth*rootwide && xx+ww < rx + pscale*maxwidth*rootwide)
                    size = [5, 5];
            }
            else{
                size = [4.15*fxrandom(.8, 1.2)*perspective, 4*fxrandom(.9, 1.1)*perspective];
                //mySquare(0, 0, 6.5*fxrandom(.8, 1.2)*perspective, 4*fxrandom(.9, 1.1)*perspective);
            }
            //cnt++;
            
            if(pos[0] < 0 || pos[0] > baseWidth)
                continue
            if(pos[1] < 0 || pos[1] > baseHeight)
                continue

            pos[0] = pos[0] - canvasWidth/2*0 - baseWidth/2;
            pos[1] = pos[1] - canvasHeight/2*0 - baseHeight/2;
            pos[1] *= -1;

            particlePositions.push(pos[0], pos[1], -1);
            particleColors.push(col[0]/255., col[1]/255., col[2]/255., col[3]/255.);
            //particleColors.push(Math.pow(1.-perspective2, 2), Math.pow(1.-perspective2, 2), Math.pow(1.-perspective2, 2), col[3]/255.);
            particleSizes.push(size[0], size[1]);
            particleAngles.push(angle);
            particleIndices.push(globalIndex++);

            
            if(fxrandom(0,1)>0.19){
                //drawHole(xx, yy, 25, 25);
            }
        }
    }
}

function generateTrees(){
    var kk = 0;
    var nn = 99
    var ex = 4;
    while(kk < nn){
        var pp = map(kk, 0, nn, 0.03, 1);
        pp = Math.pow(pp, 12);
        //var x = fxrandom(0, baseWidth);
        //var y = map(pp, 0, 1, getHorizon(x)*1.1, baseHeight) + 0*fxrandom(0, baseHeight/30);

        var middle = power(fxrand(), 4);
        var prob = map(middle, 0, 1, -1, 1);
        prob = Math.abs(Math.pow(prob, ex));
        if(fxrand() < .5)
            prob = 1 - prob;
        //if(fxrand() > prob)
        //    continue;
        var x = map(middle, 0, 1, baseWidth*.0, baseWidth-baseWidth*.0);
        var y = map(pp, 0, 1, getHorizon(x)*1.1, baseHeight) + 0*fxrandom(0, baseHeight/30);
        drawTree(x, y, kk, pp);
        kk++;

    }
}

function drawHole(x, y, lx, rx){
    for(var k = 0; k < 1230; k++){
        var dx = fxrandom(20, 30)*.4;
        var dy = fxrandom(5, 13)*.5;
        var xx = x + fxrandom(-80, 80);
        var yy = y + fxrandom(-88, 84);
        if(dist(x*1, y*1, xx*1, yy*1) < 86 && xx-dx/2 > lx && xx+dx/2 < rx){
            //pg.push();
            //pg.translate(xx, yy);
            //pg.rotate(radians(fxrandom(-16,16)));
            //pg.fill(fxrandom(0, 255), fxrandom(0, 88));
            //mySquare(0, 0, dx, dy);
            //pg.pop();
            var pos = [xx, yy];
            var rc = fxrandom(0, 255);
            var col = [rc, rc, rc, fxrandom(0, 188)];
            var size = [dx, dy];
            var angle = 0;
            
            pos[0] = pos[0] - canvasWidth/2*0 - baseWidth/2;
            pos[1] = pos[1] - canvasHeight/2*0 - baseHeight/2;
            pos[1] *= -1;

            particlePositions.push(pos[0], pos[1], -1);
            particleColors.push(col[0]/255., col[1]/255., col[2]/255., col[3]/255.);
            particleSizes.push(size[0], size[1]);
            particleAngles.push(angle);
            particleIndices.push(globalIndex++);
        }
    }
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [r, g, b]
}

function generateBackground(){
    hsv = [fxrand(), fxrandom(0.2, 0.66), fxrandom(0.3, 0.95)]
    rgb = HSVtoRGB(hsv[0], hsv[1], hsv[2])

    for(var k = 0; k < 220000; k++){
        var x = fxrandom(0, baseWidth);
        var y = fxrandom(0, getHorizon(x)) + fxrandom(-5, 5);
        var pos, col, size, angle;

        if(fxrandom(0,1000) > 980){
            col = [
                offcl[0] + skyclr.b[0] + fxrandom(-skyclr.bd[0], skyclr.bd[0]),
                offcl[1] + skyclr.b[1] + fxrandom(-skyclr.bd[1], skyclr.bd[1]),
                offcl[2] + skyclr.b[2] + fxrandom(-skyclr.bd[2], skyclr.bd[2]),
                skyclr.b[3] + fxrandom(-skyclr.bd[3], skyclr.bd[3]),
            ];
            //pg.push();
            //pg.translate(x, y);
            pos = [x, y];
            size = [fxrandom(5, 10)*1.7*.35, fxrandom(5, 10)*.9*.35];
            angle = radians(-20 + 40*noise(x*0.01, y*0.01))+wind;
            //mySquare(0, 0, fxrandom(5, 10)*2.7*.35, fxrandom(5, 10)*.9*.35);
            //pg.pop();
        }
        else if(fxrand() > 0.998){
            var rc = fxrandom(0, 255);
            col = [rc, rc, rc, fxrandom(140, 190)];
            angle = radians(-20 + 40*noise(x*0.01, y*0.01)) + wind*.15;
            size = [fxrandom(10,20)*.12, fxrandom(10,20)*.12];
            //mySquare(0, 0, fxrandom(10,20)*.2*perspective, fxrandom(10,20)*.3*perspective);
        }
        else{
            if(fxrand() < map(y, 0, baseHeight*horizon, 0, 1)){
                col = [
                    offcl[0] + skyclr.c[0] + fxrandom(-skyclr.cd[0], skyclr.cd[0]),
                    offcl[1] + skyclr.c[1] + fxrandom(-skyclr.cd[1], skyclr.cd[1]),
                    offcl[2] + skyclr.c[2] + fxrandom(-skyclr.cd[2], skyclr.cd[2]),
                    skyclr.c[3] + fxrandom(-skyclr.cd[3], skyclr.cd[3]),
                ];
            }
            else{
                col = [
                    offcl[0] + skyclr.a[0] + fxrandom(-skyclr.ad[0], skyclr.ad[0]),
                    offcl[1] + skyclr.a[1] + fxrandom(-skyclr.ad[1], skyclr.ad[1]),
                    offcl[2] + skyclr.a[2] + fxrandom(-skyclr.ad[2], skyclr.ad[2]),
                    skyclr.a[3] + fxrandom(-skyclr.ad[3], skyclr.ad[3]),
                ];
            }
            pos = [x, y];
            size = [fxrandom(2, 10)*.315, fxrandom(2, 10)*.35];
            angle = radians(-20 + 40*noise(x*0.01, y*0.01))+wind;
            //mySquare(0, 0, fxrandom(5, 10)*.35, fxrandom(5, 10)*.35);
            //pg.pop(); 
        }

        if(pos[0] < 0 || pos[0] > baseWidth)
            continue
        if(pos[1] < 0 || pos[1] > baseHeight)
            continue
        pos[0] = pos[0] - canvasWidth/2*0 - baseWidth/2;
        pos[1] = pos[1] - canvasHeight/2*0 - baseHeight/2;
        pos[1] *= -1;

        particlePositions.push(pos[0], pos[1], -1);
        particleColors.push(col[0]/255., col[1]/255., col[2]/255., col[3]/255.);
        particleSizes.push(size[0], size[1]);
        particleAngles.push(angle);
        particleIndices.push(globalIndex++);
    }
}

function generateForeground(){
    //rect(baseDim/2, baseDim*1.8, baseDim*2, baseDim*2);
    //var detail = 3;
    var amp = min(baseWidth, baseHeight)/10;
    var frq = 0.002;
    //pg.fill(
    //    groundclr.a[0] + fxrandom(-groundclr.ad[0], groundclr.ad[0]),
    //    groundclr.a[1] + fxrandom(-groundclr.ad[1], groundclr.ad[1]),
    //    groundclr.a[2] + fxrandom(-groundclr.ad[2], groundclr.ad[2]),
    //    groundclr.a[3] + fxrandom(-groundclr.ad[3], groundclr.ad[3]),
    //);
    //pg.noStroke();
    //pg.rect(baseWidth/2, baseHeight*(1+horizon*1.1)/2, baseWidth, baseHeight*(1-horizon));
    
    var rr1 = fxrandom(0.25, 0.5); // .4155
    var rr2 = fxrandom(rr1, rr1+0.35) // .565
    var dispr = fxrandom(0.03, 0.09)

    for(var k = 0; k < 160000; k++){
        var x = fxrandom(0, baseWidth);
        var y = fxrandom(getHorizon(x), baseHeight*1.0);

        var pos, col, size, angle;
//for(var x = 0; x < baseDim; x += detail){
//    for(var y = baseHeight*horizon; y < baseDim*1.1; y += detail){
        var perspective = map(y, getHorizon(x), baseHeight*1.0, 0.445, 1)*1.1;

        rr1 = map(noise(x*0.01, y*0.01+241.2141), 0, 1, 0.25, 0.5);
        rr2 = map(noise(x*0.01, y*0.01+33.44), 0, 1, rr1, rr1+0.35);
        dispr = map(noise(x*0.01, y*0.01+55.55), 0, 1, 0.03, 0.13);
        perspective = 1;
        var xx = x;
        var frqx = map(power(noise(xx*0.001, y*0.001, 22.555), 1), 0, 1, 0.3, 2);
        var frqy = frqx;
        frqx = frqy = .5;
        //var frqy = map(power(noise(xx*0.001, y*0.001, 313.31314), 1), 0, 1, 0.3, 2);
        var yy = y + 0*amp*(-power(noise(x*frq, y*frq), 2)) + fxrandom(-5,5);

        pos = [xx, yy];
        col = [
            offcl[0] + groundclr.a[0] + fxrandom(-groundclr.ad[0], groundclr.ad[0]),
            offcl[1] + groundclr.a[1] + fxrandom(-groundclr.ad[1], groundclr.ad[1]),
            offcl[2] + groundclr.a[2] + fxrandom(-groundclr.ad[2], groundclr.ad[2]),
           groundclr.a[3] + fxrandom(-groundclr.ad[3], groundclr.ad[3]),
        ];
        if(fxrand() > 0.998){
            var rc = fxrandom(0, 255);
            col = [rc, rc, rc, fxrandom(140, 190)];
            angle = radians(-20 + 40*noise(x*0.01, y*0.01)) + wind*.15;
            size = [fxrandom(10,20)*.12*perspective, fxrandom(10,20)*.12*perspective];
            //mySquare(0, 0, fxrandom(10,20)*.2*perspective, fxrandom(10,20)*.3*perspective);
        }
        else{
            if(fxrandom(0,1000) > 960 || noise(xx*0.004*frqx, yy*0.02*frqy)+dispr*fxrandom(-1,1) < rr1 && fxrand()>0.4)
                col = [
                    offcl[0] + groundclr.c[0] + fxrandom(-groundclr.cd[0], groundclr.cd[0]),
                    offcl[1] + groundclr.c[1] + fxrandom(-groundclr.cd[1], groundclr.cd[1]),
                    offcl[2] + groundclr.c[2] + fxrandom(-groundclr.cd[2], groundclr.cd[2]),
                    groundclr.c[3] + fxrandom(-groundclr.cd[3], groundclr.cd[3]),
                ];
            else if(fxrandom(0,1000) > 960 || noise(xx*0.004*frqx, yy*0.02*frqy)+dispr*fxrandom(-1,1) < rr2 && fxrand()>0.4)
                col = [
                    offcl[0] + groundclr.b[0] + fxrandom(-groundclr.bd[0], groundclr.bd[0]),
                    offcl[1] + groundclr.b[1] + fxrandom(-groundclr.bd[1], groundclr.bd[1]),
                    offcl[2] + groundclr.b[2] + fxrandom(-groundclr.bd[2], groundclr.bd[2]),
                    groundclr.b[3] + fxrandom(-groundclr.bd[3], groundclr.bd[3]),
                ];
            size = [fxrandom(5, 10)*.35*perspective, fxrandom(5, 10)*.35*perspective];
            angle = radians(-20 + 40*noise(x*0.01, y*0.01)) + wind*.15;
            //mySquare(0, 0, fxrandom(5, 10)*.35*perspective, fxrandom(5, 10)*.35*perspective);
        }

        if(pos[0] < 0 || pos[0] > baseWidth)
            continue
        if(pos[1] < 0 || pos[1] > baseHeight)
            continue
        pos[0] = pos[0] - canvasWidth/2*0 - baseWidth/2;
        pos[1] = pos[1] - canvasHeight/2*0 - baseHeight/2;
        pos[1] *= -1;

        particlePositions.push(pos[0], pos[1], -1);
        particleColors.push(col[0]/255., col[1]/255., col[2]/255., col[3]/255.);
        particleSizes.push(size[0], size[1]);
        particleAngles.push(angle);
        particleIndices.push(globalIndex++);
    // }
    }
}

function windowResized() {
    console.log("afshflas");
    reset();
}  

function mouseClicked(){
    reset();
}

function scroll(event) {
    event.preventDefault();
    scrollscale = scrollscale + event.deltaY * -0.002;
    scrollscale = Math.min(Math.max(.125, scrollscale), 6);
  }
  
  
window.onresize = windowResized;
window.onresize = windowResized;
window.onclick = mouseClicked;
window.onwheel = scroll;

var paletteImg = new Image();
paletteImg.src = 'assets/colorPalette.png';
paletteImg.onload = function () {
    paletteCanvas = document.createElement('canvas');
    paletteCanvas.width = paletteImg.width;
    paletteCanvas.height = paletteImg.height;
    paletteCanvas.getContext('2d').drawImage(paletteImg, 0, 0, paletteImg.width, paletteImg.height);
    reset();
}

