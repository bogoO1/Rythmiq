uniform vec3 planePos;
uniform vec3 planeNormal;
uniform float max_intensity;
varying vec2 vUv;
varying float intensity;
varying vec4 worldPosition;
varying vec3 Oposition;
varying vec3 toPlane;
void main() {

	vUv = uv;
	Oposition = position;
	worldPosition = (modelMatrix*vec4(position, 1.0)); // Solved and consistent
	toPlane = worldPosition.xyz-planePos; // Vector from plane position to vertex position
	float distance = dot(toPlane, planeNormal); // Distance from the vertex to the plane
	// vec3 projectedPosition = distance*planeNormal; // Project position onto the plane normal position.xyz - 
	intensity = distance/max_intensity;

	gl_Position = (projectionMatrix*modelViewMatrix*vec4(position, 1.0));

}