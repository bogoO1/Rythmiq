uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
uniform vec3 planeNormal;
uniform vec3 planePos;

varying vec2 vUv;
varying vec4 worldPosition;
varying vec3 Oposition;
varying vec3 toPlane;

vec3 hsv2rgb2(vec3 c) {
	vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
	vec3 p = abs(fract(c.xxx+K.xyz)*6.0-K.www);
	return c.z*mix(K.xxx, clamp(p-K.xxx, 0.0, 1.0), c.y);
}

void main() {

	vec4 baseColor = texture2D(baseTexture, vUv);
	vec4 bloomColor = texture2D(bloomTexture, vUv);

	// vec3 toPlaneCust = worldPosition.xyz-planePos; // Vector from plane position to vertex position

	if (baseColor.a==0.0) {
		// float intensity = baseColor.r;
		// vec4 shapeColor = vec4(hsv2rgb2(vec3(intensity, 1.0, 1.0)), intensity);
		gl_FragColor = vec4(baseColor.rgb, 1.0);//+bloomColor*baseColor.a;
	} else {
		gl_FragColor = baseColor+bloomColor*baseColor.a;
		//bloomColor*baseColor.a*clamp(intensity, 0.0, 1.0);//vec4(1.0, 1.0, clamp(intensity, 0.0, 1.0), 1.0); //baseColor+bloomColor*intensity; // Blend bloom color based on intensity
	}

	// if (intensity>0.5) {
	// 	gl_FragColor = baseColor+bloomColor*intensity; // Use baseColor.a for blending
	// } else {
	// 	gl_FragColor = baseColor; //+ bloomColor * baseColor.a; // Use baseColor.a for blending
	// }
	// Blend the bloom color based on the base color's alpha

}