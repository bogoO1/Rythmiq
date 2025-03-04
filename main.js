// main.js
import * as THREE from "three";
import { CameraCollision } from "./collision.js";
import { startAudio, getFrequencyData } from "./audio.js";
import { PlayerController } from "./movement.js";

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

// Movement input tracking
const keys = {};
window.addEventListener("keydown", (event) => (keys[event.code] = true));
window.addEventListener("keyup", (event) => (keys[event.code] = false));

// Mouse movement tracking for look controls
document.body.requestPointerLock =
  document.body.requestPointerLock || document.body.mozRequestPointerLock;
document.addEventListener("click", () => document.body.requestPointerLock());
document.addEventListener("mousemove", playerController.handleMouseMove);

// Clock for framerate-independent movement
const clock = new THREE.Clock();

document.addEventListener("keydown", playerController.handleKeyDown);
document.addEventListener("keyup", playerController.handleKeyUp);


// Start audio processing
document.addEventListener(
  "click",
  async () => {
    await startAudio();
  },
  { once: true }
);

function animate() {
  const deltaTime = clock.getDelta(); // Time since last frame
  playerController.update(deltaTime)
  requestAnimationFrame(animate);

  // Get frequency data
  const frequencyData = getFrequencyData();

  // Log some debug info
  if (frequencyData.some((value) => value > 0)) {
    console.log("Receiving audio data:", frequencyData);
  }

  // Visualization code
  const canvas = document.getElementById("audioVisualizer");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / frequencyData.length;
    const barHeightMultiplier = canvas.height / 256; // since frequency data is 0-255

    ctx.fillStyle = "#00ff00"; // Green bars
    frequencyData.forEach((value, index) => {
      const barHeight = value * barHeightMultiplier;
      ctx.fillRect(
        index * barWidth,
        canvas.height - barHeight,
        barWidth - 1,
        barHeight
      );
    });
  }

  // Render the scene
  renderer.render(scene, camera);
}

animate();
