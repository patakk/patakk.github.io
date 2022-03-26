var frameCount = Math.random()*10000.;

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
    data.push(Math.random());

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
    gravity) {
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
    origin: [0.0, 0.0],
    min_theta: min_theta,
    max_theta: max_theta,
    min_speed: min_speed,
    max_speed: max_speed
  };
}

function render(gl, state, timestamp_millis) {
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
  gl.bindTexture(gl.TEXTURE_2D, state.rg_noise);
  gl.uniform1i(
    gl.getUniformLocation(state.particle_update_program, "u_RgNoise"),
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
  gl.clearColor(0.7, 0.7, 0.7, 1.0);
  // Clear the context with the newly set color. This is
  // the function call that actually does the drawing.
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  
  gl.uniform2f(
    gl.getUniformLocation(state.particle_render_program, "u_Resolution"),
    canvas.width,
    canvas.height);
  gl.drawArrays(gl.POINTS, 0, num_part);
  var tmp = state.read;
  state.read = state.write;
  state.write = tmp;
  window.requestAnimationFrame(function(ts) { render(gl, state, ts); });
}

var canvas;

function reportWindowSize() {
    repositionCanvas(canvas)
}

function repositionCanvas(canvas){
    var win = window,
    doc = document,
    body = doc.getElementsByTagName('body')[0],
    ww = win.innerWidth || canvas.clientWidth || body.clientWidth,
    hh = win.innerHeight|| canvas.clientHeight|| body.clientHeight;
    
    win.onresize = reportWindowSize;
    canvas.width = ww;
    canvas.height = hh;

    console.log("canvas");
    canvas.style.position = 'absolute';
    canvas.style.left = ww/2 - canvas.width/2 + 'px';
    canvas.style.top = hh/2 - canvas.height/2 + 'px';
}

function main() {
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    repositionCanvas(canvas);
    var webgl_context = canvas.getContext("webgl2");
    if (webgl_context != null) {
      document.body.appendChild(canvas);
      var state =
        init(
          webgl_context,
          1111111, /* number of particles */
          0.5, /* birth rate */
          1.01, 1.15, /* life range */
          Math.PI/2.0 - 0.5, Math.PI/2.0 + 0.5, /* direction range */
          0.5, 1.0, /* speed range */
          [0.0, -0.8]); /* gravity */
  
      /* Makes the particle system follow the mouse pointer */
      canvas.onmousemove = function(e) {
        var x = 2.0 * (e.pageX - this.offsetLeft)/this.width - 1.0; 
        var y = -(2.0 * (e.pageY - this.offsetTop)/this.height - 1.0);
        state.origin = [x, y];
      };
      window.requestAnimationFrame(
        function(ts) { render(webgl_context, state, ts); });
    } else {
      document.write("WebGL2 is not supported by your browser");
    }
  }