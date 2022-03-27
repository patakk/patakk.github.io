var frameCount = Math.random()*10000.;
var gui;
var webgl_context;
var particles_info = {
  count: 1000000,
  speed: .5,
  input: "hello",
};
var notholding = false;
var canvas;
var text_canvas;
var count_prev = particles_info["count"];
var speed_prev = particles_info["speed"];
var prev_origin = [-1000, -1000];
var input_image;
var gr;
var caaaa;
var input_image_tex;

let courierM;

let mysketch = function(p) {
  let x = 0;
  let y = 0;
  let courierM;
  var thefont = 0;

  p.resetFont = function(font){
    thefont = font;
    p.reset("hello");
  }

  p.reset = function(txtinput){
    txtinput = txtinput.toUpperCase();
    p.background(0);
    p.fill(255);
    p.noStroke();
    p.textSize(44);
    if(thefont != 0){
      p.textFont(thefont);
      //p.textFont(p.courierM);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(txtinput, p.width/2, p.height/2);
  }
  }

  p.setup = function() {
    p.createCanvas(256, 256);
    //gr = p.createGraphics(256, 256);
    p.reset("hello");
    p.loadFont('assets/FutuBd_.ttf', p.resetFont);
  };

  p.draw = function() {
  };
};

let myp5 = new p5(mysketch);

function isMobile() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function toDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}


var getSourceSynch = function(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    return (req.status == 200) ? req.responseText : null;
  }; 

function createShader(gl, shader_info) {
    var shader = gl.createShader(shader_info.type);
    var i = 0;
    //var shader_source = document.getElementById(shader_info.name).text;
    /* skip whitespace to avoid glsl compiler complaining about
      #version not being on the first line*/
    //while (/\s/.test(shader_source[i])) i++; 
    //shader_source = shader_source.slice(i);
    shader_source = shader_info.name;
    gl.shaderSource(shader, getSourceSynch(shader_source));
    gl.compileShader(shader);
    var compile_status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compile_status) {
      var error_message = gl.getShaderInfoLog(shader);
      throw "Could not compile shader \"" +
            shader_info.name +
            "\" \n" +
            error_message;
    }
    return shader;
}


/* Creates an OpenGL program object.
   `gl' shall be a WebGL 2 context.
   `shader_list' shall be a list of objects, each of which have a `name'
      and `type' properties. `name' will be used to locate the script tag
      from which to load the shader. `type' shall indicate shader type (i. e.
      gl.FRAGMENT_SHADER, gl.VERTEX_SHADER, etc.)
  `transform_feedback_varyings' shall be a list of varying that need to be
    captured into a transform feedback buffer.*/
function createGLProgram(gl, shader_list, transform_feedback_varyings) {
  var program = gl.createProgram();
  for (var i = 0; i < shader_list.length; i++) {
    var shader_info = shader_list[i];
    var shader = createShader(gl, shader_info);
    gl.attachShader(program, shader);
  }

  /* Specify varyings that we want to be captured in the transform
     feedback buffer. */
  if (transform_feedback_varyings != null) {
    gl.transformFeedbackVaryings(program,
                                 transform_feedback_varyings,
                                 gl.INTERLEAVED_ATTRIBS);
  }
  gl.linkProgram(program);
  var link_status = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!link_status) {
    var error_message = gl.getProgramInfoLog(program);
    throw "Could not link program.\n" + error_message;
  }
  return program;
}

function randomRGData(size_x, size_y) {
  var d = [];
  for (var i = 0; i < size_x * size_y; ++i) {
    d.push(Math.random() * 255.0);
    d.push(Math.random() * 255.0);
  }
  return new Uint8Array(d);
}

function initialParticleData(num_parts, min_age, max_age) {
  var data = [];
  for (var i = 0; i < num_parts; ++i) {
    // pos
    data.push(Math.random()*canvas.width);
    data.push(Math.random()*canvas.height);
    var life = min_age + Math.random() * (max_age - min_age);

    // age
    data.push(Math.random()*0 + 1000);

    // seed
    data.push(Math.random());
    data.push(Math.random());
    
    // vel
    data.push(0.0);
    data.push(0.0);
  }
  return data;
}

