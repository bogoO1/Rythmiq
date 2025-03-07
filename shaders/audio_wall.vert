precision mediump float;
#define FFT_SIZE 128
#define MAX_INTENSITY 255

uniform uint audio[FFT_SIZE];
uniform vec3 planePos;
uniform float maxDist;
varying vec2 fragCoord;
varying vec2 uVu;
varying vec3 transformedNormal;
varying vec3 worldPosition;
varying float intensity;

void main() {
	vec3 worldNormal = normalize(modelMatrix*vec4(normal, 0)).xyz;

	worldPosition = (modelMatrix*vec4(position, 1.0)).xyz; // Solved and consistent

	float dist = length(worldPosition-planePos)*1.0/maxDist; // constant and working well

	int intensityLevel = int(dist/maxDist*float(MAX_INTENSITY));

	intensity = float(audio[intensityLevel])/float(MAX_INTENSITY);

	vec4 originalPosition = projectionMatrix*modelViewMatrix*vec4(position+intensity*worldNormal, 1.0);

	gl_Position = originalPosition;

	transformedNormal = gl_Position.xyz; //vec3(dist, 0, 0); //vec3(dist, dist, dist);

}
