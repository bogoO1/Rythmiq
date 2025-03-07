precision mediump float;

uniform uint audio[128];
uniform float ambient, diffusivity, specularity, smoothness;
uniform vec4 shape_color;

varying vec3 transformedNormal; // Receive the transformed normal from the vertex shader
varying vec3 worldPosition; // Receive the world position from the vertex shader
varying float intensity;

void main() {
	vec4 color = vec4(shape_color.xyz*ambient, shape_color.w);
	// vec4 color = vec4(shape_color.xyz*ambient, float(audio[0])/255.0);

	// Normalize the world position to a range of 0.0 to 1.0 for color output
	// vec4 positionColor = (color+1.0)*0.5; // Assuming worldPosition is in the range of -1.0 to 1.0
	gl_FragColor = vec4(color.xyz, clamp((intensity), 0.0, 1.0)); // Set the fragment color to the world position color
}