function setupParticleBufferVAO(gl, buffers, vao) {
  gl.bindVertexArray(vao);
  for (var i = 0; i < buffers.length; i++) {
    var buffer = buffers[i];
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer_object);
    var offset = 0;
    for (var attrib_name in buffer.attribs) {
      if (buffer.attribs.hasOwnProperty(attrib_name)) {
        var attrib_desc = buffer.attribs[attrib_name];
        gl.enableVertexAttribArray(attrib_desc.location);
        gl.vertexAttribPointer(
          attrib_desc.location,
          attrib_desc.num_components,
          attrib_desc.type,
          false, 
          buffer.stride,
          offset);
        var type_size = 4; /* we're only dealing with types of 4 byte size in this demo, unhardcode if necessary */
        offset += attrib_desc.num_components * type_size; 
        if (attrib_desc.hasOwnProperty("divisor")) {
          gl.vertexAttribDivisor(attrib_desc.location, attrib_desc.divisor);
        }
      }
    }
  }
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function init(
    gl,
    num_particles,
    particle_birth_rate,
    min_age,
    max_age, 
    min_theta,
    max_theta,
    min_speed,
    max_speed,
    gravity
    ) {
  if (max_age < min_age) {
    throw "Invalid min-max age range.";
  }
  if (max_theta < min_theta ||
      min_theta < -Math.PI ||
      max_theta > Math.PI) {
    throw "Invalid theta range.";
  }
  if (min_speed > max_speed) {
    throw "Invalid min-max speed range.";
  }
  var update_program = createGLProgram(
    gl,
    [
      {name: "assets/shaders/compute.vert", type: gl.VERTEX_SHADER},
      {name: "assets/shaders/compute.frag", type: gl.FRAGMENT_SHADER},
    ],
    [
      "v_Position",
      "v_Age",
      "v_Seed",
      "v_Velocity",
    ]);
  var render_program = createGLProgram(
    gl,
    [
      {name: "assets/shaders/shading.vert", type: gl.VERTEX_SHADER},
      {name: "assets/shaders/shading.frag", type: gl.FRAGMENT_SHADER},
    ],
    null);
  var update_attrib_locations = {
    i_Position: {
      location: gl.getAttribLocation(update_program, "i_Position"),
      num_components: 2,
      type: gl.FLOAT
    },
    i_Age: {
      location: gl.getAttribLocation(update_program, "i_Age"),
      num_components: 1,
      type: gl.FLOAT
    },
    i_Seed: {
      location: gl.getAttribLocation(update_program, "i_Seed"),
      num_components: 2,
      type: gl.FLOAT
    },
    i_Velocity: {
      location: gl.getAttribLocation(update_program, "i_Velocity"),
      num_components: 2,
      type: gl.FLOAT
    }
  };
  var render_attrib_locations = {
    i_Position: {
      location: gl.getAttribLocation(render_program, "i_Position"),
      num_components: 2,
      type: gl.FLOAT
    },
    i_Age: {
      location: gl.getAttribLocation(render_program, "i_Age"),
      num_components: 1,
      type: gl.FLOAT
    },
    i_Seed: {
      location: gl.getAttribLocation(render_program, "i_Seed"),
      num_components: 2,
      type: gl.FLOAT
    }
  };
  var vaos = [
    gl.createVertexArray(),
    gl.createVertexArray(),
    gl.createVertexArray(),
    gl.createVertexArray()
  ];
  var buffers = [
    gl.createBuffer(),
    gl.createBuffer(),
  ];
var vao_desc = [
    {
      vao: vaos[0],
      buffers: [{
        buffer_object: buffers[0],
        stride: 4 * 7,
        attribs: update_attrib_locations
      }]
    },
    {
      vao: vaos[1],
      buffers: [{
        buffer_object: buffers[1],
        stride: 4 * 7,
        attribs: update_attrib_locations
      }]
    },
    {
      vao: vaos[2],
      buffers: [{
        buffer_object: buffers[0],
        stride: 4 * 7,
        attribs: render_attrib_locations
      }],
    },
    {
      vao: vaos[3],
      buffers: [{
        buffer_object: buffers[1],
        stride: 4 * 7,
        attribs: render_attrib_locations
      }],
    },
  ];
  var initial_data =
    new Float32Array(initialParticleData(num_particles, min_age, max_age));
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
  gl.bufferData(gl.ARRAY_BUFFER, initial_data, gl.STREAM_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[1]);
  gl.bufferData(gl.ARRAY_BUFFER, initial_data, gl.STREAM_DRAW);
  for (var i = 0; i < vao_desc.length; i++) {
    setupParticleBufferVAO(gl, vao_desc[i].buffers, vao_desc[i].vao);
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  var rg_noise_texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, rg_noise_texture);
  gl.texImage2D(gl.TEXTURE_2D,
                0, 
                gl.RG8,
                512, 512,
                0,
                gl.RG,
                gl.UNSIGNED_BYTE,
                randomRGData(512, 512));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var input_image_tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, input_image_tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, input_image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return {
    particle_sys_buffers: buffers,
    particle_sys_vaos: vaos,
    read: 0,
    write: 1,
    particle_update_program: update_program,
    particle_render_program: render_program,
    num_particles: initial_data.length / 7,
    old_timestamp: 0.0,
    rg_noise: rg_noise_texture,
    total_time: 0.0,
    born_particles: initial_data.length / 7,
    birth_rate: particle_birth_rate,
    gravity: gravity,
    origin: [-1000.0, -1000.0],
    min_theta: min_theta,
    max_theta: max_theta,
    min_speed: min_speed,
    max_speed: max_speed,
    input_image: input_image_tex
  };
}

