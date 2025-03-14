// main.js
import * as THREE from "three";
import { CameraCollision } from "./Interaction/collision.js";
import { WelcomeScreen } from "./loading_screen.js";
import { PlayerController } from "./Interaction/movement.js";
import { addWalls } from "./walls/default.js";
import AudioWall from "./audio_effects/audio_wall.js";
import render, { setUpBloom } from "./post_processing/setup_post.js";

import { createWalls } from "./walls.js";
import { createGradientSphere } from "./gradientSphere.js";
import { createGround } from "./ground.js";
import { addLight } from "./light.js";
import AudioReactiveSphere from "./audioSphere.js";
import { renderAudioWalls, createAudioWalls } from "./walls/audio_walls.js";
// import { Texture_Rotate, Texture_Scroll_X } from "./box_object/box_fragment.js";
import { createBoxes, updateBoxes } from "./box_object/cubes.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// console.log(getPhongFShader(1));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, -8);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);

let isRotating = false;
const { cube1, stars } = createBoxes(scene); // Create the boxes

// Add Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

//ground implementation
const groundGeometry = new THREE.PlaneGeometry(100, 100); // Adjust size as needed

// Load the granite tile texture
const loader = new THREE.TextureLoader();
const graniteTexture = loader.load("textures/granite_tile.png"); // Make sure to use the correct path where the texture is stored
graniteTexture.wrapS = graniteTexture.wrapT = THREE.RepeatWrapping;
graniteTexture.repeat.set(10, 10); // Adjust based on the size of your geometry and the scale of the texture

const welcomeScreen = new WelcomeScreen(scene, camera);
// Camera settings
camera.position.set(0, 0, 0); // Start at y = 0
const moveSpeed = 5; // Movement speed
const lookSpeed = 0.002; // Mouse sensitivity
let yaw = 0,
  pitch = 0; // Camera rotation angles
// Collision Detection System
const collisionSystem = new CameraCollision(scene);

//add lighting
addLight(scene);

//create ground
createGround(loader, scene);

//wall objects
createWalls(loader, scene, true);
createWalls(loader, scene);

//gradient object

const xPositions = [-4, 0, 4];
const yLevels = [9, 5, 1];
const zPositions = [-47, 47];

for (let z of zPositions.slice(1)) {
  for (let y of yLevels) {
    for (let x of xPositions) {
      createGradientSphere(scene, renderer, { x, y, z });
    }
  }
}
for (let z of zPositions) {
  for (let y of yLevels) {
    for (let x of xPositions) {
      createGradientSphere(scene, renderer, { x: z, y: y, z: x });
    }
  }
}

//Audio_Reactive Sphere
// Create an instance of AudioContext
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to start or resume AudioContext
function startAudioContext() {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

// audio reactive sphere.
document.addEventListener("click", startAudioContext, { once: true });

const audioSphere = new AudioReactiveSphere(scene, audioContext, {
  x: 40,
  y: 8,
  z: -44,
});
const audioSphere2 = new AudioReactiveSphere(scene, audioContext, {
  x: 44,
  y: 8,
  z: -40,
});
const audioSphere3 = new AudioReactiveSphere(scene, audioContext, {
  x: -40,
  y: 8,
  z: -44,
});
const audioSphere4 = new AudioReactiveSphere(scene, audioContext, {
  x: -44,
  y: 8,
  z: -40,
});
const audioSphere5 = new AudioReactiveSphere(scene, audioContext, {
  x: 40,
  y: 8,
  z: 44,
});
const audioSphere6 = new AudioReactiveSphere(scene, audioContext, {
  x: 44,
  y: 8,
  z: 40,
});
const audioSphere7 = new AudioReactiveSphere(scene, audioContext, {
  x: -40,
  y: 8,
  z: 44,
});
const audioSphere8 = new AudioReactiveSphere(scene, audioContext, {
  x: -44,
  y: 8,
  z: 40,
});

// Movement input tracking
const keys = {};
window.addEventListener("keydown", (event) => (keys[event.code] = true));
window.addEventListener("keyup", (event) => (keys[event.code] = false));

// Mouse movement tracking for look controls
document.body.requestPointerLock =
  document.body.requestPointerLock || document.body.mozRequestPointerLock;
document.addEventListener("click", () => {
  document.body.requestPointerLock();

  // Allow audio context to resume when played
  //creating a user interaction in order to play it in the web
  const audioContext = THREE.AudioContext.getContext();
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
});

//making the audio more clearer based on movement
document.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement === document.body) {
    yaw -= event.movementX * lookSpeed; // Rotate left/right
    pitch -= event.movementY * lookSpeed; // Rotate up/down
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)); // Clamp pitch (-90° to 90°)
  }
});

// Clock for framerate-independent movement
const clock = new THREE.Clock();
let isMoving = false;

const playerController = new PlayerController(camera, scene);
document.addEventListener("mousemove", playerController.handleMouseMove);
document.addEventListener("keydown", playerController.handleKeyDown);
document.addEventListener("keyup", playerController.handleKeyUp);

createAudioWalls(renderer, scene, camera);

(async () => await setUpBloom(renderer, scene, camera))(); // must be called after audio wall is declared!!

let time = 0;

function animate() {
  const deltaTime = clock.getDelta(); // Time since last frame
  time += deltaTime;
  playerController.update(deltaTime);
  requestAnimationFrame(animate);
  // audioWall2.updateAudioWall(time);

  // Render the scene
  //  renderer.render(scene, camera);
  renderAudioWalls(time);
  updateBoxes(cube1, stars, deltaTime, isRotating); // Update the boxes
  render();
}

animate();

window.addEventListener("keydown", onKeyPress);
function onKeyPress(event) {
  switch (event.key) {
    case "c":
      isRotating = true;
      break;
    default:
      break;
  }
}

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "c":
      isRotating = false;
      break;
    default:
      break;
  }
});

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
