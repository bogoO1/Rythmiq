// main.js
import * as THREE from "three";

import render, { setUpBloom } from "./post_processing/setup_post.js";

import { renderAudioWalls, createAudioWalls } from "./walls/audio_walls.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// console.log(getPhongFShader(1));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const dist = 1.05;

camera.position.set(
  -4.453531390979526 * dist,
  1.3515462205496045 * dist,
  -6.50687182625235 * dist
);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Clock for framerate-independent movement
const clock = new THREE.Clock();

createAudioWalls(renderer, scene, camera);

(async () => await setUpBloom(renderer, scene, camera))(); // must be called after audio wall is declared!!

let time = 0;

function animate() {
  const deltaTime = clock.getDelta(); // Time since last frame
  time += deltaTime;

  requestAnimationFrame(animate);

  controls.update();

  renderAudioWalls(time);
  render();
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
