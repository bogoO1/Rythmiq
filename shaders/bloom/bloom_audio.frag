uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
uniform vec3 planeNormal;
uniform vec3 planePos;

varying vec2 vUv;
varying vec4 worldPosition;

vec3 hsv2rgb2(vec3 c) {
	vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
	vec3 p = abs(fract(c.xxx+K.xyz)*6.0-K.www);
	return c.z*mix(K.xxx, clamp(p-K.xxx, 0.0, 1.0), c.y);
}

void main() {

	vec4 baseColor = texture2D(baseTexture, vUv);
	vec4 bloomColor = texture2D(bloomTexture, vUv);

	if (baseColor.a==0.0) {
		// float intensity = baseColor.r;
		gl_FragColor = vec4(baseColor.rgb, 1.0);//+bloomColor*baseColor.a;
	} else {
		gl_FragColor = baseColor+bloomColor*baseColor.a;
	}
}