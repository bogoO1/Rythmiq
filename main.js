// main.js
import * as THREE from "three";
import { CameraCollision } from "./collision.js";
import { WelcomeScreen } from "./loading_screen.js";
import { PlayerController } from "./movement.js";
import { addWalls } from "./walls/default.js";
import AudioWall from "./mic_effect/audio_wall.js";
import render, { setUpBloom } from "./bloom_effect/bloom_audio.js";

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

let groundMaterial = new THREE.MeshPhongMaterial({
  map: graniteTexture, // Use the loaded granite texture
  shininess: 60, // Adjust this value for the desired glossiness of the ceramic-like surface
  specular: new THREE.Color("grey"), // Specular highlights to add reflective properties typical of polished granite
  side: THREE.DoubleSide, // Render both sides of the plane
});

//groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to lay flat
ground.position.y = -1; // Adjust height to align with the camera's y
scene.add(ground);

// Camera settings
camera.position.set(0, 0, 5); // Start at y = 0
const moveSpeed = 5; // Movement speed
const lookSpeed = 0.002; // Mouse sensitivity
let yaw = 0,
  pitch = 0; // Camera rotation angles

// Collision Detection System
const collisionSystem = new CameraCollision(scene);

//wall objects
const wallTexture = loader.load("textures/seaworn_sandstone_brick.png");
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(100, 10);

const wallMaterial = new THREE.MeshPhongMaterial({
  map: wallTexture,
  shininess: 10, // Reduced shininess for a matte look
  specular: new THREE.Color(0x222222),
});
const wall1Geometry = new THREE.BoxGeometry(100, 10, 0.5);

const wallFront = new THREE.Mesh(wall1Geometry, wallMaterial); //front
wallFront.position.set(0, 4, -50); // Adjust position accordingly

const wallBack = new THREE.Mesh(wall1Geometry, wallMaterial); //back
wallBack.position.set(0, 4, 50);

const wallLeft = new THREE.Mesh(wall1Geometry, wallMaterial); //back
wallLeft.rotation.y = Math.PI / 2;
wallLeft.position.set(-50, 4, 0);

const wallRight = new THREE.Mesh(wall1Geometry, wallMaterial); //back
wallRight.rotation.y = Math.PI / 2;
wallRight.position.set(50, 4, 0);

scene.add(wallFront);
scene.add(wallBack);
scene.add(wallLeft);
scene.add(wallRight);

//Adel Shaders
async function loadShader(url) {
  const response = await fetch(url);
  return response.text();
}
const vertexShader = await loadShader("shaders/gradient.vert");
const fragmentShader = await loadShader("shaders/gradient.frag");
const canvas = renderer.domElement;
const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    renderWidth: { value: canvas.width },
    renderHeight: { value: canvas.height },
  },
});
const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
const gradientSphere = new THREE.Mesh(sphereGeometry, shaderMaterial);
gradientSphere.position.set(20, 1, -10);

scene.add(gradientSphere);

//Audio_Reactive Sphere
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const audioReactiveSphere = new THREE.Mesh(sphereGeometry, material);
audioReactiveSphere.position.set(0, 4, -10);
scene.add(audioReactiveSphere);

// Create an instance of AudioContext
const audioContext = new AudioContext();

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
      const hue = (volume / 255) * 360; // Map volume to a hue value in the HSL color space
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
        (targetScale - audioReactiveSphere.scale.x) * 0.1;
      audioReactiveSphere.scale.y +=
        (targetScale - audioReactiveSphere.scale.y) * 0.1;
      audioReactiveSphere.scale.z +=
        (targetScale - audioReactiveSphere.scale.z) * 0.1;

      const targetColor = getColorBasedOnVolume(volume);
      currentColor.lerp(targetColor, 0.1);
      audioReactiveSphere.material.color = currentColor;
    }

    update();
  })
  .catch((err) => {
    console.error("Error accessing microphone:", err);
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
