import * as THREE from "three";
import { Texture_Rotate, Texture_Scroll_X } from "./box_fragment.js";
import { Box } from "./box_object.js";
import { Star } from "./stars/star_object.js";

export function createBoxes(scene) {
  const cube1 = new Box(scene, "", Texture_Rotate, [2, 0, 0]);
  const cube2 = new Box(scene, "", Texture_Scroll_X, [-2, 0, 0]);
  const star = new Star(scene, [0, 2, -20]);

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
