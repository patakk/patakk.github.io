#version 300 es
precision mediump float;

uniform float u_Time;
uniform vec2 u_Gravity;
uniform vec2 u_Origin;
uniform sampler2D u_InputImage;
uniform float u_MinTheta;
uniform float u_MaxTheta;
uniform float u_MinSpeed;
uniform float u_MaxSpeed;
uniform float u_Speed;

uniform vec2 u_Resolution;

in vec2 i_Position;
in float i_Age;
in vec2 i_Seed;
in vec2 i_Velocity;

out vec2 v_Position;
out float v_Age;
out vec2 v_Seed;
out vec2 v_Velocity;


vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
}

/* skew constants for 3d simplex functions */
const float F3 =  0.3333333;
const float G3 =  0.1666667;

/* 3d simplex noise */
float simplex3d(vec3 p) {
	 /* 1. find current tetrahedron T and it's four vertices */
	 /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
	 /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/
	 
	 /* calculate s and x */
	 vec3 s = floor(p + dot(p, vec3(F3)));
	 vec3 x = p - s + dot(s, vec3(G3));
	 
	 /* calculate i1 and i2 */
	 vec3 e = step(vec3(0.0), x - x.yzx);
	 vec3 i1 = e*(1.0 - e.zxy);
	 vec3 i2 = 1.0 - e.zxy*(1.0 - e);
	 	
	 /* x1, x2, x3 */
	 vec3 x1 = x - i1 + G3;
	 vec3 x2 = x - i2 + 2.0*G3;
	 vec3 x3 = x - 1.0 + 3.0*G3;
	 
	 /* 2. find four surflets and store them in d */
	 vec4 w, d;
	 
	 /* calculate surflet weights */
	 w.x = dot(x, x);
	 w.y = dot(x1, x1);
	 w.z = dot(x2, x2);
	 w.w = dot(x3, x3);
	 
	 /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
	 w = max(0.6 - w, 0.0);
	 
	 /* calculate surflet components */
	 d.x = dot(random3(s), x);
	 d.y = dot(random3(s + i1), x1);
	 d.z = dot(random3(s + i2), x2);
	 d.w = dot(random3(s + 1.0), x3);
	 
	 /* multiply d by w^4 */
	 w *= w;
	 w *= w;
	 d *= w;
	 
	 /* 3. return the sum of the four surflets */
	 return dot(d, vec4(52.0));
}

/* const matrices for 3d rotation */
const mat3 rot1 = mat3(-0.37, 0.36, 0.85,-0.14,-0.93, 0.34,0.92, 0.01,0.4);
const mat3 rot2 = mat3(-0.55,-0.39, 0.74, 0.33,-0.91,-0.24,0.77, 0.12,0.63);
const mat3 rot3 = mat3(-0.71, 0.52,-0.47,-0.08,-0.72,-0.68,-0.7,-0.45,0.56);

/* directional artifacts can be reduced by rotating each octave */
float simplex3d_fractal(vec3 m) {
    return   0.5333333*simplex3d(m*rot1)
			+0.2666667*simplex3d(2.0*m*rot2)
			+0.1333333*simplex3d(4.0*m*rot3)
			+0.0666667*simplex3d(8.0*m);
}

float power(float p, float g) {
    if (p < 0.5)
        return 0.5 * pow(2.*p, g);
    else
        return 1. - 0.5 * pow(2.*(1. - p), g);
}


