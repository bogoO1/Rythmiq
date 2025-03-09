precision mediump float;
#define FFT_SIZE 512

#define PI 3.14159
uniform uint audio[FFT_SIZE];
uniform float ambient, diffusivity, specularity, smoothness;
uniform vec4 shape_color;
uniform float maxDist;
uniform vec3 planePos;

varying vec3 outVec; // Receive the world position from the vertex shader
varying float intensity;
varying vec3 normalizedVertexToEye;
varying vec3 worldNormal;
varying vec3 worldPosition;
flat varying int intensityLevel;

vec3 hsv2rgb2(vec3 c) {
	vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
	vec3 p = abs(fract(c.xxx+K.xyz)*6.0-K.www);
	return c.z*mix(K.xxx, clamp(p-K.xxx, 0.0, 1.0), c.y);
}

void main() {
	// use diff to get dirivative to calculate the new normal, must be calculated in the fragment shader to prevent interpolation.
	// calc approx distance using hte max distance / 512

	vec3 outVec = normalize(worldPosition-planePos);

	vec4 color = vec4(shape_color.xyz*ambient, shape_color.w);
	// vec4 color = vec4(shape_color.xyz*ambient, float(audio[0])/255.0);
	float diff;

	if (intensityLevel==511) {
		diff = float(audio[intensityLevel-1]-audio[intensityLevel]);
	} else {
		diff = float(audio[intensityLevel]-audio[intensityLevel+1]);
	}

	float depth = maxDist/float(FFT_SIZE);

	vec3 normal = normalize(depth*outVec+diff*worldNormal);

	float angle = acos(dot(normalizedVertexToEye, normal)); // Calculate the angle in radians

	// if (angle*180.0/PI<45.0) {
	// 	discard;
	// }

	// Normalize the world position to a range of 0.0 to 1.0 for color output
	// vec4 positionColor = (color+1.0)*0.5; // Assuming worldPosition is in the range of -1.0 to 1.0
	float intensityC = clamp(((intensity-0.5)*2.0), 0.0, 1.0);
	gl_FragColor = vec4(normal.xyz, 1.0);
	// gl_FragColor = vec4(hsv2rgb2(vec3(intensityC, 1.0, 1.0)), intensityC); // Interpolate color across the rainbow based on intensity
}