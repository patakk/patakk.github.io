attribute vec4 color;
attribute vec2 size;
attribute float angle;
attribute float index;

varying vec4 vColor;
varying vec2 vSize;
varying float vAngle;
varying float vIndex;

uniform float u_time;
uniform float u_scrollscale;

void main() {
    //vAlpha = alpha;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    float pscale = max(size.x, size.y)*4. + 0.*5.*sin(u_time/60.*5. + .074414313*index);
    gl_PointSize = pscale * u_scrollscale;
    gl_Position = projectionMatrix * mvPosition;

    // drawing animation
    //if(index/2250. > u_time)
    //    gl_PointSize = 0.;

    vColor = color;
    vSize = size;
    vAngle = angle;
    vIndex = index;
}