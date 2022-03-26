#version 300 es
precision mediump float;

uniform vec2 u_Resolution;

in vec2 i_Position;
in float i_Age;
in vec2 i_Seed;

out float v_Age;
out vec2 v_Seed;

void main() {
  v_Age = i_Age;
  vec2 pos = i_Position/u_Resolution*2.0 - 1.0;
  //gl_PointSize = 1.0 + 6.0 * (1.0 - i_Age/i_Seed);
  float ps = i_Seed.x;
  if(ps < 0.998){
    ps = 1.+.14*ps;
  }
  else{
    ps = 2. + 1.*ps;
  }
  gl_PointSize = ps;
  gl_Position = vec4(pos, 0.0, 1.0);
}