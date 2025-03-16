// gradient.frag
uniform float renderWidth;
uniform float renderHeight;

void main() {
    float yIntensity = gl_FragCoord.y / float(renderHeight);
    float xIntensity = gl_FragCoord.x / float(renderWidth); 
    gl_FragColor = vec4(xIntensity, yIntensity, 0.6 - yIntensity, 0.9);
}
