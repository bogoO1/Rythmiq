import * as THREE from "three";

import AudioWall from "../audio_effects/audio_wall.js";
// import { setUpAudioBloom } from "../post_processing/bloom_effect/bloom_audio.js";
let audioWalls = [];

let color_effects_ordered = [
  undefined,
  "return mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), intensityC); // Blue to Red",
  "return mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.5, 0.0), intensityC); // blue to orange",
  "float pulse = 0.5+0.5*sin(3.14159*intensityC*2.0); // Pulsating effect \n return vec3(pulse, 0.0, 1.0-pulse);",
  "	return vec3(intensityC*0.5+0.5, intensityC*0.3+0.7, intensityC*0.2+0.8); // Soft pastels",
  `	vec3 intensityColor = vec3(0.5+0.5*cos(angle), 0.5+0.5*cos(angle+2.09439), 0.5+0.5*cos(angle+4.18879)); // Color wheel
	return intensityColor;
`,
  `	float red = intensityC*(0.5+0.5*cos(angle)); // Red varies with angle
	float green = intensityC*(0.5+0.5*sin(angle)); // Green varies with angle
	float blue = intensityC; // Blue is based on intensity
	return vec3(red, green, blue);
`,
  `	float pulse = 0.5+0.5*sin(normalizedTime*2.0*intensityC); // Pulsating effect
	float red = intensityC*pulse*(0.5+0.5*cos(angle));
	float green = intensityC*pulse*(0.5+0.5*sin(angle));
	float blue = intensityC*pulse; // Blue based on intensity
	return vec3(red, green, blue);
`,
  `	float pulse = 0.5+0.5*sin(normalizedTime*2.0); // Pulsating effect
	float red = intensityC*pulse*(0.5+0.5*cos(angle));
	float green = intensityC*pulse*(0.5+0.5*sin(angle));
	float blue = intensityC*pulse; // Blue based on intensity
	return vec3(red, green, blue);
`,
  `	float timeFactor = normalizedTime*0.25; // Slow time factor for smooth transition
	float hue = mod(intensityC+timeFactor+angle/180.0, 1.0); // Combine intensity, time, and angle
	return hsv2rgb2(vec3(hue, 1.0, 1.0)); // Convert to RGB
`,
  `   	float timeFactor = normalizedTime*2.0; // Speed of rotation
	float red = intensityC*(0.5+0.5*cos(angle+timeFactor));
	float green = intensityC*(0.5+0.5*sin(angle+timeFactor));
	float blue = intensityC*(0.5+0.5*cos(timeFactor)); // Vary blue with time
	return vec3(red, green, blue);

`,
  `	float timeFactor = normalizedTime*2.0; // Speed of rotation

	// Base color that changes with intensity
	vec3 baseColor = vec3(intensityC, 0.5*(1.0-intensityC), 1.0-intensityC); // Base color varies with intensity

	// Color-changing effect
	float red = baseColor.r*(0.5+0.5*cos(angle+timeFactor));
	float green = baseColor.g*(0.5+0.5*sin(angle+timeFactor));
	float blue = baseColor.b*(0.5+0.5*cos(timeFactor)); // Vary blue with time

	return vec3(red, green, blue);
`,
  `	float timeFactor = normalizedTime*2.0; // Speed of rotation

	// Base color that changes with intensity
	vec3 baseColor = vec3(intensityC, 0.5*(1.0-intensityC), 1.0-intensityC); // Base color varies with intensity

	// Color-changing effect
	float red = baseColor.r*(0.5+0.5*cos(timeFactor));
	float green = baseColor.g*(0.5+0.5*sin(timeFactor));
	float blue = baseColor.b*(0.5+0.5*cos(timeFactor)); // Vary blue with time

	return vec3(red, green, blue);
`,
  `	float timeFactor = normalizedTime*2.0; // Speed of rotation

	// Base color that changes with intensity
	vec3 baseColor = vec3(intensityC, 0.5*(1.0-intensityC), 1.0-intensityC); // Base color varies with intensity

	// Color-changing effect
	float red = baseColor.r*(0.5+0.5*cos(intensityC));
	float green = baseColor.g*(0.5+0.5*sin(intensityC));
	float blue = baseColor.b*(0.5+0.5*cos(intensityC)); // Vary blue with time

	return vec3(red, green, blue);
`,
  `   
    // Base color that changes with intensity
	vec3 baseColor = vec3(intensityC, 0.5*(1.0-intensityC), 1.0-intensityC); // Base color varies with intensity

    // Color-changing effect based on normalized time
	float red = baseColor.r*(0.5+0.5*cos(normalizedTime*3.14159)); // Smooth transition
	float green = baseColor.g*(0.5+0.5*sin(normalizedTime*3.14159)); // Smooth transition
	float blue = baseColor.b*(0.5+0.5*cos(normalizedTime*3.14159)); // Smooth transition

	return vec3(red, green, blue);
`,
];

const shuffle = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export function createAudioWalls(renderer, scene, camera) {
  const color_effects = shuffle(color_effects_ordered);

  audioWalls.push(
    new AudioWall(
      scene,
      new THREE.Vector3(-16, 5, -16),
      new THREE.Vector3(0, 5, 0),
      10,
      color_effects.pop() || undefined,
      5
    ),
    new AudioWall(
      scene,
      new THREE.Vector3(16, 5, -16),
      new THREE.Vector3(0, 5, 0),
      10,
      color_effects.pop() || undefined,
      5
    ),
    new AudioWall(
      scene,
      new THREE.Vector3(-16, 5, 16),
      new THREE.Vector3(0, 5, 0),
      10,
      color_effects.pop() || undefined,

      5
    ),
    new AudioWall(
      scene,
      new THREE.Vector3(16, 5, 16),
      new THREE.Vector3(0, 5, 0),
      10,
      color_effects.pop() || undefined,
      5
    ),
    new AudioWall(
      scene,
      new THREE.Vector3(0, 5, -47),
      new THREE.Vector3(0, 5, 0),
      10,
      color_effects.pop() || undefined,
      5
    )
  );

  (async () =>
    await Promise.all(
      audioWalls.map((audioWall) => audioWall.setMaterial())
    ))();

  setInterval(() => {
    const color_effects_i = shuffle(color_effects_ordered);
    (async () =>
      await Promise.all(
        audioWalls.map((audioWall) =>
          audioWall.setMaterial(color_effects_i.pop() || undefined)
        )
      ))();
  }, 5000);
  // (async () => await audioWall2.setMaterial())();
  //   (async () => await setUpAudioBloom(renderer, scene, camera))(); // must be called after audio wall is declared!!
}

export function renderAudioWalls(time) {
  audioWalls.forEach((audioWall) => audioWall.updateAudioWall(time));
}
