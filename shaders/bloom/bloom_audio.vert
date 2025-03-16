uniform vec3 planePos;
uniform vec3 planeNormal;
uniform float max_intensity;

varying vec2 vUv;
varying vec4 worldPosition;
void main() {
	vUv = uv;
	vec4 worldPosition = (modelMatrix*vec4(position, 1.0)); // Solved and consistent
	vec3 toPlane = worldPosition.xyz-planePos; // Vector from plane position to vertex position
	float distance = dot(toPlane, planeNormal); // Distance from the vertex to the plane

	gl_Position = (projectionMatrix*modelViewMatrix*vec4(position, 1.0));

}