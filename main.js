// main.js
import * as THREE from "three";
import { PlayerController } from "./movement.js";
import { addWalls } from "./walls/default.js";
import AudioSphere from "./mic_effect/setup.js";
// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const playerController = new PlayerController(camera, scene);

// Camera settings
camera.position.set(0, 0, 5); // Start at y = 0

addWalls(scene);

// Clock for framerate-independent movement
const clock = new THREE.Clock();
document.addEventListener("mousemove", playerController.handleMouseMove);

document.addEventListener("keydown", playerController.handleKeyDown);
document.addEventListener("keyup", playerController.handleKeyUp);

const sphere = new AudioSphere(camera, scene);

(async () => await sphere.setMaterial())();

let time = 0;

function animate() {
  const deltaTime = clock.getDelta(); // Time since last frame
  time += deltaTime;
  playerController.update(deltaTime);
  requestAnimationFrame(animate);

  sphere.updateAudioSphere(time);

  // Render the scene
  renderer.render(scene, camera);
}

animate();
