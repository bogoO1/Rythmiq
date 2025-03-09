uniform uint audio[512];
uniform float ambient, diffusivity, specularity, smoothness;
uniform vec4 shape_color;

void main() {
	// vec4 color = vec4(shape_color.xyz*ambient, shape_color.w);
	vec4 color = vec4(shape_color.xyz*ambient, float(audio[0])/255.0);

	gl_FragColor = color;
}