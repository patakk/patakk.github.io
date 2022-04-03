
varying vec4 vColor;
varying vec2 vSize;
varying float vAngle;
varying float vIndex;

void main() {
    vec2 xyclip = 2.*(gl_PointCoord.xy - .5);
    vec2 xyrot;
    xyrot.x = xyclip.x * cos(vAngle) - xyclip.y * sin(vAngle);
    xyrot.y = xyclip.x * sin(vAngle) + xyclip.y * cos(vAngle);


    float ratio = vSize.x/vSize.y;
    float ms = max(vSize.x, vSize.y);
    float mms = min(vSize.x, vSize.y);

    xyrot.y *= ms/vSize.y;
    xyrot.x *= ms/vSize.x;


    float dist = length(xyrot);
    float alpha = 1. - smoothstep(0.4, 0.5, dist);
    gl_FragColor = vec4( vColor.rgb, alpha*vColor.a );
}