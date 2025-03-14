import * as THREE from "three";
import { Texture_Rotate, Texture_Scroll_X } from "./box_fragment.js";
import { Box } from "./box_object.js";
import { Star } from "./stars/star_object.js";

export function createBoxes(scene) {
  const cube1 = new Box(scene, "", Texture_Rotate, [10, 16, -7]);
  // const cube2 = new Box(scene, "", Texture_Scroll_X, [-6, 10, -7]);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1, 50);
  pointLight.position.set(0, 10, 0);
  scene.add(pointLight);

  const starCenter = new THREE.Vector3(20, 10, 30); // Move stars here

  // first layer of stars stacked higher at y = 2
  const stars = [];
  for (let i = 0; i < 6; i++) {
    let angle = (Math.PI * 2 * i) / 6; // Spread evenly in a circular pattern
    let x = Math.cos(angle) * 5;
    let z = Math.sin(angle) * 5;
    stars.push(new Star(scene, [x, starCenter.y + 2, z]));
  }
  // Second layer of stars stacked higher at y = 5
  for (let i = 0; i < 6; i++) {
    let angle = (Math.PI * 2 * i) / 6;
    let x = Math.cos(angle) * 5;
    let z = Math.sin(angle) * 5;
    stars.push(new Star(scene, [x, starCenter.y + 5, z]));
  }
  return { cube1, stars };
}

export function updateBoxes(cube1, stars, deltaTime, isRotating) {
  cube1.update(deltaTime);

  const time = Date.now() * 0.002;
  const floatHeight = 1;
  cube1.mesh.position.y = 5 + Math.sin(time * 2) * floatHeight;
  cube1.mesh.rotation.y += THREE.MathUtils.degToRad(1);

  // Define new center position for orbiting stars
  const starCenter = new THREE.Vector3(15, 5, -35);

  // Circular motion parameters
  const orbitRadius = 5;
  const orbitSpeed = 3;
  const orbitTime = Date.now() * 0.001 * orbitSpeed;

  stars.forEach((star, index) => {
    let layerIndex = Math.floor(index / 6);
    let angleOffset = (Math.PI * 2 * index) / stars.length;
    let newX = starCenter.x + Math.cos(orbitTime + angleOffset) * orbitRadius;
    let newZ = starCenter.z + Math.sin(orbitTime + angleOffset) * orbitRadius;
    let newY = layerIndex === 0 ? starCenter.y + 2 : starCenter.y + 5;

    star.mesh.position.set(newX, newY, newZ);

    star.update(deltaTime);

    if (isRotating) {
      cube1.rotate("x", 15);
      star.mesh.rotation.y += THREE.MathUtils.degToRad(40) * deltaTime;
    }
  });
}
