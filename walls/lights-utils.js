import * as THREE from "three";

export function addLights(scene, lights) {
  // lights are assumed to be valid for now.
  lights.forEach(({ light: lightProp, position }) => {
    const light = new THREE.PointLight(lightProp.color, lightProp.intensity);
    light.position.set(...position);
    scene.add(light);
  });
}
