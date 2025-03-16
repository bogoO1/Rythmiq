uniform sampler2D encodedTexture;

void main() {
	vec4 encodedData = texture2D(encodedTexture, vUv);

	float intensity = encodedData.r; // Read intensity from red channel
	float depth = encodedData.g; // Read depth from green channel
	float isAudioWall = encodedData.b; // Read identifier from blue channel

    // Only apply bloom effect if this pixel is from the audio wall
	if (isAudioWall>0.5) { // Check if the identifier indicates an audio wall
        // Apply bloom effect logic here
        // ...
	} else {
        // Skip bloom effect for non-audio wall pixels
		discard; // or set to a default value
	}
}