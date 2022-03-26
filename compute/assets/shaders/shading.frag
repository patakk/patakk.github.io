#version 300 es
precision mediump float;

in float v_Age;
in vec2 v_Seed;

out vec4 o_FragColor;

/* From http://iquilezles.org/www/articles/palettes/palettes.htm */
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{  return a + b*cos( 6.28318*(c*t+d) ); }

void main() {
  /*o_FragColor = vec4(
    palette(t,
            vec3(0.5,0.5,0.5),
            vec3(0.5,0.5,0.5),
            vec3(1.0,0.7,0.4),
            vec3(0.0,0.15,0.20)),
            1.0);*/
  o_FragColor = vec4(0.0, 0.0, 0.0, 0.3);
}