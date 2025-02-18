let fragmentShaderPhong, vertexShaderPhong;
try {
  fragmentShaderPhong = await (await fetch("./shaders/phong.frag")).text();
  vertexShaderPhong = await (await fetch("./shaders/phong.vert")).text();
} catch (error) {
  console.error("Error loading shaders:", error);
  fragmentShaderPhong = ""; // Set to an empty string to prevent crashes
  vertexShaderPhong = "";
}

export function getPhongFShader(numLights) {
  return fragmentShaderPhong
    .replaceAll("numLights", numLights)
    .replaceAll("N_LIGHTS", numLights);
}

export function getPhongVShader(numLights) {
  return vertexShaderPhong
    .replaceAll("numLights", numLights)
    .replaceAll("N_LIGHTS", numLights);
}

// TODO: Use Function Below as a Draft to Update Uniforms
export function updatePlanetMaterialUniforms(planet) {
  const material = planet.material;
  if (!material.uniforms) return;

  const uniforms = material.uniforms;

  const numLights = 1;
  const lights = scene.children
    .filter((child) => child.isLight)
    .slice(0, numLights);
  // Ensure we have the correct number of lights
  if (lights.length < numLights) {
    console.warn(
      `Expected ${numLights} lights, but found ${lights.length}. Padding with default lights.`
    );
  }

  // Update model_transform and projection_camera_model_transform
  planet.updateMatrixWorld();
  camera.updateMatrixWorld();

  uniforms.model_transform.value.copy(planet.matrixWorld);
  uniforms.projection_camera_model_transform.value
    .multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    .multiply(planet.matrixWorld);

  // Update camera_center
  uniforms.camera_center.value.setFromMatrixPosition(camera.matrixWorld);

  // Update squared_scale (in case the scale changes)
  const scale = planet.scale;
  uniforms.squared_scale.value.set(
    scale.x * scale.x,
    scale.y * scale.y,
    scale.z * scale.z
  );

  // Update light uniforms
  uniforms.light_positions_or_vectors.value = [];
  uniforms.light_colors.value = [];
  uniforms.light_attenuation_factors.value = [];

  for (let i = 0; i < numLights; i++) {
    const light = lights[i];
    if (light) {
      let position = new THREE.Vector4();
      if (light.isDirectionalLight) {
        // For directional lights
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
          light.quaternion
        );
        position.set(direction.x, direction.y, direction.z, 0.0);
      } else if (light.position) {
        // For point lights
        position.set(light.position.x, light.position.y, light.position.z, 1.0);
      } else {
        // Default position
        position.set(0.0, 0.0, 0.0, 1.0);
      }
      uniforms.light_positions_or_vectors.value.push(position);

      // Update light color
      const color = new THREE.Vector4(
        light.color.r,
        light.color.g,
        light.color.b,
        1.0
      );
      uniforms.light_colors.value.push(color);

      // Update attenuation factor
      let attenuation = 0.0;
      if (light.isPointLight || light.isSpotLight) {
        const distance = light.distance || 1000.0; // Default large distance
        attenuation = 1.0 / (distance * distance);
      } else if (light.isDirectionalLight) {
        attenuation = 0.0; // No attenuation for directional lights
      }
      // Include light intensity
      const intensity = light.intensity !== undefined ? light.intensity : 1.0;
      attenuation *= intensity;

      uniforms.light_attenuation_factors.value.push(attenuation);
    } else {
      // Default light values
      uniforms.light_positions_or_vectors.value.push(
        new THREE.Vector4(0.0, 0.0, 0.0, 0.0)
      );
      uniforms.light_colors.value.push(new THREE.Vector4(0.0, 0.0, 0.0, 1.0));
      uniforms.light_attenuation_factors.value.push(0.0);
    }
  }
}
