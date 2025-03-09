// main.js
import * as THREE from "three";
import { PlayerController } from "./movement.js";
import { addWalls } from "./walls/default.js";
// import AudioSphere from "./mic_effect/audio_sphere.js";
import AudioWall from "./mic_effect/audio_wall.js";
import render, { setUpBloom } from "./bloom_effect/bloom_audio.js";
import { setUpCustomAudio } from "./custom_audio.js";
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

// Camera settings
camera.position.set(0, 0, 5); // Start at y = 0

addWalls(scene);

// Clock for framerate-independent movement
const clock = new THREE.Clock();

const playerController = new PlayerController(camera, scene);
document.addEventListener("mousemove", playerController.handleMouseMove);
document.addEventListener("keydown", playerController.handleKeyDown);
document.addEventListener("keyup", playerController.handleKeyUp);

const audioWall = new AudioWall(
  camera,
  scene,
  new THREE.Vector3(0, 5, -7),
  new THREE.Vector3(0, 5, 0),
  25,
  15
);

// const audioWall2 = new AudioWall(
//   camera,
//   scene,
//   new THREE.Vector3(0, 10, -40),
//   new THREE.Vector3(0, 5, 0),
//   25,
//   15
// );

(async () => await audioWall.setMaterial())();
// (async () => await audioWall2.setMaterial())();
(async () => await setUpBloom(renderer, scene, camera))(); // must be called after audio wall is declared!!

let time = 0;

function animate() {
  const deltaTime = clock.getDelta(); // Time since last frame
  time += deltaTime;
  playerController.update(deltaTime);
  requestAnimationFrame(animate);

  audioWall.updateAudioWall(time);
  // audioWall2.updateAudioWall(time);

  // Render the scene
  //  renderer.render(scene, camera);
  render();
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
