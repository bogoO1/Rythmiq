#define FFT_SIZE FFT_SIZE_REPLACE //512
#define MAX_INTENSITY_INDEX FFT_SIZE_REPLACE_1 // max index 511

uniform float audio[FFT_SIZE];

varying vec2 vUv;
varying float intensity;
varying vec4 worldPosition;
varying vec3 Oposition;
varying vec3 toPlane;
void main() {

	vUv = uv;
	Oposition = position;
	worldPosition = (modelMatrix*vec4(position, 1.0)); // Solved and consistent
	toPlane = worldPosition.xyz-vec3(0.0, 0.0, 0.0); // Vector from plane position to vertex position
	float distance = dot(toPlane, vec3(0.0, 1.0, 0.0)); // Distance from the vertex to the plane
	// vec3 projectedPosition = distance*planeNormal; // Project position onto the plane normal position.xyz - 
	intensity = distance/127.0;

	gl_Position = (projectionMatrix*modelViewMatrix*vec4(position, 1.0));

}
// give this function the fft to give screen effect???