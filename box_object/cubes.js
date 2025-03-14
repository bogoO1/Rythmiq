import * as THREE from "three";
import { Texture_Rotate } from "./boxFragment.js";
import { Box } from "./box_object.js";
import { Star } from "./stars/star_object.js";
export function createBoxes(scene) {
  const cube1 = new Box(scene, "", Texture_Rotate, [7, 3, -6]);
  const cube2 = new Box(scene, "", Texture_Rotate, [-7, 3, -6]);
  const star = new Star(scene, [0, 2, -20]);

  // Ensure uniforms are properly assigned after initialization
  [cube1, cube2].forEach((cube) => {
    if (cube.uniforms) {
      cube.uniforms.flowDirection01 = { value: new THREE.Vector2(1.0, 0.5) };
      cube.uniforms.flowDirection02 = { value: new THREE.Vector2(-0.5, 1.0) };
      cube.uniforms.flowSpeed01 = { value: 0.2 };
      cube.uniforms.flowSpeed02 = { value: 0.3 };
      cube.uniforms.repeat01 = { value: new THREE.Vector2(2.0, 2.0) };
      cube.uniforms.repeat02 = { value: new THREE.Vector2(3.0, 3.0) };
      cube.uniforms.light_intensity = { value: 0.5 }; // Initial light intensity
    } else {
      console.error("Cube uniforms not initialized properly");
    }
  });

  return { cube1, cube2, star };
}

export function updateBoxes(cube1, cube2, star, deltaTime, isRotating) {
  cube1.update(deltaTime);
  cube2.update(deltaTime);
  star.update(deltaTime);

  // Circular motion parameters
  const orbitRadius = 5; // Adjust the size of the orbit
  const orbitSpeed = 1.5; // Speed of circular motion
  const time = Date.now() * 0.001 * orbitSpeed; // Convert to seconds
  const floatHeight = 2; // Adjust the height of the float

  // Apply sinusoidal motion for floating effect
  cube1.mesh.position.y = 5 + Math.sin(time) * floatHeight;
  cube2.mesh.position.y = 5 + Math.cos(time) * floatHeight;

  // Update star position to follow a circular path
  const newX = Math.cos(time) * orbitRadius;
  const newZ = Math.sin(time) * orbitRadius;
  star.mesh.position.set(newX, 2, newZ - 20); // Keep y constant

  if (isRotating) {
    cube1.rotate("x", 15);
    cube2.rotate("y", 40);
    star.mesh.rotation.y += THREE.MathUtils.degToRad(40) * deltaTime; // Rotate the star
  }
}
