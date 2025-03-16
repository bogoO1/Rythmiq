uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

varying vec2 vUv;

void main() {

	vec4 baseColor = texture2D(baseTexture, vUv);
	vec4 bloomColor = texture2D(bloomTexture, vUv);

	if (baseColor.r>0.85||baseColor.g>0.5||baseColor.g>0.5) {
		
		gl_FragColor = baseColor+bloomColor*baseColor.a; // Use baseColor.a for blending
	} else {
		gl_FragColor = baseColor; //+ bloomColor * baseColor.a; // Use baseColor.a for blending
	}

				  // Blend the bloom color based on the base color's alpha

}