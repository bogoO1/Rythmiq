import * as THREE from "three";
import { Texture_Rotate, Texture_Scroll_X } from "./box_fragment.js";
import { Box } from "./box_object.js";
import { Star } from "./stars/star_object.js";

export function createBoxes(scene) {
  const cube1 = new Box(scene, "", Texture_Rotate, [10, 14, -7]);
  // const cube2 = new Box(scene, "", Texture_Scroll_X, [-6, 10, -7]);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1, 50);
  pointLight.position.set(0, 10, 0);
  scene.add(pointLight);

  // first layer of stars stacked higher at y = 2
  const stars = [];
  for (let i = 0; i < 6; i++) {
    let angle = (Math.PI * 2 * i) / 6; // Spread evenly in a circular pattern
    let x = Math.cos(angle) * 5;
    let z = Math.sin(angle) * 5;
    stars.push(new Star(scene, [x, 2, z - 20]));
  }
  // Second layer of stars stacked higher at y = 5
  for (let i = 0; i < 6; i++) {
    let angle = (Math.PI * 2 * i) / 6;
    let x = Math.cos(angle) * 5;
    let z = Math.sin(angle) * 5;
    stars.push(new Star(scene, [x, 5, z - 20]));
  }
  return { cube1, stars };
}

export function updateBoxes(cube1, stars, deltaTime, isRotating) {
  cube1.update(deltaTime);

  const time = Date.now() * 0.002;
  const floatHeight = 1;
  cube1.mesh.position.y = 5 + Math.sin(time * 2) * floatHeight;
  cube1.mesh.rotation.y += THREE.MathUtils.degToRad(1);

  // Circular motion parameters for stars
  const orbitRadius = 5;
  const orbitSpeed = 3;
  const orbitTime = Date.now() * 0.001 * orbitSpeed;

  stars.forEach((star, index) => {
    let layerIndex = Math.floor(index / 6);
    let angleOffset = (Math.PI * 2 * index) / stars.length;
    let newX = Math.cos(orbitTime + angleOffset) * orbitRadius;
    let newZ = Math.sin(orbitTime + angleOffset) * orbitRadius;
    let newY = layerIndex === 0 ? 2 : 5;
    star.mesh.position.set(newX, newY, newZ - 10);

    // ✅ Make sure the shader animation time updates
    star.update(deltaTime);

    if (isRotating) {
      cube1.rotate("x", 50);
      star.mesh.rotation.y += THREE.MathUtils.degToRad(40) * deltaTime;
    }
  });
}
