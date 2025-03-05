void main() {
	vec4 color = vec4(shape_color.xyz*ambient, shape_color.w);

	gl_FragColor = color;
}