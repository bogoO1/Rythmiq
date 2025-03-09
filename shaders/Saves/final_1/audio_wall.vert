precision mediump float;
#define FFT_SIZE FFT_SIZE_REPLACE //512
#define MAX_INTENSITY_INDEX FFT_SIZE_REPLACE_1 // max index 511

uniform uint audio[FFT_SIZE];
uniform vec3 planePos;
uniform float maxDist;
uniform float max_depth_intensity;

varying vec2 fragCoord;
varying vec2 uVu;
varying float intensity;
varying vec3 worldNormal;
flat varying int intensityLevel;

varying vec3 worldPosition;
// varying int diff;

void main() {
	worldNormal = normalize(modelMatrix*vec4(normal, 0)).xyz;

	worldPosition = (modelMatrix*vec4(position, 1.0)).xyz; // Solved and consistent

	float dist = length(worldPosition-planePos)/maxDist; // constant and working well

	float intensityF = dist*float(MAX_INTENSITY_INDEX);
	float intensityRemainder = fract(intensityF);
	intensityLevel = clamp(int(intensityF), 0, 511);

	intensity = (float(audio[intensityLevel])*(1.0-intensityRemainder)+float(audio[intensityLevel+1])*intensityRemainder)/float(255); // interpolate between the next intensity level and the current one.

	vec4 originalPosition = projectionMatrix*modelViewMatrix*vec4(position+max_depth_intensity*intensity*worldNormal, 1.0);

	gl_Position = originalPosition; // projectionMatrix*modelViewMatrix*vec4(position, 1.0);//

}