function render(gl, state, timestamp_millis) {
  
  input_image.src = myp5._renderer.canvas.toDataURL("image/png");
  //caaaa.src = myp5._renderer.canvas.toDataURL("image/png");
  //console.log(myp5._renderer.canvas.toDataURL("image/png"));
  input_image.onload = function (){
    gl.bindTexture(gl.TEXTURE_2D, input_image_tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, input_image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    state.input_image = input_image_tex;
  }
    
  frameCount = frameCount + 1.0;

  var num_part = state.born_particles;
  var time_delta = 0.0;
  if (state.old_timestamp != 0) {
    time_delta = timestamp_millis - state.old_timestamp;
    if (time_delta > 500.0) {
      time_delta = 0.0;
    }
  }
  if (state.born_particles < state.num_particles) {
    state.born_particles = Math.min(state.num_particles,
                    Math.floor(state.born_particles + state.birth_rate * time_delta));
  }
  state.old_timestamp = timestamp_millis;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(state.particle_update_program);
  gl.uniform1f(
    gl.getUniformLocation(state.particle_update_program, "u_Time"),
    frameCount);
  gl.uniform1f(
      gl.getUniformLocation(state.particle_update_program, "u_Speed"),
      speed_prev);
  gl.uniform1f(
    gl.getUniformLocation(state.particle_update_program, "u_TotalTime"),
    state.total_time);
  gl.uniform2f(
    gl.getUniformLocation(state.particle_update_program, "u_Gravity"),
    state.gravity[0], state.gravity[1]);
  gl.uniform2f(
    gl.getUniformLocation(state.particle_update_program, "u_Origin"),
    state.origin[0],
    state.origin[1]);
  gl.uniform1f(
    gl.getUniformLocation(state.particle_update_program, "u_MinTheta"),
    state.min_theta);
  gl.uniform1f(
    gl.getUniformLocation(state.particle_update_program, "u_MaxTheta"),
    state.max_theta);
  gl.uniform1f(
    gl.getUniformLocation(state.particle_update_program, "u_MinSpeed"),
    state.min_speed);
  gl.uniform1f(
    gl.getUniformLocation(state.particle_update_program, "u_MaxSpeed"),
    state.max_speed);
  gl.uniform2f(
    gl.getUniformLocation(state.particle_update_program, "u_Resolution"),
    canvas.width,
    canvas.height);
  state.total_time += time_delta;
    
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, state.input_image);
  gl.uniform1i(
    gl.getUniformLocation(state.particle_update_program, "u_InputImage"),
    0);

  gl.bindVertexArray(state.particle_sys_vaos[state.read]);
  gl.bindBufferBase(
    gl.TRANSFORM_FEEDBACK_BUFFER, 0, state.particle_sys_buffers[state.write]);
  gl.enable(gl.RASTERIZER_DISCARD);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, num_part);
  gl.endTransformFeedback();
  gl.disable(gl.RASTERIZER_DISCARD);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
  gl.bindVertexArray(state.particle_sys_vaos[state.read + 2]);
  gl.useProgram(state.particle_render_program);
  gl.viewport(0, 0,
    gl.drawingBufferWidth, gl.drawingBufferHeight);
  // Set the clear color to darkish green.
  gl.clearColor(0.64, 0.64, 0.64, 1.0);
  // Clear the context with the newly set color. This is
  // the function call that actually does the drawing.
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  
  gl.uniform2f(
    gl.getUniformLocation(state.particle_render_program, "u_Resolution"),
    canvas.width,
    canvas.height);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, state.input_image);
  gl.uniform1i(
    gl.getUniformLocation(state.particle_update_program, "u_InputImage"),
  0);

  gl.drawArrays(gl.POINTS, 0, num_part);
  var tmp = state.read;
  state.read = state.write;
  state.write = tmp;
  repositionGui();

    var pc = particles_info["count"];
  if(count_prev != pc && notholding){
    count_prev = pc;
    
    state = resetState();
  }
  if(speed_prev != particles_info["speed"]){
    speed_prev = particles_info["speed"];
  }
  window.requestAnimationFrame(function(ts) { render(gl, state, ts); });

}

