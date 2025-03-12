// main.js
import * as THREE from "three";
import { CameraCollision } from "./collision.js";
import { WelcomeScreen } from "./loading_screen.js";
import { PlayerController } from "./movement.js";
import { addWalls } from "./walls/default.js";
import AudioWall from "./mic_effect/audio_wall.js";
import render, { setUpBloom } from "./bloom_effect/bloom_audio.js";

import { createWalls } from "./walls.js";
import { createGradientSphere } from './gradientSphere.js';
import { createGround } from "./ground.js";

// console.log(getPhongFShader(1));

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

const welcomeScreen = new WelcomeScreen(scene, camera);

const loader = new THREE.TextureLoader();
// Add Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);



// Camera settings
camera.position.set(0, 0, 5); // Start at y = 0
const moveSpeed = 5; // Movement speed
const lookSpeed = 0.002; // Mouse sensitivity
let yaw = 0,
  pitch = 0; // Camera rotation angles

// Collision Detection System
const collisionSystem = new CameraCollision(scene);


//create ground
createGround(loader,scene);

//wall objects
createWalls(loader, scene);

//Adel Shaders
//gradient object
createGradientSphere(scene, renderer);

//Audio_Reactive Sphere
const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const audioReactiveSphere = new THREE.Mesh(sphereGeometry, material);
audioReactiveSphere.position.set(0, 4, -10);
scene.add(audioReactiveSphere);

// Create an instance of AudioContext
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to start or resume AudioContext
function startAudioContext() {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

// Add event listener to the document
document.addEventListener('click', startAudioContext, { once: true });

// Access the microphone
navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    const microphone = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    microphone.connect(analyser);

    // FFT size for the analyser node
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function getVolume() {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      return sum / bufferLength;
    }

    function getColorBasedOnVolume(volume) {
      const hue = (volume / 255) * 720; // Map volume to a hue value in the HSL color space
      return new THREE.Color(`hsl(${hue}, 100%, 50%)`);
    }

    // Continuously update sphere size based on audio volume
    let currentColor = new THREE.Color(0xff0000);
    function update() {
      requestAnimationFrame(update);
      const volume = getVolume();
      const targetScale = Math.max(1, volume / 50); // Normalize volume to a suitable scale for your scene
      // Smoothly interpolate the scale
      audioReactiveSphere.scale.x +=
        (targetScale - audioReactiveSphere.scale.x) * 0.7;
      audioReactiveSphere.scale.y +=
        (targetScale - audioReactiveSphere.scale.y) * 0.7;
      audioReactiveSphere.scale.z +=
        (targetScale - audioReactiveSphere.scale.z) * 0.7;

      const targetColor = getColorBasedOnVolume(volume);
      currentColor.lerp(targetColor, 0.2);
      audioReactiveSphere.material.color = currentColor;
    }

    update();
  })
  .catch((err) => {
    console.error("Error accessing microphone:", err);
  });
  //adel code ends

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
