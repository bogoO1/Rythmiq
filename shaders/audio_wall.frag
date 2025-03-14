precision mediump float;
#define FFT_SIZE FFT_SIZE_REPLACE
#define MAX_INTENSITY_INDEX FFT_SIZE_REPLACE_1 // max index 511

#define FFT_INTENSITY_STEP 0.003921 //255
#define PI 3.14159
uniform float audio[FFT_SIZE];
uniform float ambient, diffusivity, specularity, smoothness;
uniform vec4 shape_color;
uniform float maxDist;
uniform vec3 planePos;
uniform float time;

varying vec3 outVec; // Receive the world position from the vertex shader
varying float intensity;
varying vec3 worldNormal;
varying vec3 worldPosition;
flat varying int intensityLevel;

vec3 hsv2rgb2(vec3 c) {
	vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
	vec3 p = abs(fract(c.xxx+K.xyz)*6.0-K.www);
	return c.z*mix(K.xxx, clamp(p-K.xxx, 0.0, 1.0), c.y);
}

vec3 getIntensityColor(float intensityC, float angle, float time) {
	// Normalize time to a range of [0, 1] for smooth color transitions
	float normalizedTime = sin(time*5.0)*0.5+0.5;

	INTENSITY_COLOR;
}

void main() {
	// use diff to get dirivative to calculate the new normal, must be calculated in the fragment shader to prevent interpolation.
	// calc approx distance using hte max distance / 512
	// Transform the world position to view space
	vec4 eyePosition = inverse(viewMatrix)*vec4(0.0, 0.0, 0.0, 1.0);

	// Calculate the vector from the vertex in view space to the eye position
	vec3 vertexToEye = worldPosition-eyePosition.xyz;

	// You can normalize this vector if needed
	vec3 normalizedVertexToEye = normalize(vertexToEye);

	vec3 outVec = normalize(worldPosition-planePos);

	vec4 color = vec4(shape_color.xyz*ambient, shape_color.w);
	// vec4 color = vec4(shape_color.xyz*ambient, float(audio[0])/255.0);
	float diff;

	if (intensityLevel>=FFT_SIZE_REPLACE_1) {
		// diff = float(audio[intensityLevel-1]-audio[intensityLevel]);
		discard;
	} else {
		diff = float(audio[intensityLevel+1]-audio[intensityLevel]);
	}

	float depth = maxDist/float(FFT_SIZE);

	vec3 normal = normalize(depth*outVec+(abs(diff))*worldNormal);
	// vec3 normal = normalize(abs(diff*FFT_INTENSITY_STEP)*outVec+depth*worldNormal);

	if (intensityLevel<2) {
		normal = worldNormal;
	}

	float angleDot = dot(normal, worldNormal);

	if (angleDot>1.0) {
		discard;
	}

	float angle = 180.0*acos(angleDot)/PI; // Calculate the angle in radians 

	// if (angle>90.0||intensity<=0.00) { // angle<40.0||
	// 	discard;
	// }

	// Normalize the world position to a range of 0.0 to 1.0 for color output
	// vec4 positionColor = (color+1.0)*0.5; // Assuming worldPosition is in the range of -1.0 to 1.0
	float intensityC = clamp(intensity, 0.0, 1.0);

	if (intensityC<=0.01) {
		discard;
	}

	// Encode intensity in the red channel
	float encodedIntensity = intensityC;

	// Optionally encode other data (e.g., depth) in the green channel
	float depthValue = length(worldPosition-planePos)/maxDist; // Normalize depth
	depthValue = clamp(depthValue, 0.0, 1.0); // Ensure it's in the range [0, 1]

	// Encode a unique identifier for the audio wall in the blue channel

	float audioWallIdentifier = 0.0; // Use 0.0 to indicate this is an audio wall pixel
	vec3 intensityColor = getIntensityColor(intensityC, angle, time);
	// Set the output color with encoded data
	gl_FragColor = vec4(intensityColor, audioWallIdentifier);
}