function reportWindowSize() {
    repositionCanvas(canvas)
}

function repositionGui(){
  var guiwi = document.getElementsByClassName("dg main a")[0].style.width;
  var ww = "235px";
  if(guiwi != ww){
    document.getElementsByClassName("dg main a")[0].style.width = ww
    document.getElementsByClassName("dg main a")[0].style.position = "absolute";
    document.getElementsByClassName("dg main a")[0].style.left = "30px";
    document.getElementsByClassName("dg main a")[0].style.top = "30px";
  }
}

function repositionCanvas(canvas){
    var win = window,
    doc = document,
    body = doc.getElementsByTagName('body')[0],
    ww = win.innerWidth || canvas.clientWidth || body.clientWidth,
    hh = win.innerHeight|| canvas.clientHeight|| body.clientHeight;
    
    win.onresize = reportWindowSize;
    if(isMobile()){
      canvas.width = ww;
      canvas.height = hh;
      canvas.style.borderWidth = "0px";
    }
    else{
      canvas.width = Math.min(ww, hh) - 130;
      canvas.height = Math.min(ww, hh) - 130;
    }

    console.log("canvas");
    canvas.style.position = 'absolute';
    canvas.style.left = ww/2 - canvas.width/2 + 'px';
    canvas.style.top = hh/2 - canvas.height/2 + 'px';
    
}

function resetState(){
  document.onmousemove = function(e) {
    var x = e.pageX - canvas.offsetLeft;
    var y = e.pageY - canvas.offsetTop;
    if(!isMobile())
      state.origin = [x, y];
  };
  
  canvas.ontouchmove = function(e) {
    var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
    var touch = evt.touches[0] || evt.changedTouches[0];
    var x = touch.pageX - this.offsetLeft;
    var y = touch.pageY - this.offsetTop;
    state.origin = [x, y];
  };
  
  canvas.ontouchend = function(e) {
    if(isMobile()){
      state.origin = [-1000, -1000];
    }
  };


    var state =
    init(
      webgl_context,
      count_prev, /* number of particles */
      0.5, /* birth rate */
      1.01, 1.15, /* life range */
      Math.PI/2.0 - 0.5, Math.PI/2.0 + 0.5, /* direction range */
      0.5, 1.0, /* speed range */
      [0.0, -0.8]
    ); /* gravity */
    return state;
}

