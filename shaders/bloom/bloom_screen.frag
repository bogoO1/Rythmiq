#define FFT_SIZE FFT_SIZE_REPLACE //512
#define MAX_INTENSITY_INDEX FFT_SIZE_REPLACE_1 // max index 511

uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
uniform float audio[FFT_SIZE];

varying vec2 vUv;
varying float intensity;
varying vec4 worldPosition;
varying vec3 Oposition;

void main() {

	vec4 baseColor = texture2D(baseTexture, vUv);
	vec4 bloomColor = texture2D(bloomTexture, vUv);

	gl_FragColor = baseColor+vec4(audio[0], audio[1], audio[2], 128.0)/128.0; //bloomColor*baseColor.a*clamp(intensity, 0.0, 1.0);//vec4(1.0, 1.0, clamp(intensity, 0.0, 1.0), 1.0); //baseColor+bloomColor*intensity; // Blend bloom color based on intensity

	// if (intensity>0.5) {
	// 	gl_FragColor = baseColor+bloomColor*intensity; // Use baseColor.a for blending
	// } else {
	// 	gl_FragColor = baseColor; //+ bloomColor * baseColor.a; // Use baseColor.a for blending
	// }
	// Blend the bloom color based on the base color's alpha

}