void main() {
  
   vec2 pos = i_Position;
   vec2 vel = i_Velocity;
   vec2 acc = vec2(0., 0.);
   vec2 seed = i_Seed;
   vec2 resolution = u_Resolution;
   vec2 mouse = vec2(u_Origin.x, resolution.y - u_Origin.y);
   float speed = u_Speed;
   float time = u_Time;

	ivec2 ipos = ivec2(int(pos.x), int(pos.y));
	vec2 tc =  pos.xy/resolution.xy;
	tc.y = 1. - tc.y;
	float texcol = texture(u_InputImage, tc).r*1.;

	float tttime = time*0.00015 + pos.x/resolution.x;
	tttime = mod(tttime, 1.0);
	tttime = pow(tttime, 5.);
   tttime = 0.0;
	float ttime = floor(time) + tttime;
	vec2 posss = pos.xy/resolution.x;
	vec3 nzpp = vec3(posss.x, posss.y, ttime*0.002);
	float incx = clamp(4. + round(power(simplex3d(nzpp+vec3(0.2589, 0.4891, 1.131)), 4.)*16.), 5., 16.);
	float incy = clamp(4. + round(power(simplex3d(nzpp+vec3(3.2589, 0.4891, 44.131)), 4.)*16.), 5., 16.);
	vec2 poss = pos.xy/resolution.x;
   incx = 1. + 3. * power(clamp(simplex3d_fractal(vec3(mod(time, 1000.0)*0.001 + pos.y/resolution.y*.06)), -1., 1.)/2.+.5, 4.);
   float incxx = 1. + 3. * power(clamp(simplex3d_fractal(vec3(mod(time, 1000.0)*0.001 + pos.y/resolution.y*.06 + .1251)), -1., 1.)/2.+.5, 4.);
   float incyy = 1. + 3. * power(clamp(simplex3d_fractal(vec3(mod(time, 1000.0)*0.001 + pos.y/resolution.y*.06+ .8888)), -1., 1.)/2.+.5, 4.);
   incy = 1. + 1. * power(clamp(simplex3d_fractal(vec3(mod(time, 1000.0)*0.001 + pos.x/resolution.x*.03 + .41)), -1., 1.)/2.+.5, 4.);
	poss.x = round(incx*poss.x)/incx + round(incxx)*0.5;
	poss.y = round(incy*poss.y)/incy + round(incyy)*0.5;
	vec3 nzp = vec3(poss.x, poss.y, ttime*0.002)*2.;
   vec2 noisexy = vec2(0., 0.);
   float qq = clamp(simplex3d(nzp*0.5+vec3(0.2589, 0.4891, 5.1311)), -1.0, 1.0);

   float r = .6;
   if(length(pos.xy/resolution.xy-.5) < 0.1){
      //r *= 4.;
   }

   float ang = 7.*simplex3d(nzp*0.527*qq);
   float ang2 = 47.*simplex3d(nzp*0.527*qq);
   //ang = 66.*simplex3d(nzp*.527*qq + time*0.02);


   noisexy.x = r*cos(ang)*1.5 + 0.0*r*cos(ang2);
   noisexy.y = r*sin(ang)*.5 + 0.0*r*sin(ang2);

	vec2 fromMouse = pos - mouse;
	float tomouselen = length(fromMouse);
	if(tomouselen < resolution.x*0.1){
		fromMouse = fromMouse / tomouselen;
		fromMouse = fromMouse * (1. - tomouselen/resolution.x*0.1);
		fromMouse *= 5.;
	}
	else{
		fromMouse = vec2(0.0);
	}

	ivec2 noise_coord = ivec2(int(pos.x), int(pos.y));

   acc.x = noisexy.x + fromMouse.x;
   acc.y = noisexy.y + fromMouse.y;

   float drag = 0.95 + 0.04 * i_Seed.y;
   drag = drag  - (texcol)*.2;


   //vel = vel + acc*1.05;
   vel = vel + .1*vec2(1.,1.)+acc*.991;
   vel = vel * drag;

   
   pos = pos + vel*speed;
   
   //age += u_TimeDelta;

   v_Age = i_Age + 1.0;
   if(texcol > 0.0){
	   v_Age = 0.0;
   }
   if(pos.x >= resolution.x){
      pos.x = pos.x - resolution.x;
	   v_Age = 11110.0;
   }
   if(pos.y > resolution.y){
      pos.y = pos.y - resolution.y;
	   v_Age = 11110.0;
   }
   if(pos.x < 0.0){
      pos.x = pos.x + resolution.x;
	   v_Age = 11110.0;
   }
   if(pos.y < 0.0){
      pos.y = pos.y + resolution.y;
	   v_Age = 11110.0;
   }

   v_Position = pos;
   v_Velocity = vel;
   v_Seed = i_Seed;
}