function preventBehavior(e) {
  e.preventDefault(); 
};

function displayMessage(){
  const message = document.createElement("div");
  const l1 = document.createElement("div");
  const l2 = document.createElement("div");
  const l3 = document.createElement("img");

  var win = window,
  doc = document,
  body = doc.getElementsByTagName('body')[0],
  ww = win.innerWidth || canvas.clientWidth || body.clientWidth,
  hh = win.innerHeight|| canvas.clientHeight|| body.clientHeight;

  l1.innerHTML = "mobile devices not supported";
  l2.innerHTML = "here's an image";
  l3.src = "./assets/sample.png";
  l3.style.width = ww*0.8 + "px";
  
  l3.style.borderStyle = "solid";
  l3.style.borderWidth = "10px";
  l3.style.borderColor = "#b4b4b4";
  message.appendChild(l1);
  message.appendChild(document.createElement("br"));
  message.appendChild(l2);
  message.appendChild(document.createElement("br"));
  message.appendChild(document.createElement("br"));
  message.appendChild(l3);
  document.body.prepend(message);

  message.style.position = 'absolute';
  message.style.textAlign = 'center';
  message.style.white_space = 'pre';
  message.style.left = ww/2 - l1.offsetWidth/2 + 'px';
  message.style.top = hh/2 - ww*0.8*.73 + 'px';

  console.log(ww/2, l1.offsetWidth);
}

function main() {
    document.addEventListener("touchmove", preventBehavior, {passive: false});
   
    if(isMobile()){
      displayMessage();
      return;
    }
    canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    repositionCanvas(canvas);
    
    //text_canvas = p5.createGraphics(512, 512, WEBGL);
    // text_canvas = myp5._renderer.canvas.toDataURL("image/png");

    //caaaa = document.createElement("img");
    //caaaa.src = myp5._renderer.canvas.toDataURL("image/png");
    //caaaa.onload = function (){
    //  document.body.appendChild(caaaa);
    //}

    /*document.body.onmousedown = function() { 
      notholding = false;
    }
    document.body.onmouseup = function() {
      notholding = true;
    }*/
    
    window.addEventListener('mousedown', function() {
      notholding = false;
    });
    window.addEventListener('mouseup', function() {
      notholding = true;
    });
    window.addEventListener('touchstart', function() {
      notholding = false;
    });
    window.addEventListener('touchend', function() {
      notholding = true;
    });
    
    gui = new dat.GUI({name: 'My GUI'});
    gui.add(particles_info, 'count', 50000, 5000000);
    gui.add(particles_info, 'speed', 0.1, 3);
    txtinput_field = gui.add(particles_info, 'input', 0.1, 3).onFinishChange(function (value) {
      var strr = txtinput_field.getValue();
      strr = strr.slice(0, 7);
      txtinput_field.setValue(strr);
      myp5.reset(strr);
    });
    console.log(txtinput_field);

    repositionGui();
    webgl_context = canvas.getContext("webgl2");
    if (webgl_context != null) {
      document.body.prepend(canvas);
        input_image = new Image();
        //input_image.src = './assets/grafit.png';
        console.log("b", myp5._setupDone);
        
        input_image.src = myp5._renderer.canvas.toDataURL("image/png");
        //console.log(myp5._renderer.canvas.toDataURL("image/png"));
        input_image_tex = webgl_context.createTexture()
        input_image.onload = function (){
          var state = resetState();
          window.requestAnimationFrame(function(ts) { render(webgl_context, state, ts); });
        }
    }
    else {
      document.write("WebGL2 is not supported by your browser");
    }
}