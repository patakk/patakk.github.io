#version 300 es
precision mediump float;

uniform vec2 u_Resolution;

in vec2 i_Position;
in float i_Age;
in vec2 i_Seed;
uniform sampler2D u_InputImage;

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
  vec2 tc = i_Position/u_Resolution;
  tc.y = 1. - tc.y;
	float texcol = 1. - texture(u_InputImage, tc).r;
  //gl_PointSize = 3.*texcol;
  gl_PointSize = ps;
  gl_Position = vec4(pos, 0.0, 1.0);
}