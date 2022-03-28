#version 300 es
precision mediump float;

in float v_Age;
in vec2 v_Seed;
uniform float u_Colors;
uniform float u_Opacity;

out vec4 o_FragColor;

float power(float p, float g) {
    if (p < 0.5)
        return 0.5 * pow(2.*p, g);
    else
        return 1. - 0.5 * pow(2.*(1. - p), g);
}


/* From http://iquilezles.org/www/articles/palettes/palettes.htm */
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{  return a + b*cos( 6.28318*(c*t+d) ); }

void main() {
  vec4 magic = vec4(
    palette(v_Seed.y,
            vec3(1.0,0.25,0.5),
            vec3(0.5,0.5,0.5),
            vec3(1.0,0.7,0.8),
            vec3(0.0,0.15,0.40)),
            1.0)*.24;
  //if(v_Age > 100.)
  //  discard;
  //o_FragColor = vec4(0.0, 0.0, 0.0, .3*clamp(1. - v_Age/100., 0., 1.));

  //o_FragColor = vec4(0.0, 0.0, 0.0, 0. + .26*clamp(1. - v_Age/100., 0., 1.));

  float bww = u_Colors*.8;
  vec4 outcol_bw = vec4(.0, .0, .0, u_Opacity);
  vec4 outcol_col = vec4(0.0, 0.0, 0.0, u_Opacity);

  float camp = clamp(1. - v_Age/100., 0., 1.);
  
  vec4 col0 = vec4(.6, .6, .64, 1.)*u_Opacity;
  vec4 col1 = vec4(.69, .73, 0.21, 1.)*(.5 + v_Seed.y*1.5)*u_Opacity;
  vec4 col2 = vec4(0.3, .33, .99, 1.)*(.5 + v_Seed.y*1.5)*u_Opacity;
    

  if(v_Seed.y < 0.7)
    outcol_col = col0 + camp*(col1 - col0);
  else
    outcol_col = col0 + camp*(col2 - col0);
   //outcol_col = (col0 + camp*(col2 - col0)) + power((0.5 + 0.5*sin(v_Seed.y*3.14*2.)), 6.)*((col0 + camp*(col1 - col0)) - (col0 + camp*(col2 - col0)));
   //outcol_col = (col0 + camp*(col2 - col0)) + power(v_Seed.y, 6.)*((col0 + camp*(col1 - col0)) - (col0 + camp*(col2 - col0)));

  vec4 outc = outcol_bw + u_Colors*(outcol_col - outcol_bw);

  o_FragColor = outc;
}