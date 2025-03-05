// main.js
import * as THREE from "three";
import { startAudio, getFrequencyData } from "./audio.js";
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

// Start audio processing
document.addEventListener(
  "click",
  async () => {
    await startAudio();
  },
  { once: true }
);

const sphere = new AudioSphere(camera, scene);

(() => sphere.setMaterial())();

function animate() {
  const deltaTime = clock.getDelta(); // Time since last frame
  playerController.update(deltaTime);
  requestAnimationFrame(animate);

  // Get frequency data
  const frequencyData = getFrequencyData();

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
